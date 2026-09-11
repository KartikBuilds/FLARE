import * as React from "react";
import { IllustrationFrame } from "./shared";
import type { IllustrationProps } from "./shared";

const ROCKS = [
  "M8 4 L14 8 L10 15 L3 12 Z",
  "M4 6 L11 4 L13 11 L6 14 Z",
  "M2 5 L9 2 L12 9 L5 12 L1 9 Z",
];

/** A single small floating rock fragment — scattered around the moon/planet scenes. */
export function DebrisField({ variant = 0, title, decorative = true, className, ...props }: IllustrationProps & { variant?: 0 | 1 | 2 }) {
  return (
    <IllustrationFrame title={title} decorative={decorative} viewBox="0 0 16 18" className={className} fill="none" {...props}>
      <path d={ROCKS[variant % ROCKS.length]} fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="0.75" />
    </IllustrationFrame>
  );
}
