"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (n: number) => string;
}

export function AnimatedCounter({ value, duration = 1.1, className, formatter }: AnimatedCounterProps) {
  const reduced = usePrefersReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => (formatter ? formatter(Math.round(v)) : Math.round(v).toString()));
  const [display, setDisplay] = React.useState(formatter ? formatter(0) : "0");

  React.useEffect(() => {
    if (reduced) {
      setDisplay(formatter ? formatter(value) : value.toString());
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    const unsub = rounded.on("change", setDisplay);
    return () => {
      controls.stop();
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);

  return (
    <motion.span className={className} aria-label={String(value)}>
      {display}
    </motion.span>
  );
}
