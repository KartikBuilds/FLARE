import Link from "next/link";
import { SectionLabel, Badge } from "@flare/ui";
import { HourglassGlyph } from "@flare/ui/illustrations";
import { getIncidents, getVerifiedLockedTotalUsd } from "@/lib/incidents";
import { formatUsdCompact } from "@/lib/format";

export function ProblemSection() {
  const incidents = getIncidents();
  const total = getVerifiedLockedTotalUsd();

  return (
    <section id="problem" className="border-t border-line py-20 md:py-28">
      <div className="container-flare">
        <SectionLabel index="01" label="The Problem" />
        <div className="mt-6 grid gap-12 lg:grid-cols-[1.1fr_0.7fr_1fr] lg:items-start">
          <div>
            <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl">
              Billions locked forever.
            </h2>
            <p className="mt-5 max-w-md font-sans text-base text-ink-soft">
              Smart-contract fund-locks occur when assets become irreversibly inaccessible due to
              design, dependency, state or logic failures — not always malice, but often
              preventable. Across DeFi, verified losses to hacks and lockups have run into the
              billions in a single year; the case studies below are five we could independently
              verify in detail.
            </p>
            <Link
              href="/docs/methodology"
              className="mt-6 inline-flex items-center gap-2 font-condensed text-[13px] font-medium uppercase tracking-[0.08em] text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              Learn more ↓
            </Link>
          </div>

          <div className="flex justify-center">
            <HourglassGlyph className="h-44 w-auto text-ink-soft sm:h-56" />
          </div>

          <div>
            <p className="font-display text-5xl font-bold tracking-tight">{formatUsdCompact(total)}</p>
            <p className="mt-1 font-condensed text-[12px] uppercase tracking-[0.1em] text-muted">
              Verified locked principal across FLARE case studies
            </p>

            <dl className="mt-6 divide-y divide-line border-y border-line">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <dt className="truncate font-sans text-sm text-ink">
                      {incident.name.replace(" — Unverified", "")}{" "}
                      <span className="text-muted">
                        ({incident.year}
                        {incident.ecosystem !== "Ethereum" ? `, ${incident.ecosystem}` : ""})
                      </span>
                    </dt>
                  </div>
                  <dd className="flex shrink-0 items-center gap-2">
                    {incident.amount.category === "unverified" ? (
                      <Badge tone="warning">Unverified</Badge>
                    ) : incident.amount.category === "liquidation-impact" ? (
                      <Badge tone="neutral">{formatUsdCompact(incident.amount.valueUsd ?? 0)} impact</Badge>
                    ) : (
                      <span className="font-condensed text-sm font-semibold">
                        {formatUsdCompact(incident.amount.valueUsd ?? 0)}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 font-sans text-xs text-muted">
              Liquidation-impact and unverified figures are shown but excluded from the total above
              — see{" "}
              <Link href="/docs/case-studies" className="underline decoration-line underline-offset-2 hover:decoration-ink">
                case study sourcing
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
