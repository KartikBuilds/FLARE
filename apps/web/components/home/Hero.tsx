"use client";

import { motion } from "motion/react";
import { ButtonLink, SectionLabel, usePrefersReducedMotion } from "@flare/ui";
import {
  CoinAsset,
  ProtocolCore,
  JunctionBox,
  VaultModule,
  PipeSegment,
} from "@flare/ui/illustrations";
import { HandNote, InkBlots, InkUnderline, Magnetic, Parallax } from "@/components/motion";
import { maskLineVariants, riseSafeVariants, staggerVariants } from "@/lib/motion";

const exitStages = ["States", "Dependencies", "Exits", "Recovery"];

export function Hero() {
  const reduced = usePrefersReducedMotion();

  // Nothing above the fold may start at opacity 0. Motion serialises `initial`
  // into the server-rendered HTML, so an opacity-0 start would ship the whole
  // hero — headline, copy, CTAs, diagram — genuinely invisible to any client
  // that has not run the reveal JS. Transform-only keeps it readable with or
  // without scripting; the masks below hide text by clipping, and the
  // <noscript> rule in the root layout unclips them.
  const rise = riseSafeVariants(reduced);
  const mask = maskLineVariants(reduced);

  return (
    <section className="bg-grain relative overflow-hidden pb-20 pt-14 sm:pt-36 md:pb-28 md:pt-40 lg:pt-36">
      <InkBlots count={2} />

      {/* Feint squared paper, fading out before it reaches the copy. */}
      <div
        aria-hidden="true"
        className="paper-grid pointer-events-none absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_at_50%_35%,transparent_35%,black_100%)]"
      />

      {/* Corner machinery, drifting against the scroll so the hero has depth. */}
      <Parallax
        distance={34}
        className="pointer-events-none absolute -left-6 top-4 hidden sm:block lg:-left-2 lg:top-6"
      >
        <motion.div
          className="flex items-start gap-3"
          initial="hidden"
          animate="show"
          variants={rise}
          custom={0.5}
        >
          <CoinAsset
            className="size-24 shrink-0 -rotate-6 text-ink lg:size-32"
            title="A digital asset entering the protocol"
          />
          <div className="mt-6">
            <HandNote className="text-lg lg:text-xl" delay={0.7}>
              asset enters
            </HandNote>
            <HandNote className="-mt-1 text-lg lg:text-xl" delay={0.8}>
              protocol
            </HandNote>
          </div>
        </motion.div>
      </Parallax>

      <Parallax
        distance={-28}
        className="pointer-events-none absolute -right-6 top-2 hidden sm:block lg:-right-4 lg:top-4"
      >
        <motion.div
          className="flex items-start gap-3 text-right"
          initial="hidden"
          animate="show"
          variants={rise}
          custom={0.65}
        >
          <div className="mt-8 flex flex-col items-end gap-1">
            <HandNote className="lg:text-xl" delay={0.85}>
              protocol core
            </HandNote>
            <ul className="mt-1 space-y-0.5">
              {exitStages.map((stage, i) => (
                <li
                  key={stage}
                  className="font-condensed text-[11px] uppercase tracking-[0.1em] text-muted"
                >
                  <span className="font-handwritten text-sm text-ink">0{i + 1}</span>{" "}
                  <span className="text-ink-soft">{stage}</span>
                </li>
              ))}
            </ul>
          </div>
          <ProtocolCore className="size-28 shrink-0 text-ink lg:size-36" title="The protocol's core logic" />
        </motion.div>
      </Parallax>

      <div className="container-flare relative z-10">
        <motion.div initial="hidden" animate="show" variants={rise} custom={0.1}>
          <SectionLabel index="FLARE" label="Fund-Lock Assessment & Risk Evaluation" />
        </motion.div>

        {/* Built by hand rather than with <TextReveal> so the ink underline can
            be anchored to one phrase inside the second line. */}
        <motion.h1
          aria-label="Can the assets get back out?"
          className="mt-6 max-w-4xl font-display text-6xl font-bold leading-[0.94] tracking-tight text-balance sm:text-7xl md:text-8xl"
          initial="hidden"
          animate="show"
          variants={staggerVariants(reduced, 0.12, 0.15)}
        >
          <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
            <motion.span data-reveal="" className="block will-change-transform" variants={mask}>
              Can the assets
            </motion.span>
          </span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.14em]">
            <motion.span data-reveal="" className="block will-change-transform" variants={mask}>
              get{" "}
              <span className="relative inline-block">
                back out?
                <InkUnderline className="-bottom-2" delay={1.05} weight={2.4} />
              </span>
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl font-sans text-lg text-ink-soft"
          initial="hidden"
          animate="show"
          variants={rise}
          custom={0.55}
        >
          FLARE traces the states, dependencies, withdrawal paths and recovery mechanisms that can
          leave protocol assets permanently inaccessible.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center gap-4"
          initial="hidden"
          animate="show"
          variants={rise}
          custom={0.68}
        >
          <Magnetic>
            <ButtonLink href="/app">Open App</ButtonLink>
          </Magnetic>
          <Magnetic>
            <ButtonLink href="/docs" variant="outline" arrow="up-right">
              Read the research
            </ButtonLink>
          </Magnetic>
        </motion.div>

        {/* The machine: intake -> vault -> exits, one path visibly broken.
            Spans the full hero width so the composition carries real visual
            weight instead of a small diagram floating in empty margins. */}
        <motion.div
          className="mt-20 flex flex-col items-stretch gap-8 md:mt-28 md:flex-row md:items-center md:gap-0"
          initial="hidden"
          animate="show"
          variants={staggerVariants(reduced, 0.12, 0.85)}
        >
          <motion.div className="flex items-center gap-1 md:gap-2" variants={rise}>
            <JunctionBox
              className="size-24 shrink-0 text-ink-soft md:size-28 lg:size-32"
              title="Intake checkpoint"
              decorative
            />
            <PipeSegment
              className="h-12 w-14 shrink-0 text-ink-soft sm:w-20 md:w-16 lg:w-24"
              preserveAspectRatio="none"
              decorative
            />
          </motion.div>

          <motion.div className="flex flex-col items-center px-1 md:px-3" variants={rise}>
            <VaultModule className="size-32 shrink-0 text-ink sm:size-40 md:size-44 lg:size-52" />
            <span className="mt-2 font-condensed text-[11px] uppercase tracking-[0.1em] text-muted">
              Vault holds assets
            </span>
          </motion.div>

          <div className="flex min-w-0 flex-1 flex-col gap-7 md:pl-1">
            <motion.div className="flex min-w-0 items-center gap-1 md:gap-2" variants={rise}>
              <PipeSegment
                className="h-10 w-full min-w-0 shrink text-ink-soft"
                preserveAspectRatio="none"
                decorative
              />
              <div className="shrink-0 pl-2">
                <p className="font-condensed text-[11px] uppercase tracking-[0.1em] text-muted">
                  Exit path
                </p>
                <p className="font-sans text-sm text-ink-soft">Redemption reaches the holder.</p>
              </div>
            </motion.div>
            <motion.div className="flex min-w-0 items-center gap-1 md:gap-2" variants={rise}>
              <PipeSegment
                broken
                className="h-10 w-full min-w-0 shrink text-danger"
                preserveAspectRatio="none"
                title="Withdrawal path blocked"
              />
              <div className="shrink-0 pl-2">
                <p className="font-condensed text-[11px] uppercase tracking-[0.1em] text-danger">
                  Withdrawal path fails
                </p>
                <p className="font-sans text-sm text-ink-soft">
                  A dependency, state, or check blocks the exit.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.a
          href="#problem"
          className="mt-16 flex flex-col items-center gap-2 text-muted transition-colors hover:text-ink md:mt-20"
          initial="hidden"
          animate="show"
          variants={rise}
          custom={1.1}
        >
          <span className="font-condensed text-[11px] uppercase tracking-[0.14em]">
            Scroll to explore
          </span>
          <motion.span
            aria-hidden="true"
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}
