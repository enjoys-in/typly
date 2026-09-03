// Windows .ico writer.
//
// An .ico is a directory of images at different sizes; Windows picks the one it
// needs (16px in a window title, 32px on the desktop, 256px in the installer
// header). Every entry here carries a PNG payload, which Windows has read since
// Vista and which keeps the file a fraction of the size of raw bitmaps.

const DIR_ENTRY_BYTES = 16;

/** `images` is `[{ size, png }]`, largest last is not required. */
export function encodeIco(images) {
  if (images.length === 0) throw new Error('an .ico needs at least one image');

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon (2 would be a cursor)
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(DIR_ENTRY_BYTES * images.length);
  let offset = header.length + directory.length;

  images.forEach(({ size, png }, index) => {
    const at = index * DIR_ENTRY_BYTES;
    // 256 is stored as 0: the field is a single byte.
    directory[at] = size >= 256 ? 0 : size;
    directory[at + 1] = size >= 256 ? 0 : size;
    directory[at + 2] = 0; // palette size (0 = truecolour)
    directory[at + 3] = 0; // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(png.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });

  return Buffer.concat([header, directory, ...images.map((image) => image.png)]);
}
