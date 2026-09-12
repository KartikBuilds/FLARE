"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, usePrefersReducedMotion } from "@flare/ui";
import { drawVariants, VIEWPORT } from "@/lib/motion";

/**
 * Ambient ink bleeding through the paper behind a section.
 *
 * Pure CSS keyframes, so the global prefers-reduced-motion backstop in
 * globals.css freezes them without any JS involvement. The wrapper clips its
 * own overflow — these must never widen the page.
 */
interface Blot {
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay: string;
  duration: string;
  opacity: number;
}

export function InkBlots({ className, count = 3 }: { className?: string; count?: number }) {
  const blots: Blot[] = [
    { size: "28rem", top: "-6rem", left: "-8rem", delay: "0s", duration: "26s", opacity: 0.07 },
    { size: "22rem", top: "38%", right: "-7rem", delay: "-9s", duration: "31s", opacity: 0.055 },
    { size: "18rem", bottom: "-5rem", left: "28%", delay: "-17s", duration: "24s", opacity: 0.045 },
    { size: "14rem", top: "12%", left: "46%", delay: "-4s", duration: "29s", opacity: 0.035 },
  ].slice(0, count);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {blots.map((blot, index) => (
        <span
          key={index}
          className="animate-ink-drift absolute block rounded-full blur-3xl"
          style={{
            width: blot.size,
            height: blot.size,
            top: blot.top,
            left: blot.left,
            right: blot.right,
            bottom: blot.bottom,
            opacity: blot.opacity,
            animationDelay: blot.delay,
            animationDuration: blot.duration,
            background:
              "radial-gradient(circle, var(--color-ink) 0%, var(--color-ink) 35%, transparent 70%)",
          }}
        />
      ))}
    </div>
  );
}

interface InkMarkProps {
  className?: string;
  delay?: number;
  /** Stroke weight in the mark's own viewBox units. */
  weight?: number;
}

/**
 * An underline scratched beneath a phrase. Sized by its container, so drop it
 * into a `relative` span sitting under the text it marks.
 */
export function InkUnderline({ className, delay = 0.15, weight = 3 }: InkMarkProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={cn("absolute inset-x-0 bottom-0 h-[0.2em] w-full overflow-visible text-ink", className)}
    >
      <motion.path
        d="M2 7.4C38 5 62 9.4 98 7 134 4.7 164 8.8 198 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={drawVariants(reduced, 0.7)}
        transition={{ delay: reduced ? 0 : delay }}
      />
    </svg>
  );
}

/**
 * A lasso drawn around a figure the way you would ring a number in a notebook.
 * Absolutely positioned; give the parent `relative` and a little padding.
 */
export function InkCircle({ className, delay = 0.2, weight = 2 }: InkMarkProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 60"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-ink", className)}
    >
      <motion.path
        d="M61 4C33 3 6 14 5 30c-1 16 27 27 56 26 27-1 54-11 54-27C114 13 88 5 61 4"
        fill="none"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={drawVariants(reduced, 0.95)}
        transition={{ delay: reduced ? 0 : delay }}
      />
    </svg>
  );
}

/**
 * A curved pointer, for margin notes that refer to something on the page.
 */
export function InkArrow({ className, delay = 0.2, weight = 2 }: InkMarkProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 60"
      className={cn("pointer-events-none text-ink-soft", className)}
    >
      <motion.path
        d="M6 8C26 6 52 14 62 34"
        fill="none"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={drawVariants(reduced, 0.6)}
        transition={{ delay: reduced ? 0 : delay }}
      />
      <motion.path
        d="M54 20 62 35 46 37"
        fill="none"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={drawVariants(reduced, 0.35)}
        transition={{ delay: reduced ? 0 : delay + 0.45 }}
      />
    </svg>
  );
}
