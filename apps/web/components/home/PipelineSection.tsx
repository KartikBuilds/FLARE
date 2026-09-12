"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SectionLabel, Badge, ButtonLink, usePrefersReducedMotion } from "@flare/ui";
import { PipelineModule } from "@flare/ui/illustrations";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { hasLiveApiConfigured } from "@/lib/engine-status";
import { HandNote, Reveal, TextReveal } from "@/components/motion";

export function PipelineSection() {
  const [activeId, setActiveId] = useState<string>(PIPELINE_STAGES[0]!.id);
  const reduced = usePrefersReducedMotion();
  const active = PIPELINE_STAGES.find((s) => s.id === activeId) ?? PIPELINE_STAGES[0]!;

  return (
    <section className="shell-dark bg-grain relative overflow-hidden bg-charcoal py-20 text-paper md:py-28">
      <div className="container-flare relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Reveal>
              <SectionLabel index="02" label="Analysis Pipeline" tone="paper" />
            </Reveal>
            <TextReveal
              as="h2"
              lines={["From code", "to clarity."]}
              className="mt-6 max-w-lg font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md font-sans text-base text-paper/70">
                A nine-stage analysis pipeline turns Solidity source into a deterministic, evidenced
                fund-lock assessment.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="shrink-0">
            <Badge tone="outline-dark">
              {hasLiveApiConfigured() ? "Live engine" : "Engine offline"}
            </Badge>
            <HandNote className="mt-3 max-w-[13rem] text-xl text-paper/70" delay={0.25}>
              pick a stage —
            </HandNote>
          </Reveal>
        </div>

        <div
          role="tablist"
          aria-label="Analysis pipeline stages"
          // All 9 stage icons only fit without clipping/overflow from the lg
          // breakpoint up (measured: real horizontal page overflow at 640
          // and 768px when this switched to overflow-visible at sm) — stay
          // scrollable below that.
          className="mt-14 flex snap-x gap-3 overflow-x-auto pb-4 lg:gap-2 lg:overflow-visible lg:pb-0"
        >
          {PIPELINE_STAGES.map((stage, i) => {
            const isActive = stage.id === activeId;
            return (
              <button
                key={stage.id}
                role="tab"
                id={`pipeline-tab-${stage.id}`}
                aria-selected={isActive}
                aria-controls="pipeline-panel"
                onClick={() => setActiveId(stage.id)}
                className="group flex shrink-0 snap-start flex-col items-center gap-2 rounded-[var(--radius-control)] px-1 py-2 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <motion.div
                  // See TaxonomySection's comment: no opacity animation on
                  // above-the-fold content — Motion's `initial` ships as an
                  // inline SSR style, so opacity:0 here would genuinely hide
                  // every pipeline module from any client that never runs
                  // (or hasn't yet run) the reveal JS.
                  initial={{ y: reduced ? 0 : 12 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: reduced ? 0 : i * 0.05, duration: reduced ? 0.01 : 0.4 }}
                >
                  <PipelineModule
                    className={
                      "size-14 transition-colors " +
                      (isActive ? "text-highlight" : "text-paper/40 group-hover:text-paper/70")
                    }
                  />
                </motion.div>
                <span
                  className={
                    "font-handwritten text-base font-bold leading-none " +
                    (isActive ? "text-highlight" : "text-paper/50")
                  }
                >
                  {stage.index}
                </span>
                <span
                  className={
                    "font-condensed text-[10.5px] font-medium uppercase tracking-[0.05em] " +
                    (isActive ? "text-paper" : "text-paper/65")
                  }
                >
                  {stage.title}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={active.id}
          id="pipeline-panel"
          role="tabpanel"
          aria-labelledby={`pipeline-tab-${active.id}`}
          initial={{ y: reduced ? 0 : 8 }}
          animate={{ y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.3 }}
          className="sketch-box-2 mt-8 max-w-2xl border-[1.5px] border-charcoal-line bg-charcoal-soft p-6"
        >
          <p className="flex items-baseline gap-2 font-condensed text-[11px] uppercase tracking-[0.1em] text-highlight">
            <span className="font-handwritten text-lg leading-none tracking-normal">
              {active.index}
            </span>
            <span aria-hidden="true" className="text-paper/30">
              /
            </span>
            {active.title}
          </p>
          <p className="mt-2 font-sans text-sm text-paper/80">{active.summary}</p>
        </motion.div>

        <div className="mt-10">
          <ButtonLink href="/docs/architecture" tone="paper" variant="outline">
            Explore the pipeline
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
