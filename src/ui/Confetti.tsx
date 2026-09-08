import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  /** Pieces thrown. A flawless run gets more paper than a scrape-through. */
  pieces?: number;
  /**
   * The cap, not the plan: a burst normally ends when the last piece has fallen
   * off the bottom edge, around two and a half seconds in. This is what stops a
   * full-screen canvas painting forever if something keeps a piece airborne.
   */
  durationMs?: number;
}

/**
 * The palette, read from the live theme rather than hard-coded: the brand
 * colours are set at runtime from the app config, so an institute build throws
 * its own colours. These four are plain hex tokens — the derived `--accent`
 * roles are `color-mix()` expressions, which not every canvas will parse.
 */
const COLOR_TOKENS = ['--brand-from', '--brand-to', '--brand-accent-from', '--brand-accent-to'];
const FALLBACK_COLORS = ['#22c55e', '#0d9488', '#f97316', '#ea580c'];

/** Pixels per frame², at 60fps. Enough weight that the paper falls, not floats. */
const GRAVITY = 0.34;
/** Air, roughly: sideways travel bleeds off, downward travel does not. */
const DRAG = 0.99;
/** A frame longer than this is a backgrounded tab, not a slow one. */
const MAX_FRAME_MS = 50;
/** The tail of the run, over which every piece fades out. */
const FADE_MS = 800;

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radians, and the spin that changes it. */
  rot: number;
  vr: number;
  /** Phase of the flip that makes a flat rectangle read as tumbling paper. */
  flip: number;
  vf: number;
  w: number;
  h: number;
  color: string;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Two cannons, from the bottom corners, angled inward.
 *
 * Not a rain from the top: the result is read from the top of the page down,
 * and paper falling through the headline numbers obscures the one thing the
 * screen exists to show. Fired upward from the corners, the arc peaks in the
 * margins and clears the middle by the time it comes back down.
 */
function launch(count: number, width: number, height: number, colors: string[]): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const left = i % 2 === 0;
    const spread = rand(0.35, 1) * (width * 0.5);
    return {
      x: left ? -10 : width + 10,
      y: height + rand(0, 40),
      vx: (left ? 1 : -1) * rand(5, 13) * (spread / (width * 0.5)),
      vy: -rand(15, 26),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.22, 0.22),
      flip: rand(0, Math.PI * 2),
      vf: rand(0.08, 0.2),
      w: rand(6, 11),
      h: rand(9, 16),
      color: colors[i % colors.length] as string,
    };
  });
}

/**
 * A burst of paper over the whole viewport, for a result worth the noise.
 *
 * Deliberately not a dependency: a confetti library is a few hundred lines of
 * canvas and this app ships offline, so pulling one in would mean vendoring a
 * bundle to animate rectangles. It is also why this draws rectangles rather
 * than sprites — no assets to load, and it stays legible in both themes.
 *
 * Mount it to fire it; it removes itself when the paper has landed. Honours
 * `prefers-reduced-motion` by rendering nothing at all, which is the whole
 * point of the setting for an animation that exists purely as decoration.
 */
export function Confetti({ pieces = 90, durationMs = 3200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  useEffect(() => {
    if (done) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const style = getComputedStyle(document.documentElement);
    const colors = COLOR_TOKENS.map((token, i) => {
      const value = style.getPropertyValue(token).trim();
      return value || (FALLBACK_COLORS[i] as string);
    });

    let width = window.innerWidth;
    let height = window.innerHeight;
    // Drawing happens in CSS pixels; the transform below does the scaling, so
    // nothing else in here has to know about the device ratio.
    const size = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);

    const confetti = launch(pieces, width, height, colors);
    const startedAt = performance.now();
    let last = startedAt;
    let frame = 0;

    const draw = (now: number) => {
      // Normalised to a 60fps frame, so the fall takes the same time on a 144Hz
      // panel as on a 60Hz one instead of being twice as fast.
      const dt = Math.min(now - last, MAX_FRAME_MS) / (1000 / 60);
      last = now;
      const elapsed = now - startedAt;
      const fade = Math.max(0, Math.min(1, (durationMs - elapsed) / FADE_MS));

      ctx.clearRect(0, 0, width, height);
      let visible = 0;

      for (const p of confetti) {
        p.vy += GRAVITY * dt;
        p.vx *= DRAG ** dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        // Below the screen *and* still falling is gone for good. Below it and
        // rising is a piece that has not been fired yet — every cannon starts
        // just under the bottom edge, so a plain "off the bottom" test would
        // report the whole burst as finished on its first frame.
        if (p.y - p.h > height && p.vy > 0) continue;
        visible++;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // A flat rectangle squashed on one axis reads as a sheet turning over.
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      // Stop on whichever comes first: the clock, or the last piece leaving the
      // screen. Without the second test a burst that clears early would keep a
      // full-screen canvas painting nothing for another two seconds.
      if (elapsed >= durationMs || visible === 0) {
        ctx.clearRect(0, 0, width, height);
        setDone(true);
        return;
      }
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', size);
    };
  }, [done, pieces, durationMs]);

  if (done || typeof document === 'undefined') return null;

  // Portalled to the body: `fixed` is measured against the nearest ancestor
  // holding a transform or filter, and half the app's panels have one.
  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 h-full w-full print:hidden"
    />,
    document.body,
  );
}
