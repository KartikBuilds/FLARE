"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@flare/ui";
import {
  AstronautFigure,
  DebrisField,
  PlanetDisc,
  SeatedAstronaut,
} from "@flare/ui/illustrations";

const DASHBOARD_DEBRIS = [
  { top: "16%", left: "38%", size: 26, variant: 0 as const, delay: 0 },
  { top: "28%", left: "82%", size: 32, variant: 1 as const, delay: 0.4 },
  { top: "56%", left: "70%", size: 22, variant: 2 as const, delay: 0.8 },
  { top: "10%", left: "58%", size: 18, variant: 1 as const, delay: 1.2 },
];

/**
 * The dashboard scene as line art: a planet bleeding off the left edge, a
 * seated researcher looking out over it, debris drifting above.
 *
 * Same composition as the WebGL version, so swapping between them is a change
 * of medium rather than a change of picture.
 */
export function DashboardFallback() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <PlanetDisc className="absolute -bottom-24 -left-20 size-72 text-paper/50 sm:-bottom-32 sm:-left-24 sm:size-[26rem] lg:size-[30rem]" />

      {DASHBOARD_DEBRIS.map((debris, i) => (
        <motion.div
          key={i}
          className="absolute text-paper/40"
          style={{ top: debris.top, left: debris.left, width: debris.size, height: debris.size * 1.1 }}
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: debris.delay }
          }
        >
          <DebrisField variant={debris.variant} className="size-full" />
        </motion.div>
      ))}

      <motion.div
        className="absolute bottom-0 right-[8%] sm:right-[14%]"
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <SeatedAstronaut
          decorative
          className="h-56 w-auto text-paper/90 sm:h-72 lg:h-80"
        />
      </motion.div>
    </div>
  );
}

const NOT_FOUND_DEBRIS = [
  { top: "6%", left: "10%", size: 16, variant: 0 as const },
  { top: "2%", left: "58%", size: 20, variant: 1 as const },
  { top: "42%", left: "4%", size: 14, variant: 2 as const },
  { top: "62%", left: "48%", size: 18, variant: 0 as const },
  { top: "20%", left: "82%", size: 12, variant: 1 as const },
];

/**
 * The 404 scene as line art: the asset tumbling away from the protocol, with
 * a planet turning below it.
 */
export function NotFoundFallback() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <PlanetDisc className="pointer-events-none absolute -bottom-28 -right-20 size-72 text-ink-soft/25 sm:size-[24rem] lg:-bottom-36 lg:-right-28 lg:size-[30rem]" />

      {NOT_FOUND_DEBRIS.map((debris, i) => (
        <motion.div
          key={i}
          className="absolute text-ink-soft/50"
          style={{ top: debris.top, left: debris.left, width: debris.size, height: debris.size * 1.1 }}
          animate={reduced ? undefined : { y: [0, -10, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }
          }
        >
          <DebrisField variant={debris.variant} className="size-full" />
        </motion.div>
      ))}

      {/* Right of centre, matching where the WebGL version puts the figure —
          the headline occupies the left half of this section. */}
      <div className="absolute inset-y-0 right-[4%] flex items-center justify-end lg:right-[12%]">
        <motion.div
          className="rotate-[28deg]"
          animate={reduced ? undefined : { y: [0, -14, 0], rotate: [24, 32, 24] }}
          transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <AstronautFigure
            head="coin"
            decorative
            className="h-56 w-auto text-ink-soft sm:h-72 lg:h-[22rem]"
          />
        </motion.div>
      </div>
    </div>
  );
}
