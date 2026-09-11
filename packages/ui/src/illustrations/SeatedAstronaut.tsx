import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

/**
 * A suited figure seated on a ledge, knees drawn up, looking out — the
 * dashboard/404 "resting after the analysis" pose. Built from the same
 * stroke/hatch/bolt language as every other FLARE illustration, but a
 * distinct silhouette from AstronautFigure's standing pose.
 */
export function SeatedAstronaut({
  title = "An astronaut seated on a ledge, looking out",
  decorative = false,
  className,
  ...props
}: IllustrationProps) {
  const hatchId = useIllustrationId("seated-astro-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 240 220"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4.5} angle={45} opacity={0.22} />
      </defs>

      {/* far (left) leg, bent knee-up */}
      <path
        d="M96 150 Q66 150 58 176 Q52 196 66 206"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <rect x="52" y="198" width="28" height="15" rx="7" fill="none" stroke="currentColor" strokeWidth="2.25" opacity="0.85" />

      {/* backpack */}
      <rect x="118" y="96" width="52" height="62" rx="10" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <path d="M132 112 L144 112 L138 124 L148 124 L134 142 L138 128 L128 128 Z" fill="currentColor" opacity="0.85" />

      {/* torso, leaning forward over the knee */}
      <path
        d="M92 104 Q84 132 96 156 Q118 168 140 156 Q152 132 144 104 Q118 90 92 104 Z"
        fill={`url(#${hatchId})`}
        stroke="currentColor"
        strokeWidth="2.25"
      />

      {/* near (right) leg, bent knee-up, arm resting on it */}
      <path
        d="M126 152 Q158 150 168 174 Q176 196 160 208"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="150" y="200" width="30" height="16" rx="7" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M138 118 Q158 138 156 168"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="155" cy="170" r="8" fill="none" stroke="currentColor" strokeWidth="2.25" />

      {/* far arm, resting near the far knee */}
      <path d="M98 112 Q76 124 72 148" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.85" />
      <circle cx="71" cy="150" r="7" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.85" />

      {/* neck ring */}
      <rect x="100" y="88" width="30" height="15" rx="5" fill="none" stroke="currentColor" strokeWidth="2.25" />

      {/* helmet, turned three-quarters toward the view */}
      <circle cx="116" cy="60" r="32" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M100 52 Q116 40 134 52 Q136 72 118 80 Q100 72 100 52 Z"
        fill="currentColor"
        opacity="0.14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M106 48 Q118 58 106 68" stroke="currentColor" strokeWidth="1" opacity="0.5" />

      {/* the ledge */}
      <path
        d="M0 214 Q60 202 120 210 T240 208 V220 H0 Z"
        fill={`url(#${hatchId})`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IllustrationFrame>
  );
}
