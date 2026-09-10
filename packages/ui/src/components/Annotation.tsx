import * as React from "react";
import { cn } from "../lib/cn";

interface AnnotationProps {
  className?: string;
  children: React.ReactNode;
  tone?: "ink" | "paper";
}

/** Handwritten-style marginal note, used sparingly as a research-notebook accent. */
export function Annotation({ className, children, tone = "ink" }: AnnotationProps) {
  return (
    <p
      className={cn(
        "font-handwritten text-2xl leading-tight -rotate-1",
        tone === "ink" ? "text-ink-soft" : "text-paper/80",
        className,
      )}
    >
      {children}
    </p>
  );
}
