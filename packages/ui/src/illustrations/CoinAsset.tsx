import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId, round2 } from "./shared";
import type { IllustrationProps } from "./shared";

/** A faceted asset coin — the diamond motif echoes the FLARE mark. */
export function CoinAsset({ title = "A digital asset", decorative = false, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("coin-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4} angle={35} opacity={0.35} />
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="1.25" strokeDasharray="1 4" />
      <path
        d="M50 22 L72 50 L50 78 L28 50 Z M50 22 L50 78 M28 50 L72 50"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M50 22 L61 50 L50 50 Z" fill="currentColor" opacity="0.12" />
      {[0, 90, 180, 270].map((angle) => (
        <circle
          key={angle}
          cx={round2(50 + 42 * Math.cos((angle * Math.PI) / 180))}
          cy={round2(50 + 42 * Math.sin((angle * Math.PI) / 180))}
          r="2.2"
          fill="currentColor"
        />
      ))}
    </IllustrationFrame>
  );
}
