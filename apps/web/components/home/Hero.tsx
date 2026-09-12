"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ButtonLink, SectionLabel, usePrefersReducedMotion } from "@flare/ui";
import { CoinAsset, ProtocolCore } from "@flare/ui/illustrations";
import { HandNote, InkBlots, InkUnderline, Magnetic, Parallax } from "@/components/motion";
import { Scene3D } from "@/components/three/Scene3D";
import { HeroFallback } from "@/components/three/fallbacks/HeroFallback";
import { maskLineVariants, riseSafeVariants, staggerVariants } from "@/lib/motion";

// ssr:false plus a dynamic import keeps three.js out of this route's initial
// bundle entirely — the chunk is only fetched once Scene3D decides the device
// should render it.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

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
            Rendered in WebGL where the device can carry it, and as the same
            composition in line art everywhere else. The route labels stay in
            HTML below it — nothing a reader needs is inside the canvas. */}
        <motion.div
          className="mt-14 md:mt-20"
          initial="hidden"
          animate="show"
          variants={rise}
          custom={0.85}
        >
          <Scene3D
            Scene={HeroScene}
            fallback={<HeroFallback />}
            aspect="16 / 7"
            description="An asset approaches the protocol from the left, passes an intake checkpoint and enters the vault. Two withdrawal routes leave the vault: one intact route along which value reaches the holder, and one severed route where the withdrawal path fails and the asset cannot get out."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="border-l-2 border-success pl-4">
              <p className="font-condensed text-[11px] uppercase tracking-[0.1em] text-success">
                Exit path
              </p>
              <p className="mt-0.5 font-sans text-sm text-ink-soft">
                Redemption reaches the holder.
              </p>
            </div>
            <div className="border-l-2 border-danger pl-4">
              <p className="font-condensed text-[11px] uppercase tracking-[0.1em] text-danger">
                Withdrawal path fails
              </p>
              <p className="mt-0.5 font-sans text-sm text-ink-soft">
                A dependency, state, or check blocks the exit.
              </p>
            </div>
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
