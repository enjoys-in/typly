import type { Finger } from '@/core/keyboard/layout';

/**
 * Finger groups are categorical data, not status, so they are an intentional
 * exemption from the semantic roles: `accent`/`danger` would imply good/bad, and
 * five groups have to stay distinguishable regardless of the accent preset.
 * Fixed hues, with explicit dark variants since they are not tokens. Kept
 * low-saturation so the keyboard does not compete with the passage.
 */
export const FINGER_BG: Record<Finger, string> = {
  pinky: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200',
  ring: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  middle: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200',
  index: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200',
  thumb: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
};

export const FINGER_DOT: Record<Finger, string> = {
  pinky: 'bg-purple-400',
  ring: 'bg-blue-400',
  middle: 'bg-green-400',
  index: 'bg-orange-400',
  thumb: 'bg-slate-400',
};

export const FINGER_LABEL: Record<Finger, string> = {
  pinky: 'Pinky',
  ring: 'Ring',
  middle: 'Middle',
  index: 'Index',
  thumb: 'Thumb',
};
