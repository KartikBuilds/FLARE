import * as React from "react";
import { IllustrationFrame, HatchDef, Bolt, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

/** A relay/junction module — a dependency or intake checkpoint on the pipeline. */
export function JunctionBox({ title = "Junction module", decorative = false, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("junction-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4} angle={45} opacity={0.25} />
      </defs>
      <rect x="14" y="24" width="92" height="72" rx="8" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <Bolt cx={24} cy={34} r={2.6} />
      <Bolt cx={96} cy={34} r={2.6} />
      <Bolt cx={24} cy={86} r={2.6} />
      <Bolt cx={96} cy={86} r={2.6} />
      <circle cx="60" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      <line x1="60" y1="60" x2="60" y2="44" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="24" stroke="currentColor" strokeWidth="2" />
      <line x1="106" y1="10" x2="106" y2="24" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="96" x2="14" y2="110" stroke="currentColor" strokeWidth="2" />
      <line x1="106" y1="96" x2="106" y2="110" stroke="currentColor" strokeWidth="2" />
    </IllustrationFrame>
  );
}
