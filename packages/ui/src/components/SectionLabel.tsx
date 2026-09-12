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
        "flex items-baseline gap-2 font-condensed text-[13px] font-medium uppercase tracking-[0.14em]",
        tone === "ink" ? "text-muted" : "text-paper/60",
        className,
      )}
    >
      {/* The numeral is the one part a researcher would have written in by
          hand, so it carries the handwritten face. */}
      <span
        className={cn(
          "font-handwritten text-[1.45em] font-bold leading-none tracking-normal",
          tone === "ink" ? "text-ink" : "text-paper",
        )}
      >
        {index}
      </span>
      <span aria-hidden="true" className="text-line-strong">
        /
      </span>
      {label}
    </p>
  );
}
