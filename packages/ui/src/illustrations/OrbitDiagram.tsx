import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId, round2 } from "./shared";
import type { IllustrationProps } from "./shared";

const SATELLITES = [
  { angle: -20, orbit: "a" as const },
  { angle: 160, orbit: "a" as const },
  { angle: 60, orbit: "b" as const },
  { angle: 250, orbit: "b" as const },
];

/** The FLARE model of a protocol: a core asset orbited by the concepts that
 * determine whether it can leave again — used on the docs overview page. */
export function OrbitDiagram({ title = "FLARE's model of a protocol", decorative = false, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("orbit-hatch");
  const rxA = 150;
  const ryA = 60;
  const rxB = 90;
  const ryB = 110;

  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 340 220"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4.5} angle={20} opacity={0.25} />
      </defs>

      <ellipse cx="170" cy="110" rx={rxA} ry={ryA} stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" opacity="0.55" />
      <ellipse cx="170" cy="110" rx={rxB} ry={ryB} stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" opacity="0.55" />

      {/* core asset */}
      <circle cx="170" cy="110" r="34" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M170 90 L188 110 L170 130 L152 110 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />

      {SATELLITES.map((sat, i) => {
        const rx = sat.orbit === "a" ? rxA : rxB;
        const ry = sat.orbit === "a" ? ryA : ryB;
        const rad = (sat.angle * Math.PI) / 180;
        const x = round2(170 + rx * Math.cos(rad));
        const y = round2(110 + ry * Math.sin(rad));
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="10" fill="var(--color-paper, #eeece3)" stroke="currentColor" strokeWidth="2" />
            <circle cx={x} cy={y} r="2.4" fill="currentColor" />
          </g>
        );
      })}
    </IllustrationFrame>
  );
}
