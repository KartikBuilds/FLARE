import * as React from "react";
import { cn } from "../lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "paper" | "charcoal";
}

export function Card({ tone = "paper", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border p-6",
        tone === "paper"
          ? "border-line bg-paper-flat text-ink"
          : "border-charcoal-line bg-charcoal-soft text-paper",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
