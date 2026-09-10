import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

/** A cratered horizon line — the ground beneath the dashboard's astronaut. */
export function MoonSurface({ title = "A cratered moon surface", decorative = true, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("moon-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 400 120"
      className={className}
      fill="none"
      preserveAspectRatio="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={5} angle={20} opacity={0.2} />
      </defs>
      <path
        d="M0 60 Q60 30 130 48 T260 40 T400 58 V120 H0 Z"
        fill={`url(#${hatchId})`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="90" cy="62" r="10" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
      <circle cx="230" cy="55" r="16" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
      <circle cx="320" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
    </IllustrationFrame>
  );
}
