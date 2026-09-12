import * as React from "react";
import { cn } from "../lib/cn";

const SKETCH = {
  1: "sketch-box",
  2: "sketch-box-2",
  3: "sketch-box-3",
} as const;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "paper" | "charcoal";
  /**
   * Which hand-drawn corner variant to use. Vary it across a grid — three
   * cards with identical wobble read as a repeated asset rather than as three
   * boxes someone drew.
   */
  sketch?: 1 | 2 | 3 | false;
}

export function Card({
  tone = "paper",
  sketch = 1,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "border-[1.5px] p-6",
        sketch === false ? "rounded-[var(--radius-card)]" : SKETCH[sketch],
        tone === "paper"
          ? "border-line-strong/60 bg-paper-flat text-ink"
          : "border-charcoal-line bg-charcoal-soft text-paper",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
