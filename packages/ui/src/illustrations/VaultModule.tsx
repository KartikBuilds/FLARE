import * as React from "react";
import { IllustrationFrame, HatchDef, Bolt, useIllustrationId, round2 } from "./shared";
import type { IllustrationProps } from "./shared";

/** The vault: a riveted drum with a diamond-locked door — where assets sit. */
export function VaultModule({ title = "Vault holding protocol assets", decorative = false, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("vault-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 220 220"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={5} angle={45} opacity={0.3} />
      </defs>
      {/* drum body */}
      <rect x="10" y="20" width="200" height="180" rx="18" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <rect x="10" y="20" width="200" height="180" rx="18" fill="none" stroke="currentColor" strokeWidth="2.25" />
      {/* outer bolt ring on the housing corners */}
      <Bolt cx={26} cy={36} r={3.4} />
      <Bolt cx={194} cy={36} r={3.4} />
      <Bolt cx={26} cy={184} r={3.4} />
      <Bolt cx={194} cy={184} r={3.4} />
      {/* door */}
      <circle cx="110" cy="110" r="70" fill="var(--color-paper, #eeece3)" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="110" cy="110" r="58" fill="none" stroke="currentColor" strokeWidth="1.25" strokeDasharray="1 5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={round2(110 + 70 * Math.cos(angle))}
            cy={round2(110 + 70 * Math.sin(angle))}
            r="2.6"
            fill="currentColor"
          />
        );
      })}
      {/* diamond dial, echoing FlareMark/asset motif */}
      <path
        d="M110 78 L142 110 L110 142 L78 110 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M110 78 L110 142 M78 110 L142 110" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="110" cy="110" r="4" fill="currentColor" />
      {/* handle spokes */}
      {[45, 135, 225, 315].map((angle) => (
        <line
          key={angle}
          x1={round2(110 + 20 * Math.cos((angle * Math.PI) / 180))}
          y1={round2(110 + 20 * Math.sin((angle * Math.PI) / 180))}
          x2={round2(110 + 34 * Math.cos((angle * Math.PI) / 180))}
          y2={round2(110 + 34 * Math.sin((angle * Math.PI) / 180))}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </IllustrationFrame>
  );
}
