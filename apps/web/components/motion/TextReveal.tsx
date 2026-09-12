"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, usePrefersReducedMotion } from "@flare/ui";
import { maskLineVariants, staggerVariants, VIEWPORT } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface TextRevealProps {
  /** One entry per rendered line. Lines are not re-wrapped; choose breaks that hold at every width. */
  lines: string[];
  as?: Tag;
  /** `line` slides whole lines out of a mask; `word` staggers each word. */
  mode?: "line" | "word";
  className?: string;
  /** Per-line (or per-word) offset in seconds. */
  stagger?: number;
  delay?: number;
  /** Fire on mount instead of on scroll — use for above-the-fold headings. */
  immediate?: boolean;
}

/**
 * Headline that writes itself onto the page, line by line or word by word.
 *
 * The visible glyphs are split into spans and hidden from assistive tech; the
 * host element carries the full string as its accessible name, so a screen
 * reader hears one clean sentence instead of a stream of fragments.
 */
export function TextReveal({
  lines,
  as = "h2",
  mode = "line",
  className,
  stagger = 0.09,
  delay = 0,
  immediate = false,
}: TextRevealProps) {
  const reduced = usePrefersReducedMotion();
  // Narrowed to the props actually passed. A bare React.ElementType would now
  // also match the three.js intrinsics that @react-three/fiber adds to the JSX
  // namespace, several of which type `children` as never.
  const Host = as as unknown as React.ComponentType<{
    className?: string;
    "aria-label"?: string;
    children?: React.ReactNode;
  }>;
  const label = lines.join(" ");

  const trigger = immediate
    ? ({ initial: "hidden", animate: "show" } as const)
    : ({ initial: "hidden", whileInView: "show", viewport: VIEWPORT } as const);

  return (
    <Host className={className} aria-label={label}>
      <motion.span
        className="block"
        variants={staggerVariants(reduced, stagger, delay)}
        {...trigger}
      >
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="block overflow-hidden pb-[0.08em]" aria-hidden="true">
            {mode === "line" ? (
              <motion.span
                data-reveal=""
                className="block will-change-transform"
                variants={maskLineVariants(reduced)}
              >
                {line}
              </motion.span>
            ) : (
              <motion.span
                className="block"
                variants={staggerVariants(reduced, stagger * 0.45)}
              >
                {line.split(" ").map((word, wordIndex) => (
                  <motion.span
                    key={`${lineIndex}-${wordIndex}`}
                    data-reveal=""
                    className="mr-[0.26em] inline-block will-change-transform"
                    variants={maskLineVariants(reduced)}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            )}
          </span>
        ))}
      </motion.span>
    </Host>
  );
}

interface HandNoteProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * A margin note in the handwritten face that scratches itself in at a slight
 * angle, the way a real annotation lands beside a paragraph.
 */
export function HandNote({ children, className, delay = 0 }: HandNoteProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.p
      data-reveal=""
      className={cn("font-handwritten text-2xl leading-tight text-ink-soft", className)}
      initial={reduced ? false : { opacity: 0, rotate: -6, y: 10 }}
      whileInView={{ opacity: 1, rotate: -2, y: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration: reduced ? 0.001 : 0.6,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.p>
  );
}
