"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn, usePrefersReducedMotion } from "@flare/ui";
import { HourglassGlyph, JunctionBox, PipeSegment, VaultModule } from "@flare/ui/illustrations";

type StateKind = "loading" | "empty" | "error" | "success";

interface StateMessageProps {
  kind: StateKind;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const TONE: Record<StateKind, string> = {
  loading: "text-ink-soft",
  empty: "text-muted",
  error: "text-danger",
  success: "text-success",
};

function Glyph({ kind }: { kind: StateKind }) {
  const reduced = usePrefersReducedMotion();
  const className = cn("h-20 w-auto sm:h-24", TONE[kind]);

  if (kind === "loading") {
    return (
      <motion.div
        animate={reduced ? undefined : { rotate: [0, 8, 0, -8, 0] }}
        transition={reduced ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <HourglassGlyph className={className} decorative />
      </motion.div>
    );
  }

  if (kind === "error") {
    // The broken pipe is the product's own vocabulary for "this route does not
    // complete", so an error here looks like the failure it is describing.
    return (
      <PipeSegment
        broken
        decorative
        preserveAspectRatio="none"
        className={cn("h-12 w-40", TONE[kind])}
      />
    );
  }

  if (kind === "success") return <VaultModule className={className} decorative />;

  return <JunctionBox className={className} decorative />;
}

/**
 * The shared loading / empty / error / success panel for application routes.
 *
 * Every state gets a prop, a heading and a sentence explaining what actually
 * happened — a bare "Loading…" or "No results" leaves a reader guessing
 * whether the product is working, broken, or simply has nothing to show yet.
 *
 * `status` role plus aria-live means a state arriving after a fetch is
 * announced rather than silently swapped in.
 */
export function StateMessage({ kind, title, description, action, className }: StateMessageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center gap-4 px-6 py-14 text-center",
        className,
      )}
    >
      <Glyph kind={kind} />
      <div className="space-y-1.5">
        <p className={cn("font-sans text-base font-semibold", kind === "error" ? "text-danger" : "text-ink")}>
          {title}
        </p>
        {description ? (
          <p className="mx-auto max-w-sm font-sans text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
