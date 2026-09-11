"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { SectionLabel, usePrefersReducedMotion } from "@flare/ui";
import { TaxonomyIcon } from "@flare/ui/illustrations";
import { TAXONOMY_CATEGORIES } from "@flare/schemas";

export function TaxonomySection() {
  const [revealed, setRevealed] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  return (
    <section id="taxonomy" className="border-t border-line py-20 md:py-28">
      <div className="container-flare">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel index="03" label="Taxonomy" />
            <h2 className="mt-6 max-w-lg font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl">
              Five ways funds get locked.
            </h2>
            <p className="mt-5 max-w-md font-sans text-base text-ink-soft">
              A comprehensive taxonomy of smart-contract fund-lock vulnerabilities.
            </p>
          </div>
          <Link
            href="/docs/taxonomy"
            className="shrink-0 font-condensed text-[13px] font-medium uppercase tracking-[0.08em] text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Explore all →
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TAXONOMY_CATEGORIES.map((category, i) => {
            const isRevealed = revealed === category.id;
            return (
              <motion.div
                key={category.id}
                // Never animate opacity for above-the-fold content: Motion
                // applies `initial` as an inline style during SSR, so an
                // opacity:0 start ships genuinely invisible markup to any
                // client that doesn't run (or hasn't yet run) the JS that
                // flips it back — a real no-JS/crawler/slow-hydration bug,
                // confirmed directly (curl the SSR HTML: it shipped
                // `opacity:0` on every card). A translate-only reveal keeps
                // content fully visible/readable with or without JS.
                initial={{ y: reduced ? 0 : 16 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: reduced ? 0 : i * 0.06, duration: reduced ? 0.01 : 0.45 }}
              >
                <Link
                  href={`/docs/taxonomy#${category.id}`}
                  onFocus={() => setRevealed(category.id)}
                  onBlur={() => setRevealed(null)}
                  onMouseEnter={() => setRevealed(category.id)}
                  onMouseLeave={() => setRevealed(null)}
                  className="group block h-full rounded-[var(--radius-card)] border border-line bg-paper-flat p-5 transition-colors hover:border-ink focus-visible:border-ink"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-condensed text-[12px] font-semibold text-muted">{category.index}</span>
                    <TaxonomyIcon
                      category={category.id}
                      className="size-14 text-ink-soft transition-colors group-hover:text-ink"
                    />
                  </div>
                  <p className="mt-4 font-condensed text-sm font-semibold uppercase tracking-[0.04em]">
                    {category.name}
                  </p>
                  <p className="mt-2 font-sans text-[13px] leading-snug text-muted">{category.shortDescription}</p>

                  <div
                    className={
                      "mt-3 grid transition-[grid-template-rows] duration-200 " +
                      (isRevealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
                    }
                  >
                    <ul className="overflow-hidden">
                      {category.signals.map((signal) => (
                        <li key={signal} className="mt-1.5 flex gap-1.5 font-sans text-[11.5px] text-ink-soft">
                          <span aria-hidden="true" className="text-muted">
                            —
                          </span>
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
