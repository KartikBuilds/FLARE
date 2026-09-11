import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId, round2 } from "./shared";
import type { IllustrationProps } from "./shared";

const CRATERS = [
  { cx: 62, cy: 48, r: 13 },
  { cx: 118, cy: 90, r: 20 },
  { cx: 150, cy: 42, r: 9 },
  { cx: 80, cy: 130, r: 11 },
  { cx: 140, cy: 140, r: 15 },
  { cx: 40, cy: 110, r: 7 },
];

/** A large cratered planet/moon disc — the horizon the dashboard/404 figures sit against. */
export function PlanetDisc({ title = "A cratered planet", decorative = true, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("planet-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={5} angle={25} opacity={0.24} />
      </defs>
      <circle cx="100" cy="100" r="98" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      {CRATERS.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.55" />
      ))}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <line
            key={`tick-${i}`}
            x1={round2(100 + 92 * Math.cos(a))}
            y1={round2(100 + 92 * Math.sin(a))}
            x2={round2(100 + 98 * Math.cos(a))}
            y2={round2(100 + 98 * Math.sin(a))}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
        );
      })}
    </IllustrationFrame>
  );
}
