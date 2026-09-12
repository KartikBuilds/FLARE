"use client";

import { motion } from "motion/react";
import { ButtonLink, usePrefersReducedMotion } from "@flare/ui";
import { AstronautFigure, PlanetDisc, DebrisField } from "@flare/ui/illustrations";
import { HandNote, InkBlots, Magnetic, Reveal, TextReveal } from "@/components/motion";

const DEBRIS = [
  { top: "6%", left: "10%", size: 16, variant: 0 as const },
  { top: "2%", left: "58%", size: 20, variant: 1 as const },
  { top: "42%", left: "4%", size: 14, variant: 2 as const },
  { top: "62%", left: "48%", size: 18, variant: 0 as const },
  { top: "20%", left: "82%", size: 12, variant: 1 as const },
];

export function NotFoundContent() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="bg-grain relative overflow-hidden py-20 md:py-28">
      <InkBlots count={2} />

      {/* planet peeking in from the corner, matching the reference's lower
          composition — sized to bleed off the section edge */}
      <PlanetDisc className="pointer-events-none absolute -bottom-32 -right-24 size-72 text-ink-soft/25 sm:size-[26rem] lg:-bottom-40 lg:-right-32 lg:size-[32rem]" />

      <div className="container-flare relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <TextReveal
            as="h1"
            lines={["Path", "Not Found"]}
            immediate
            className="font-display text-7xl font-bold leading-[0.92] tracking-tight sm:text-8xl lg:text-9xl"
          />
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-sm font-sans text-lg text-ink-soft">
              The asset you&apos;re looking for seems to have drifted outside the protocol path.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <ButtonLink href="/">Return Home</ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href="/docs" variant="outline">
                  Read the docs
                </ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href="/app" variant="ghost">
                  Run an analysis
                </ButtonLink>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        <div className="relative flex justify-center py-10">
          {DEBRIS.map((d, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute text-ink-soft/50"
              style={{ top: d.top, left: d.left, width: d.size, height: d.size * 1.1 }}
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={reduced ? undefined : { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            >
              <DebrisField variant={d.variant} className="size-full" />
            </motion.div>
          ))}

          <div className="relative rotate-[28deg]">
            <motion.div
              animate={reduced ? undefined : { y: [0, -14, 0], rotate: [-4, 4, -4] }}
              transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <AstronautFigure
                head="coin"
                className="h-80 w-auto text-ink-soft sm:h-[26rem] lg:h-[30rem]"
                title="An asset tumbling off the protocol path"
              />
            </motion.div>
          </div>
          <HandNote className="absolute -top-2 right-0 max-w-[10rem] text-xl sm:right-4" delay={0.5}>
            this asset took a wrong turn...
          </HandNote>
        </div>
      </div>
    </section>
  );
}
