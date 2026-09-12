import Link from "next/link";
import { SectionLabel, Badge } from "@flare/ui";
import { getIncidents } from "@/lib/incidents";
import { formatUsdCompact } from "@/lib/format";
import { HandNote, Reveal, RevealGroup, RevealItem, TextReveal } from "@/components/motion";

const SKETCH = ["sketch-box", "sketch-box-2", "sketch-box-3"];

export function CaseStudiesSection() {
  const incidents = getIncidents();

  return (
    <section id="case-studies" className="border-t border-line py-20 md:py-28">
      <div className="container-flare">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal>
              <SectionLabel index="05" label="Case Studies" />
            </Reveal>
            <TextReveal
              as="h2"
              lines={["Real incidents.", "Real lessons."]}
              className="mt-6 max-w-lg font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md font-sans text-base text-ink-soft">
                Analysis of major fund-lock events across blockchain ecosystems — every figure below
                is sourced and its verification status disclosed.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="shrink-0">
            <HandNote className="mb-2 text-xl" delay={0.2}>
              five we could verify
            </HandNote>
            <Link
              href="/docs/case-studies"
              className="font-condensed text-[13px] font-medium uppercase tracking-[0.08em] text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              View case studies →
            </Link>
          </Reveal>
        </div>

        <RevealGroup stagger={0.07} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {incidents.map((incident, i) => (
            <RevealItem key={incident.id} className="h-full">
              <Link
                href={`/docs/case-studies#${incident.id}`}
                className={
                  "group flex h-full flex-col justify-between border-[1.5px] border-line-strong/60 bg-paper-flat p-4 " +
                  "transition-[transform,border-color,box-shadow] duration-300 " +
                  "hover:-translate-y-1 hover:border-ink hover:shadow-[var(--shadow-lift)] " +
                  "motion-reduce:hover:translate-y-0 " +
                  SKETCH[i % SKETCH.length]
                }
              >
                <div>
                  {/* The year reads like a date written on a file card. */}
                  <p className="font-handwritten text-xl font-bold leading-none text-ink">
                    {incident.year}
                  </p>
                  <p className="mt-1.5 font-sans text-sm font-medium leading-snug text-ink">
                    {incident.name.replace(" — Unverified", "")}
                  </p>
                  <p className="mt-1 font-condensed text-[10.5px] uppercase tracking-[0.06em] text-muted">
                    {incident.ecosystem}
                  </p>
                </div>
                <div className="mt-4">
                  {incident.amount.category === "unverified" ? (
                    <Badge tone="warning">Unverified</Badge>
                  ) : incident.amount.category === "liquidation-impact" ? (
                    <Badge tone="neutral">
                      {formatUsdCompact(incident.amount.valueUsd ?? 0)} impact
                    </Badge>
                  ) : (
                    <span className="font-condensed text-lg font-semibold">
                      {formatUsdCompact(incident.amount.valueUsd ?? 0)}
                    </span>
                  )}
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
