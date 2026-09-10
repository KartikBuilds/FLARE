import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

/** An hourglass with the sand already settled — time run out on recovery. */
export function HourglassGlyph({ title = "An hourglass, sand settled", decorative = false, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("hourglass-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 140 200"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4} angle={45} opacity={0.3} />
      </defs>
      {/* frame */}
      <rect x="20" y="10" width="100" height="10" rx="3" stroke="currentColor" strokeWidth="2.25" />
      <rect x="20" y="180" width="100" height="10" rx="3" stroke="currentColor" strokeWidth="2.25" />
      <line x1="30" y1="20" x2="30" y2="180" stroke="currentColor" strokeWidth="2.25" />
      <line x1="110" y1="20" x2="110" y2="180" stroke="currentColor" strokeWidth="2.25" />

      {/* glass silhouette */}
      <path
        d="M34 22 L106 22 L70 96 L106 178 L34 178 L70 96 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* settled sand at the base */}
      <path d="M46 178 L94 178 L82 150 L58 150 Z" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="1.5" />
      <path d="M64 100 L76 100 L70 108 Z" fill="currentColor" opacity="0.5" />

      {/* trace of the empty top chamber */}
      <path d="M40 26 L100 26 L70 90" stroke="currentColor" strokeWidth="1" opacity="0.35" />
    </IllustrationFrame>
  );
}
