"use client";

import { motion } from "motion/react";
import { ButtonLink, Annotation, usePrefersReducedMotion } from "@flare/ui";
import { AstronautFigure } from "@flare/ui/illustrations";

export function NotFoundContent() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="bg-grain relative overflow-hidden py-20 md:py-28">
      <div className="container-flare grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="font-display text-7xl font-bold leading-[0.92] tracking-tight sm:text-8xl">
            Path
            <br />
            Not Found
          </h1>
          <p className="mt-6 max-w-sm font-sans text-lg text-ink-soft">
            The asset you&apos;re looking for seems to have drifted outside the protocol path.
          </p>
          <div className="mt-8">
            <ButtonLink href="/">Return Home</ButtonLink>
          </div>
        </div>

        <div className="relative flex justify-center">
          <motion.div
            animate={reduced ? undefined : { y: [0, -14, 0], rotate: [-3, 3, -3] }}
            transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <AstronautFigure head="coin" className="h-72 w-auto text-ink-soft sm:h-96" title="An asset drifting off the protocol path" />
          </motion.div>
          <Annotation className="absolute -top-2 right-0 max-w-[10rem] text-xl sm:right-4">
            this asset took a wrong turn...
          </Annotation>
        </div>
      </div>
    </section>
  );
}
