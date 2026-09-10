"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@flare/ui";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = usePrefersReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: reduced ? 1000 : 300,
    damping: reduced ? 100 : 40,
    restDelta: 0.001,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setVisible(v > 0.002));
    return unsub;
  }, [scrollYProgress]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-ink"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
