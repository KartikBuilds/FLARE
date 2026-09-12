"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn, usePrefersReducedMotion } from "@flare/ui";

/**
 * A nib of ink drawn across the top of the window as the page is read.
 *
 * This is direct feedback on the reader's own scrolling rather than ambient
 * motion, so it stays on under reduced motion — only the spring smoothing is
 * dropped, leaving the bar locked exactly to scroll position.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-ink",
        className,
      )}
      style={{ scaleX: reduced ? scrollYProgress : smoothed }}
    />
  );
}

interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Pixels of travel across the element's full pass through the viewport. */
  distance?: number;
  className?: string;
}

/**
 * Drifts its contents against the scroll direction while the element crosses
 * the viewport, giving layered compositions a sense of depth.
 */
export function Parallax({ children, distance = 48, className, ...rest }: ParallaxProps) {
  const reduced = usePrefersReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className} {...rest}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

interface ScrollScaleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Settles a block into place as it reaches the middle of the viewport: a
 * fraction of a degree of rotation and a hair of scale, like a sheet of paper
 * being squared up on a desk.
 */
export function ScrollSettle({ children, className }: ScrollScaleProps) {
  const reduced = usePrefersReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [1.4, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.975, 1]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { rotate, scale }}>{children}</motion.div>
    </div>
  );
}
