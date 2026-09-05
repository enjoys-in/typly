import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * The standard panel.
 *
 * A hairline border *and* a soft shadow, not one or the other: the border keeps
 * the edge crisp against a light canvas, the shadow lifts the panel off it. In
 * dark mode `shadow-e1` resolves to an inset top highlight instead, because a
 * black shadow on a near-black canvas does nothing.
 */
export function Card({ children, className = '' }: Props) {
  return (
    <div
      className={`panel-lit rounded-panel border border-line bg-surface p-6 shadow-e1 ${className}`}
    >
      {children}
    </div>
  );
}
