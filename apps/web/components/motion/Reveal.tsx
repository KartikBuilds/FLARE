"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { usePrefersReducedMotion } from "@flare/ui";
import { riseVariants, staggerVariants, VIEWPORT } from "@/lib/motion";

/* Motion redeclares several DOM handlers (onDrag, onAnimationStart, …) with its
   own signatures, so pass-through props must be based on HTMLMotionProps rather
   than React.HTMLAttributes or the two sets collide. */
type PassThroughProps = Omit<
  HTMLMotionProps<"div">,
  "variants" | "initial" | "whileInView" | "viewport" | "custom" | "children"
>;

const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  span: motion.span,
  figure: motion.figure,
} as const;

type Tag = keyof typeof TAGS;

interface RevealProps extends PassThroughProps {
  /** Seconds to wait after the element enters the viewport. */
  delay?: number;
  /** Pixels travelled on the way in. */
  distance?: number;
  as?: Tag;
  children: React.ReactNode;
}

/**
 * Scroll reveal: fades and rises once, the first time it enters the viewport.
 *
 * `data-reveal` pairs with the <noscript> rule in app/layout.tsx — if the
 * reveal JS never runs, that rule forces the element visible rather than
 * leaving it stranded at opacity 0.
 */
export function Reveal({
  delay = 0,
  distance = 26,
  as = "div",
  children,
  ...rest
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const Component = TAGS[as] as typeof motion.div;

  return (
    <Component
      data-reveal=""
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={delay}
      variants={riseVariants(reduced, distance)}
      {...rest}
    >
      {children}
    </Component>
  );
}

interface RevealGroupProps extends PassThroughProps {
  /** Seconds between each child's entrance. */
  stagger?: number;
  delayChildren?: number;
  as?: Tag;
  children: React.ReactNode;
}

/**
 * Orchestrates a run of <RevealItem> children so they arrive in sequence
 * rather than all at once. Pair with RevealItem, not Reveal — Reveal drives
 * its own viewport trigger and would ignore the parent's timeline.
 */
export function RevealGroup({
  stagger = 0.07,
  delayChildren = 0,
  as = "div",
  children,
  ...rest
}: RevealGroupProps) {
  const reduced = usePrefersReducedMotion();
  const Component = TAGS[as] as typeof motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerVariants(reduced, stagger, delayChildren)}
      {...rest}
    >
      {children}
    </Component>
  );
}

interface RevealItemProps extends PassThroughProps {
  distance?: number;
  as?: Tag;
  children: React.ReactNode;
}

export function RevealItem({
  distance = 20,
  as = "div",
  children,
  ...rest
}: RevealItemProps) {
  const reduced = usePrefersReducedMotion();
  const Component = TAGS[as] as typeof motion.div;

  return (
    <Component data-reveal="" variants={riseVariants(reduced, distance)} {...rest}>
      {children}
    </Component>
  );
}
