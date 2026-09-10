import * as React from "react";
import { cn } from "../lib/cn";

interface SectionLabelProps {
  index: string;
  label: string;
  tone?: "ink" | "paper";
  className?: string;
}

/** The "01 / THE PROBLEM" style numbered section kicker used throughout the site. */
export function SectionLabel({ index, label, tone = "ink", className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "font-condensed text-[13px] font-medium uppercase tracking-[0.14em]",
        tone === "ink" ? "text-muted" : "text-paper/60",
        className,
      )}
    >
      <span className={tone === "ink" ? "text-ink" : "text-paper"}>{index}</span>
      <span className="mx-2">/</span>
      {label}
    </p>
  );
}
