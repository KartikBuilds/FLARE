import Link from "next/link";
import { SectionLabel, Badge } from "@flare/ui";
import { HourglassGlyph } from "@flare/ui/illustrations";
import { getIncidents, getVerifiedLockedTotalUsd } from "@/lib/incidents";
import { formatUsdCompact } from "@/lib/format";
import { HandNote, InkCircle, Parallax, Reveal, RevealGroup, RevealItem, TextReveal } from "@/components/motion";

export function ProblemSection() {
  const incidents = getIncidents();
  const total = getVerifiedLockedTotalUsd();

  return (
    <section id="problem" className="relative border-t border-line py-20 md:py-28">
      <div className="container-flare">
        <Reveal>
          <SectionLabel index="01" label="The Problem" />
        </Reveal>

        <div className="mt-6 grid min-w-0 gap-12 lg:grid-cols-[1.1fr_0.7fr_1fr] lg:items-start">
          <div className="min-w-0">
            <TextReveal
              as="h2"
              lines={["Billions locked", "forever."]}
              className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl"
            />
            <Reveal delay={0.12}>
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
            </Reveal>
          </div>

          <Parallax distance={26} className="flex justify-center">
            <HourglassGlyph className="h-44 w-auto text-ink-soft sm:h-56" />
          </Parallax>

          <div className="min-w-0">
            <Reveal delay={0.1}>
              {/* The headline figure gets ringed the way you would circle a
                  number you wanted to come back to. */}
              <span className="relative inline-block px-5 py-2">
                <span className="block font-display text-5xl font-bold tracking-tight">
                  {formatUsdCompact(total)}
                </span>
                <InkCircle delay={0.5} weight={1.8} className="text-ink/45" />
              </span>
              <p className="mt-2 font-condensed text-[12px] uppercase tracking-[0.1em] text-muted">
                Verified locked principal across FLARE case studies
              </p>
            </Reveal>

            <RevealGroup
              as="dl"
              stagger={0.06}
              delayChildren={0.1}
              className="mt-6 divide-y divide-line border-y border-line"
            >
              {incidents.map((incident) => (
                <RevealItem
                  key={incident.id}
                  distance={12}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <dt className="min-w-0 truncate font-sans text-sm text-ink">
                    {incident.name.replace(" — Unverified", "")}{" "}
                    <span className="text-muted">
                      ({incident.year}
                      {incident.ecosystem !== "Ethereum" ? `, ${incident.ecosystem}` : ""})
                    </span>
                  </dt>
                  <dd className="flex shrink-0 items-center gap-2">
                    {incident.amount.category === "unverified" ? (
                      <Badge tone="warning">Unverified</Badge>
                    ) : incident.amount.category === "liquidation-impact" ? (
                      <Badge tone="neutral">
                        {formatUsdCompact(incident.amount.valueUsd ?? 0)} impact
                      </Badge>
                    ) : (
                      <span className="font-condensed text-sm font-semibold">
                        {formatUsdCompact(incident.amount.valueUsd ?? 0)}
                      </span>
                    )}
                  </dd>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.08}>
              <HandNote className="mt-4 text-xl" delay={0.15}>
                only what we could source, twice.
              </HandNote>
              <p className="mt-2 font-sans text-xs text-muted">
                Liquidation-impact and unverified figures are shown but excluded from the total above
                — see{" "}
                <Link
                  href="/docs/case-studies"
                  className="underline decoration-line underline-offset-2 hover:decoration-ink"
                >
                  case study sourcing
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
