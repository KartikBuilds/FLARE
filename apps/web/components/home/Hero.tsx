"use client";

import { motion, type Variants } from "motion/react";
import { ButtonLink, SectionLabel, Annotation, usePrefersReducedMotion } from "@flare/ui";
import { CoinAsset, ProtocolCore, JunctionBox, VaultModule, PipeSegment } from "@flare/ui/illustrations";

const headlineLines = ["Can the assets", "get back out?"];

const exitStages = ["States", "Dependencies", "Exits", "Recovery"];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = usePrefersReducedMotion();

  // Never animate opacity on hero content: Motion applies `initial` as a
  // synchronous inline SSR style, so an opacity:0 start would ship the
  // entire above-the-fold hero (headline, copy, CTAs, machine diagram)
  // genuinely invisible to any client that doesn't run — or hasn't yet
  // run — the reveal JS (no-JS, crawlers, slow hydration). Translate-only
  // motion keeps content fully visible/readable with or without JS.
  const lineVariants: Variants = {
    hidden: { y: reduced ? 0 : 28 },
    show: (i: number) => ({
      y: 0,
      transition: { delay: reduced ? 0 : 0.15 + i * 0.12, duration: reduced ? 0.01 : 0.6, ease: EASE_OUT },
    }),
  };

  const fadeUp: Variants = {
    hidden: { y: reduced ? 0 : 16 },
    show: (delay = 0) => ({
      y: 0,
      transition: { delay: reduced ? 0 : delay, duration: reduced ? 0.01 : 0.5, ease: EASE_OUT },
    }),
  };

  return (
    <section className="bg-grain relative overflow-hidden pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="container-flare relative z-10">
        {/* framing row */}
        <div className="mb-10 hidden items-start justify-between sm:flex">
          <motion.div
            className="flex items-center gap-3"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={0.5}
          >
            <CoinAsset className="size-14 text-ink" title="A digital asset entering the protocol" />
            <div>
              <Annotation className="text-lg">asset enters</Annotation>
              <Annotation className="-mt-1 text-lg">protocol</Annotation>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start gap-3 text-right"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={0.65}
          >
            <div className="flex flex-col items-end gap-1">
              <Annotation>protocol core</Annotation>
              <ul className="mt-1 space-y-0.5">
                {exitStages.map((stage, i) => (
                  <li
                    key={stage}
                    className="font-condensed text-[11px] uppercase tracking-[0.1em] text-muted"
                  >
                    0{i + 1} <span className="text-ink-soft">{stage}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ProtocolCore className="size-16 shrink-0 text-ink" title="The protocol's core logic" />
          </motion.div>
        </div>

        <SectionLabel index="FLARE" label="Fund-Lock Assessment & Risk Evaluation" />

        <h1 className="mt-6 max-w-4xl font-display text-6xl font-bold leading-[0.94] tracking-tight text-balance sm:text-7xl md:text-8xl">
          {headlineLines.map((line, i) => (
            <motion.span
              key={line}
              className="block overflow-hidden"
              initial="hidden"
              animate="show"
              variants={lineVariants}
              custom={i}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mt-6 max-w-xl font-sans text-lg text-ink-soft"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.55}
        >
          FLARE traces the states, dependencies, withdrawal paths and recovery mechanisms that can
          leave protocol assets permanently inaccessible.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center gap-4"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.68}
        >
          <ButtonLink href="/app">Open App</ButtonLink>
          <ButtonLink href="/docs" variant="outline" arrow="up-right">
            Read the research
          </ButtonLink>
        </motion.div>

        {/* the machine: intake -> vault -> exits, one path visibly broken */}
        <motion.div
          className="mt-20 flex flex-col items-stretch gap-0 md:mt-28 md:flex-row md:items-center"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.85}
        >
          <div className="flex items-center gap-2">
            <JunctionBox className="size-20 shrink-0 text-ink-soft md:size-24" title="Intake checkpoint" decorative />
            <PipeSegment className="h-10 w-20 shrink-0 text-ink-soft md:w-28" decorative />
          </div>

          <div className="flex flex-col items-center px-2">
            <VaultModule className="size-28 shrink-0 text-ink md:size-36" />
            <span className="mt-2 font-condensed text-[11px] uppercase tracking-[0.1em] text-muted">
              Vault holds assets
            </span>
          </div>

          <div className="mt-8 flex flex-1 flex-col gap-6 md:mt-0 md:pl-2">
            <div className="flex items-center gap-2">
              <PipeSegment className="h-10 w-16 shrink-0 rotate-180 text-ink-soft md:w-24" decorative />
              <div className="min-w-0">
                <p className="font-condensed text-[11px] uppercase tracking-[0.1em] text-muted">Exit path</p>
                <p className="font-sans text-sm text-ink-soft">Redemption reaches the holder.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PipeSegment
                broken
                className="h-10 w-16 shrink-0 rotate-180 text-danger md:w-24"
                title="Withdrawal path blocked"
              />
              <div className="min-w-0">
                <p className="font-condensed text-[11px] uppercase tracking-[0.1em] text-danger">
                  Withdrawal path fails
                </p>
                <p className="font-sans text-sm text-ink-soft">A dependency, state, or check blocks the exit.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.a
          href="#problem"
          className="mt-16 flex flex-col items-center gap-2 text-muted transition-colors hover:text-ink md:mt-20"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={1.1}
        >
          <span className="font-condensed text-[11px] uppercase tracking-[0.14em]">Scroll to explore</span>
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
