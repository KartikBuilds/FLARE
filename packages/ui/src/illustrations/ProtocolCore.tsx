import * as React from "react";
import { IllustrationFrame, HatchDef, Bolt, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

/** The protocol core: a riveted sphere with latitude/longitude seams and an antenna. */
export function ProtocolCore({ title = "Protocol core", decorative = false, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("core-hatch");
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 160 180"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={4.5} angle={20} opacity={0.28} />
      </defs>
      <line x1="80" y1="10" x2="80" y2="34" stroke="currentColor" strokeWidth="2" />
      <circle cx="80" cy="8" r="3" fill="currentColor" />
      <circle cx="80" cy="105" r="65" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <ellipse cx="80" cy="105" rx="65" ry="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <ellipse cx="80" cy="105" rx="28" ry="65" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <line x1="15" y1="105" x2="145" y2="105" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <Bolt cx={80} cy={40} r={2.6} />
      <Bolt cx={80} cy={170} r={2.6} />
      <Bolt cx={17} cy={105} r={2.6} />
      <Bolt cx={143} cy={105} r={2.6} />
      <Bolt cx={35} cy={60} r={2.2} />
      <Bolt cx={125} cy={60} r={2.2} />
      <Bolt cx={35} cy={150} r={2.2} />
      <Bolt cx={125} cy={150} r={2.2} />
    </IllustrationFrame>
  );
}
