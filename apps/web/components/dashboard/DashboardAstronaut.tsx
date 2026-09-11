"use client";

import { motion } from "motion/react";
import { Annotation, usePrefersReducedMotion } from "@flare/ui";
import { SeatedAstronaut, PlanetDisc, DebrisField } from "@flare/ui/illustrations";

const DEBRIS = [
  { top: "16%", left: "38%", size: 26, variant: 0 as const, delay: 0 },
  { top: "28%", left: "82%", size: 32, variant: 1 as const, delay: 0.4 },
  { top: "56%", left: "70%", size: 22, variant: 2 as const, delay: 0.8 },
  { top: "10%", left: "58%", size: 18, variant: 1 as const, delay: 1.2 },
];

export function DashboardAstronaut() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative mt-8 overflow-hidden rounded-[var(--radius-card)] border border-charcoal-line bg-charcoal px-6 pb-0 pt-10 text-paper sm:px-10">
      <div className="relative z-20 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <blockquote className="max-w-sm font-display text-2xl italic leading-snug">
          &ldquo;Better analysis today. Fewer locked funds tomorrow.&rdquo;
        </blockquote>
        <Annotation tone="paper" className="max-w-[10rem] text-xl">
          Secure the path for what&apos;s next.
        </Annotation>
      </div>

      {/* scene: large planet bleeding off the left edge, seated astronaut
          looking out over it, floating debris scattered above — sized to
          carry real visual weight, matching the reference composition
          rather than a thin decorative strip */}
      <div className="relative z-0 mt-10 h-[22rem] sm:h-[26rem] lg:h-[30rem]">
        <PlanetDisc
          className="absolute -bottom-24 -left-20 size-72 text-paper/50 sm:-bottom-32 sm:-left-24 sm:size-[26rem] lg:size-[30rem]"
        />

        {DEBRIS.map((d, i) => (
          <motion.div
            key={i}
            className="absolute text-paper/40"
            style={{ top: d.top, left: d.left, width: d.size, height: d.size * 1.1 }}
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={reduced ? undefined : { duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
          >
            <DebrisField variant={d.variant} className="size-full" />
          </motion.div>
        ))}

        <motion.div
          className="absolute bottom-0 right-[8%] sm:right-[14%]"
          animate={reduced ? undefined : { y: [0, -6, 0] }}
          transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <SeatedAstronaut
            title="An astronaut resting on a ledge, looking out over the planet"
            className="h-56 w-auto text-paper/90 sm:h-72 lg:h-80"
          />
        </motion.div>
      </div>
    </div>
  );
}
