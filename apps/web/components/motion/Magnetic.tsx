"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@flare/ui";
import { SPRING_MAGNET } from "@/lib/motion";
import { useFinePointer } from "./use-fine-pointer";

interface MagneticProps {
  children: React.ReactNode;
  /** Fraction of the pointer's offset from centre that the child travels. */
  strength?: number;
  /** Maximum travel in pixels, so a wide target never slides far off its slot. */
  max?: number;
  className?: string;
}

/**
 * Pulls its child a little way toward the pointer while the pointer is over it.
 *
 * Purely decorative: the child keeps its own hit area and its own focus ring,
 * and the effect is skipped entirely on coarse pointers and under reduced
 * motion, so keyboard and touch users get an ordinary, stationary control.
 */
export function Magnetic({ children, strength = 0.3, max = 12, className }: MagneticProps) {
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const ref = React.useRef<HTMLSpanElement>(null);
  const enabled = finePointer && !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING_MAGNET);
  const springY = useSpring(y, SPRING_MAGNET);

  const handleMove = React.useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      x.set(Math.max(-max, Math.min(max, offsetX * strength)));
      y.set(Math.max(-max, Math.min(max, offsetY * strength)));
    },
    [enabled, max, strength, x, y],
  );

  const reset = React.useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </motion.span>
  );
}
