import * as React from "react";
import { IllustrationFrame, HatchDef, Bolt, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

interface PipeSegmentProps extends IllustrationProps {
  broken?: boolean;
}

/** A flanged pipe run carrying assets between modules; `broken` renders a fractured, blocked joint. */
export function PipeSegment({
  title = "Asset transfer pipe",
  decorative = false,
  broken = false,
  className,
  ...props
}: PipeSegmentProps) {
  const hatchId = useIllustrationId("pipe-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 240 60"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4} angle={90} opacity={0.28} />
      </defs>
      {/* left flange */}
      <rect x="4" y="12" width="10" height="36" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <Bolt cx={9} cy={18} r={1.8} />
      <Bolt cx={9} cy={42} r={1.8} />

      {!broken ? (
        <>
          <rect x="14" y="18" width="212" height="24" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2" />
          <line x1="14" y1="30" x2="226" y2="30" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        </>
      ) : (
        <>
          <rect x="14" y="18" width="96" height="24" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2" />
          <rect x="132" y="18" width="94" height="24" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2" />
          {/* fracture */}
          <path
            d="M110 14 L120 22 L112 30 L124 38 L114 46"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M118 10 L128 6 M120 48 L130 54 M108 8 L100 2" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
          {/* debris */}
          <path d="M100 48 L106 52 L98 56 Z" fill="currentColor" opacity="0.5" />
          <path d="M128 50 L134 55 L124 57 Z" fill="currentColor" opacity="0.35" />
          <circle cx="118" cy="6" r="1.6" fill="currentColor" opacity="0.5" />
        </>
      )}

      {/* right flange */}
      <rect x="226" y="12" width="10" height="36" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <Bolt cx={231} cy={18} r={1.8} />
      <Bolt cx={231} cy={42} r={1.8} />
    </IllustrationFrame>
  );
}
