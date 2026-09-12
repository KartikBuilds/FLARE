import * as React from "react";
import { IllustrationFrame, HatchDef, Bolt, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

export type StageId =
  | "intake"
  | "understanding"
  | "asset-discovery"
  | "state-model"
  | "dependencies"
  | "exit-recovery"
  | "detectors"
  | "validation"
  | "risk";

/**
 * The mechanism on the front plate of each stage housing.
 *
 * Every stage gets its own, because nine identical dials say nothing about a
 * nine-stage pipeline — the point of the row is that each step does a
 * different job, and the props are where that reads at a glance.
 */
const MECHANISMS: Record<StageId, React.ReactNode> = {
  // A hopper accepting something from above.
  intake: (
    <>
      <path d="M32 44 H62 L52 58 V68 H42 V58 Z" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" />
      <path d="M47 30 V40 M43 36 L47 40 L51 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // A lens held over the work.
  understanding: (
    <>
      <circle cx="43" cy="51" r="11" stroke="currentColor" strokeWidth="2.25" />
      <path d="M43 44 A7 7 0 0 0 36 51" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <path d="M51 59 L62 70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  // Value found and counted.
  "asset-discovery": (
    <>
      {[62, 55, 48].map((cy, i) => (
        <g key={cy}>
          <ellipse cx="47" cy={cy} rx="15" ry="5.5" stroke="currentColor" strokeWidth="2.25" />
          {i === 2 ? <path d="M47 44 L51 48 L47 52 L43 48 Z" stroke="currentColor" strokeWidth="1.5" /> : null}
        </g>
      ))}
    </>
  ),
  // Reachable states and the transitions between them.
  "state-model": (
    <>
      <path d="M35 45 L59 45 M59 45 L59 63 M59 63 L35 63" stroke="currentColor" strokeWidth="1.75" opacity="0.75" />
      {[
        [35, 45],
        [59, 45],
        [59, 63],
        [35, 63],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="currentColor" />
      ))}
      <path d="M35 45 L59 63" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
    </>
  ),
  // Links to code this contract does not control.
  dependencies: (
    <>
      <rect x="30" y="48" width="20" height="13" rx="6.5" stroke="currentColor" strokeWidth="2.25" />
      <rect x="45" y="48" width="20" height="13" rx="6.5" stroke="currentColor" strokeWidth="2.25" />
      <path d="M30 42 V46 M65 63 V67" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.65" />
    </>
  ),
  // A way out, and whether it can be reached.
  "exit-recovery": (
    <>
      <path d="M33 40 H51 V70 H33" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" />
      <circle cx="47" cy="55" r="1.8" fill="currentColor" />
      <path d="M54 55 H66 M61 50 L66 55 L61 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // A sweep looking for known shapes.
  detectors: (
    <>
      {[6, 11, 16].map((r) => (
        <path
          key={r}
          d={`M${47 - r} 62 A${r} ${r} 0 0 1 ${47 + r} 62`}
          stroke="currentColor"
          strokeWidth="1.75"
          opacity={0.35 + r / 40}
        />
      ))}
      <path d="M47 62 L59 50" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="47" cy="62" r="2.5" fill="currentColor" />
    </>
  ),
  // A finding checked against an execution.
  validation: (
    <>
      <circle cx="47" cy="55" r="14" stroke="currentColor" strokeWidth="2.25" />
      <path d="M40 55 L45 61 L55 48" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // The dial the whole pipeline is turning.
  risk: (
    <>
      <path d="M33 62 A14 14 0 0 1 61 62" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      {[-60, -30, 0, 30, 60].map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return (
          <path
            key={angle}
            d={`M${(47 + Math.cos(rad) * 11).toFixed(2)} ${(62 + Math.sin(rad) * 11).toFixed(2)} L${(47 + Math.cos(rad) * 14).toFixed(2)} ${(62 + Math.sin(rad) * 14).toFixed(2)}`}
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.7"
          />
        );
      })}
      <path d="M47 62 L57 53" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="47" cy="62" r="3" fill="currentColor" />
    </>
  ),
};

interface StageModuleProps extends IllustrationProps {
  stage: StageId;
}

/**
 * One stage of the analysis pipeline, drawn as an instrument housing in
 * three-quarter view.
 *
 * The housing is shared — same casing, same bolts, same lit top and shaded
 * side — so the nine read as one rack; only the mechanism on the front plate
 * changes. Volume comes from three visible faces plus hatched shading rather
 * than from a gradient, which keeps it in the same ink language as the rest of
 * the illustrations.
 */
export function StageModule({
  stage,
  title,
  decorative = true,
  className,
  ...props
}: StageModuleProps) {
  const hatchId = useIllustrationId("stage-hatch");
  const hatchSoftId = useIllustrationId("stage-hatch-soft");

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
        <HatchDef id={hatchId} spacing={4} angle={45} opacity={0.45} />
        <HatchDef id={hatchSoftId} spacing={6} angle={-45} opacity={0.22} />
      </defs>

      {/* Shaded right face */}
      <path
        d="M72 30 L86 18 L86 70 L72 82 Z"
        fill={`url(#${hatchId})`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Lit top face */}
      <path
        d="M22 30 L36 18 L86 18 L72 30 Z"
        fill={`url(#${hatchSoftId})`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Front plate */}
      <rect x="22" y="30" width="50" height="52" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <rect x="27" y="35" width="40" height="42" rx="2" stroke="currentColor" strokeWidth="1.25" opacity="0.45" />

      <Bolt cx={26} cy={34} r={1.9} />
      <Bolt cx={68} cy={34} r={1.9} />
      <Bolt cx={26} cy={78} r={1.9} />
      <Bolt cx={68} cy={78} r={1.9} />

      {/* Feet */}
      <path d="M28 82 V88 M66 82 V88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {MECHANISMS[stage]}
    </IllustrationFrame>
  );
}
