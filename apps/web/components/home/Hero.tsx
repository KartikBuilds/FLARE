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
    <section className="bg-grain relative overflow-hidden pb-20 pt-14 sm:pt-36 md:pb-28 md:pt-40 lg:pt-36">
      {/* corner machinery: bleeds toward the true edges so the hero reads as
          one dense composition rather than text stranded in empty margins */}
      <motion.div
        className="pointer-events-none absolute -left-6 top-4 hidden items-start gap-3 sm:flex lg:-left-2 lg:top-6"
        initial="hidden"
        animate="show"
        variants={fadeUp}
        custom={0.5}
      >
        <CoinAsset className="size-24 shrink-0 -rotate-6 text-ink lg:size-32" title="A digital asset entering the protocol" />
        <div className="mt-6">
          <Annotation className="text-lg lg:text-xl">asset enters</Annotation>
          <Annotation className="-mt-1 text-lg lg:text-xl">protocol</Annotation>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -right-6 top-2 hidden items-start gap-3 text-right sm:flex lg:-right-4 lg:top-4"
        initial="hidden"
        animate="show"
        variants={fadeUp}
        custom={0.65}
      >
        <div className="mt-8 flex flex-col items-end gap-1">
          <Annotation className="lg:text-xl">protocol core</Annotation>
          <ul className="mt-1 space-y-0.5">
            {exitStages.map((stage, i) => (
              <li key={stage} className="font-condensed text-[11px] uppercase tracking-[0.1em] text-muted">
                0{i + 1} <span className="text-ink-soft">{stage}</span>
              </li>
            ))}
          </ul>
        </div>
        <ProtocolCore className="size-28 shrink-0 text-ink lg:size-36" title="The protocol's core logic" />
      </motion.div>

      <div className="container-flare relative z-10">
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

        {/* the machine: intake -> vault -> exits, one path visibly broken.
            Spans the full hero width so the composition carries real visual
            weight instead of a small diagram floating in empty margins. */}
        <motion.div
          className="mt-20 flex flex-col items-stretch gap-8 md:mt-28 md:flex-row md:items-center md:gap-0"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.85}
        >
          <div className="flex items-center gap-1 md:gap-2">
            <JunctionBox className="size-24 shrink-0 text-ink-soft md:size-28 lg:size-32" title="Intake checkpoint" decorative />
            <PipeSegment
              className="h-12 w-14 shrink-0 text-ink-soft sm:w-20 md:w-16 lg:w-24"
              preserveAspectRatio="none"
              decorative
            />
          </div>

          <div className="flex flex-col items-center px-1 md:px-3">
            <VaultModule className="size-32 shrink-0 text-ink sm:size-40 md:size-44 lg:size-52" />
            <span className="mt-2 font-condensed text-[11px] uppercase tracking-[0.1em] text-muted">
              Vault holds assets
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-7 md:pl-1">
            <div className="flex min-w-0 items-center gap-1 md:gap-2">
              <PipeSegment
                className="h-10 w-full min-w-0 shrink text-ink-soft"
                preserveAspectRatio="none"
                decorative
              />
              <div className="shrink-0 pl-2">
                <p className="font-condensed text-[11px] uppercase tracking-[0.1em] text-muted">Exit path</p>
                <p className="font-sans text-sm text-ink-soft">Redemption reaches the holder.</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-1 md:gap-2">
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
