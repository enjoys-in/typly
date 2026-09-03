// Minimal PNG reader/writer and image maths, with no dependencies.
//
// Every icon Typly ships (the Windows .ico files, the Linux icon theme, the tray
// and the splash mark) is derived from the single 1024px source at
// build/icon.png, so the brand can never drift between the dock, the tray and
// the installer. That means
// reading a PNG, resizing it well, and writing it back — which is all this file
// does. It deliberately supports only what our own source file uses (8-bit
// truecolour, non-interlaced) and throws clearly on anything else.

import { deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Images are passed around as `{ width, height, data }`, where `data` is
// width*height*4 bytes of non-premultiplied RGBA.

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, 'ascii');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0);
  return Buffer.concat([head, body, tail]);
}

/** Number of channels stored per pixel for each PNG colour type. */
const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

/** Reads an 8-bit, non-interlaced PNG into RGBA8. */
export function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG');

  let offset = 8;
  let header = null;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      header = {
        width: body.readUInt32BE(0),
        height: body.readUInt32BE(4),
        depth: body[8],
        colorType: body[9],
        interlace: body[12],
      };
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
  }

  if (!header) throw new Error('PNG has no header');
  const channels = CHANNELS[header.colorType];
  if (header.depth !== 8 || !channels || header.interlace !== 0) {
    throw new Error(
      `unsupported PNG (depth ${header.depth}, colour type ${header.colorType}, interlace ${header.interlace})`,
    );
  }

  const { width, height } = header;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(stride * height);

  // Undo the per-scanline filter. Each line is prefixed with its filter type and
  // refers back to the pixel to its left (a) and the line above (b, c).
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? out[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`unknown PNG filter ${filter}`);
      out[x] = value & 0xff;
    }
  }

  // Widen whatever we read to RGBA so callers only ever handle one layout.
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const src = i * channels;
    const dst = i * 4;
    if (channels === 4) {
      pixels.copy(data, dst, src, src + 4);
    } else if (channels === 3) {
      data[dst] = pixels[src];
      data[dst + 1] = pixels[src + 1];
      data[dst + 2] = pixels[src + 2];
      data[dst + 3] = 255;
    } else if (channels === 2) {
      data.fill(pixels[src], dst, dst + 3);
      data[dst + 3] = pixels[src + 1];
    } else {
      data.fill(pixels[src], dst, dst + 3);
      data[dst + 3] = 255;
    }
  }
  return { width, height, data };
}

/** Writes an RGBA8 image as a PNG (filter 0, which zlib compresses well enough). */
export function encodePng(image) {
  const { width, height, data } = image;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Area-average resize. Alpha is premultiplied first, so a transparent edge
 * cannot bleed its (arbitrary) colour into the pixels beside it — the halo you
 * see when an icon is scaled down naively.
 */
export function resize(image, width, height) {
  const out = Buffer.alloc(width * height * 4);
  const scaleX = image.width / width;
  const scaleY = image.height / height;

  for (let y = 0; y < height; y += 1) {
    const y0 = Math.floor(y * scaleY);
    const y1 = Math.max(y0 + 1, Math.ceil((y + 1) * scaleY));
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.floor(x * scaleX);
      const x1 = Math.max(x0 + 1, Math.ceil((x + 1) * scaleX));

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = y0; sy < Math.min(y1, image.height); sy += 1) {
        for (let sx = x0; sx < Math.min(x1, image.width); sx += 1) {
          const i = (sy * image.width + sx) * 4;
          const alpha = image.data[i + 3] / 255;
          r += image.data[i] * alpha;
          g += image.data[i + 1] * alpha;
          b += image.data[i + 2] * alpha;
          a += alpha;
          n += 1;
        }
      }

      const dst = (y * width + x) * 4;
      const alpha = a / n;
      out[dst] = alpha > 0 ? Math.round(r / n / alpha) : 0;
      out[dst + 1] = alpha > 0 ? Math.round(g / n / alpha) : 0;
      out[dst + 2] = alpha > 0 ? Math.round(b / n / alpha) : 0;
      out[dst + 3] = Math.round(alpha * 255);
    }
  }
  return { width, height, data: out };
}
