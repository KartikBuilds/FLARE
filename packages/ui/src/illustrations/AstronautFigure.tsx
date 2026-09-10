import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

interface AstronautFigureProps extends IllustrationProps {
  /** "visor" is a person in a spacesuit; "coin" swaps the helmet for a faceted
   * asset coin — used on the 404 page, where the wandering "asset" itself is
   * drawn as the astronaut. */
  head?: "visor" | "coin";
}

/** A suited figure — backpack marked with the FLARE diamond, built from the
 * same stroke/hatch/bolt language as every other FLARE illustration. */
export function AstronautFigure({
  title = "An astronaut figure",
  decorative = false,
  head = "visor",
  className,
  ...props
}: AstronautFigureProps) {
  const hatchId = useIllustrationId("astro-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 160 220"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4.5} angle={45} opacity={0.22} />
      </defs>

      {/* backpack */}
      <rect x="52" y="78" width="56" height="66" rx="10" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M68 96 L80 96 L74 108 L84 108 L70 126 L74 112 L64 112 Z"
        fill="currentColor"
        opacity="0.85"
      />

      {/* torso */}
      <rect x="44" y="82" width="72" height="72" rx="20" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <circle cx="80" cy="118" r="3" fill="currentColor" />

      {/* legs */}
      <path d="M58 150 Q52 178 60 204" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M102 150 Q108 178 100 204" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="none" />
      <rect x="46" y="198" width="26" height="14" rx="6" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <rect x="88" y="198" width="26" height="14" rx="6" fill="none" stroke="currentColor" strokeWidth="2.25" />

      {/* arms */}
      <path d="M46 92 Q18 100 16 132" stroke="currentColor" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M114 92 Q144 106 138 138" stroke="currentColor" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="15" cy="136" r="8" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <circle cx="138" cy="142" r="8" fill="none" stroke="currentColor" strokeWidth="2.25" />

      {/* neck ring */}
      <rect x="64" y="66" width="32" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2.25" />

      {head === "visor" ? (
        <g>
          <circle cx="80" cy="42" r="34" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
          <path d="M62 34 Q80 22 98 34 Q98 56 80 62 Q62 56 62 34 Z" fill="currentColor" opacity="0.14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M68 30 Q80 40 68 50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </g>
      ) : (
        <g>
          <circle cx="80" cy="42" r="32" fill="none" stroke="currentColor" strokeWidth="2.25" />
          <path
            d="M80 16 L104 42 L80 68 L56 42 Z"
            fill="currentColor"
            opacity="0.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M80 16 L80 68 M56 42 L104 42" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        </g>
      )}
    </IllustrationFrame>
  );
}
