import * as React from "react";
import { cn } from "../lib/cn";

type BadgeTone = "neutral" | "accent" | "danger" | "warning" | "success" | "outline-dark";

/* Each tone carries a hairline in its own hue so a chip reads as something
   outlined on the page rather than a flat block of fill. */
const tones: Record<BadgeTone, string> = {
  neutral: "border border-line-strong/50 bg-line-soft text-ink-soft",
  accent: "border border-ink bg-accent text-accent-ink",
  danger: "border border-danger/30 bg-danger-soft text-danger",
  warning: "border border-warning/30 bg-warning-soft text-warning",
  success: "border border-success/30 bg-success-soft text-success",
  "outline-dark": "border border-charcoal-line text-paper",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2.5 py-1",
        "font-condensed text-[11px] font-semibold uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Fixed-meaning badge: this data did not come from a live analyzer run. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="neutral" className={className}>
      Demo
    </Badge>
  );
}

/** Fixed-meaning badge: this data came from a completed live analyzer run. */
export function LiveEngineBadge({ className }: { className?: string }) {
  return (
    <Badge tone="accent" className={className}>
      Live Engine
    </Badge>
  );
}
