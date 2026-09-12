import type { Transition, Variants } from "motion/react";

/**
 * House motion vocabulary.
 *
 * Every animated surface in FLARE pulls its curves, durations and springs from
 * here so that a card lifting, a heading writing itself in and a page turning
 * all share one physical feel. The cubic-beziers mirror --ease-paper /
 * --ease-ink in globals.css, so CSS transitions and Motion animations agree.
 *
 * Two rules hold everywhere:
 *
 * 1. Every variant factory takes `reduced` (from usePrefersReducedMotion) and
 *    collapses to a visible, static end state when it is true. Reduced motion
 *    must never mean "content missing" — only "content arrives instantly".
 * 2. Above-the-fold content never starts at opacity 0. Motion serialises
 *    `initial` into the SSR markup, so an opacity-0 start ships a blank hero
 *    to any client that has not run the reveal JS yet. Those surfaces animate
 *    transform only; the <noscript> backstop in app/layout.tsx covers the
 *    below-the-fold reveals that do fade.
 */

export const EASE_PAPER = [0.22, 1, 0.36, 1] as const;
export const EASE_INK = [0.65, 0, 0.35, 1] as const;
export const EASE_SETTLE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  quick: 0.25,
  base: 0.55,
  slow: 0.9,
  page: 0.5,
} as const;

export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.9,
};

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

export const SPRING_CURSOR: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 38,
  mass: 0.35,
};

export const SPRING_MAGNET: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 18,
  mass: 0.6,
};

/** Fade + rise. The default reveal for below-the-fold content. */
export function riseVariants(reduced: boolean, distance = 26): Variants {
  return {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : distance },
    show: (delay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: reduced ? 0 : delay,
        duration: reduced ? 0.001 : DURATION.base,
        ease: EASE_PAPER,
      },
    }),
  };
}

/** Transform-only rise, safe for above-the-fold content. */
export function riseSafeVariants(reduced: boolean, distance = 22): Variants {
  return {
    hidden: { y: reduced ? 0 : distance },
    show: (delay: number = 0) => ({
      y: 0,
      transition: {
        delay: reduced ? 0 : delay,
        duration: reduced ? 0.001 : DURATION.base,
        ease: EASE_PAPER,
      },
    }),
  };
}

/** Parent orchestrator for staggered children. */
export function staggerVariants(reduced: boolean, stagger = 0.07, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: reduced ? 0 : delayChildren,
      },
    },
  };
}

/** A word or line sliding up out of an overflow-hidden mask. */
export function maskLineVariants(reduced: boolean): Variants {
  return {
    hidden: { y: reduced ? "0%" : "110%" },
    show: {
      y: "0%",
      transition: { duration: reduced ? 0.001 : 0.72, ease: EASE_PAPER },
    },
  };
}

/** A pen stroke drawing itself along an SVG path. */
export function drawVariants(reduced: boolean, duration = 0.8): Variants {
  return {
    hidden: { pathLength: reduced ? 1 : 0, opacity: 1 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: reduced ? 0.001 : duration, ease: EASE_INK },
    },
  };
}

/** Page-level enter used by app/template.tsx on every route change. */
export function pageVariants(reduced: boolean): Variants {
  return {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.001 : DURATION.page, ease: EASE_PAPER },
    },
  };
}

/**
 * Shared viewport config so reveals fire at a consistent point on screen.
 *
 * The bottom inset is what gives reveals their timing: content has to rise a
 * little way into the viewport before it animates, rather than triggering the
 * instant its first pixel appears.
 *
 * The top margin must stay at 0. A negative top inset shrinks the observer
 * root downward, and anything that sits entirely inside that strip on load —
 * a page header's margin note, for one — never intersects at all and is left
 * stranded at opacity 0 forever.
 */
export const VIEWPORT = { once: true, margin: "0px 0px -8% 0px" } as const;
