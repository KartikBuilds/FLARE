import Link from "next/link";
import { SectionLabel, Badge } from "@flare/ui";
import { getIncidents } from "@/lib/incidents";
import { formatUsdCompact } from "@/lib/format";

export function CaseStudiesSection() {
  const incidents = getIncidents();

  return (
    <section id="case-studies" className="border-t border-line py-20 md:py-28">
      <div className="container-flare">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel index="05" label="Case Studies" />
            <h2 className="mt-6 max-w-lg font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl">
              Real incidents. Real lessons.
            </h2>
            <p className="mt-5 max-w-md font-sans text-base text-ink-soft">
              Analysis of major fund-lock events across blockchain ecosystems — every figure below
              is sourced and its verification status disclosed.
            </p>
          </div>
          <Link
            href="/docs/case-studies"
            className="shrink-0 font-condensed text-[13px] font-medium uppercase tracking-[0.08em] text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            View case studies →
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/docs/case-studies#${incident.id}`}
              className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-line bg-paper-flat p-4 transition-colors hover:border-ink"
            >
              <div>
                <p className="font-condensed text-[11px] uppercase tracking-[0.08em] text-muted">{incident.year}</p>
                <p className="mt-1 font-sans text-sm font-medium leading-snug text-ink">
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
                  <Badge tone="neutral">{formatUsdCompact(incident.amount.valueUsd ?? 0)} impact</Badge>
                ) : (
                  <span className="font-condensed text-lg font-semibold">
                    {formatUsdCompact(incident.amount.valueUsd ?? 0)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
