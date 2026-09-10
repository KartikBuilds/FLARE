import * as React from "react";
import { IllustrationFrame } from "./shared";

interface FlareMarkProps {
  className?: string;
  size?: number;
}

/**
 * The FLARE mark: a containment ring with a single deliberate breach — an
 * asset's exit path escaping the vault. Original geometric mark, not a
 * trace of the reference screenshots.
 */
export function FlareMark({ className, size = 24 }: FlareMarkProps) {
  return (
    <IllustrationFrame
      decorative
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="45 7"
        strokeLinecap="round"
        transform="rotate(-45 12 12)"
      />
      <path
        d="M7.5 16.5 18 6M18 6v3.6M18 6h-3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </IllustrationFrame>
  );
}
