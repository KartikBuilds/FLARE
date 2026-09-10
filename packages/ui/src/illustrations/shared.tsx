import * as React from "react";

/**
 * Stable unique id for SVG defs within a single illustration instance.
 * Uses React.useId() (not useRef/useState) so illustrations can render as
 * plain Server Components — no "use client" boundary required just to draw
 * static SVG art.
 */
export function useIllustrationId(prefix: string): string {
  const id = React.useId();
  return `${prefix}-${id.replace(/:/g, "")}`;
}

interface HatchDefProps {
  id: string;
  spacing?: number;
  angle?: number;
  opacity?: number;
}

/** Diagonal cross-hatch fill pattern shared by every FLARE machinery illustration. */
export function HatchDef({ id, spacing = 5, angle = 45, opacity = 0.55 }: HatchDefProps) {
  return (
    <pattern id={id} width={spacing} height={spacing} patternTransform={`rotate(${angle})`} patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2={spacing} stroke="currentColor" strokeWidth="1" opacity={opacity} />
    </pattern>
  );
}

export function Bolt({ cx, cy, r = 3 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx={cx} cy={cy} r={r * 0.28} fill="currentColor" />
    </g>
  );
}

export function BoltRow({
  x,
  y,
  count,
  gap,
  r,
  vertical = false,
}: {
  x: number;
  y: number;
  count: number;
  gap: number;
  r?: number;
  vertical?: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Bolt key={i} cx={vertical ? x : x + i * gap} cy={vertical ? y + i * gap : y} r={r} />
      ))}
    </>
  );
}

export interface IllustrationProps extends React.SVGAttributes<SVGSVGElement> {
  title?: string;
  decorative?: boolean;
}

/** Base SVG wrapper enforcing accessible title/aria handling for meaningful illustrations. */
export function IllustrationFrame({
  title,
  decorative = false,
  children,
  ...svgProps
}: IllustrationProps & { children: React.ReactNode }) {
  const titleId = useIllustrationId("flare-illus-title");
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-labelledby={!decorative && title ? titleId : undefined}
      {...svgProps}
    >
      {!decorative && title ? <title id={titleId}>{title}</title> : null}
      {children}
    </svg>
  );
}
