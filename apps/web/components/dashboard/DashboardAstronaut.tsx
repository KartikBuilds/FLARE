"use client";

import { motion } from "motion/react";
import { Annotation, usePrefersReducedMotion } from "@flare/ui";
import { AstronautFigure, MoonSurface } from "@flare/ui/illustrations";

export function DashboardAstronaut() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative mt-8 overflow-hidden rounded-[var(--radius-card)] border border-charcoal-line bg-charcoal px-6 pb-0 pt-10 text-paper sm:px-10">
      <div className="relative z-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <blockquote className="max-w-sm font-display text-2xl italic leading-snug">
          &ldquo;Better analysis today. Fewer locked funds tomorrow.&rdquo;
        </blockquote>
        <Annotation tone="paper" className="max-w-[10rem] text-xl">
          Secure the path for what&apos;s next.
        </Annotation>
      </div>

      <div className="relative mt-10 flex justify-center">
        <div aria-hidden="true" className="absolute -left-2 -top-2 size-10 rounded-full border border-paper/20 sm:left-4 sm:top-2" />
        <motion.div
          animate={reduced ? undefined : { y: [0, -6, 0] }}
          transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <AstronautFigure title="An astronaut resting after a long analysis" className="h-40 w-auto text-paper/85 sm:h-52" />
        </motion.div>
      </div>

      <MoonSurface className="relative z-0 -mt-6 h-16 w-full text-paper/60 sm:h-24" />
    </div>
  );
}
