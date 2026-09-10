import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel, Badge } from "@flare/ui";
import { getTaxonomyCategory } from "@flare/schemas";
import { getDocSource } from "@/lib/docs";
import { getIncidents } from "@/lib/incidents";
import { formatUsdCompact } from "@/lib/format";
import { MdxArticle } from "@/components/docs/MdxArticle";
import { DocsShell } from "@/components/docs/DocsShell";
import { DocsPrevNext } from "@/components/docs/DocsPrevNext";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Real incidents, real lessons — every figure is sourced and its verification status disclosed.",
};

const AMOUNT_LABEL: Record<string, string> = {
  "locked-principal": "Locked principal",
  "liquidation-impact": "Liquidation impact",
  "post-recovery-allegation": "Post-recovery allegation",
  unverified: "Unverified",
};

export default function CaseStudiesPage() {
  const doc = getDocSource("case-studies")!;
  const incidents = getIncidents();

  return (
    <DocsShell>
      <div>
        <SectionLabel index="05" label="Documentation" />
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Case Studies</h1>
        <p className="mt-3 max-w-2xl font-sans text-base text-ink-soft">{doc.frontmatter.description}</p>

        <div className="mt-8">
          <MdxArticle id="doc-article" content={doc.content} />
        </div>

        <div className="mt-12 space-y-8">
          {incidents.map((incident) => (
            <article
              key={incident.id}
              id={incident.id}
              className="scroll-mt-28 rounded-[var(--radius-card)] border border-line p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-condensed text-[12px] uppercase tracking-[0.08em] text-muted">
                    {incident.year} · {incident.ecosystem}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                    {incident.name.replace(" — Unverified", "")}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-condensed text-xl font-semibold">
                    {incident.amount.valueUsd !== null ? formatUsdCompact(incident.amount.valueUsd) : "—"}
                  </span>
                  <Badge tone={incident.amount.category === "unverified" ? "warning" : "neutral"}>
                    {AMOUNT_LABEL[incident.amount.category]}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {incident.taxonomy.map((t) => (
                  <Link
                    key={t}
                    href={`/docs/taxonomy#${t}`}
                    className="rounded-[var(--radius-chip)] border border-line px-2.5 py-1 font-condensed text-[11px] uppercase tracking-[0.05em] text-ink-soft hover:border-ink hover:text-ink"
                  >
                    {getTaxonomyCategory(t).name}
                  </Link>
                ))}
                <Badge tone={incident.amountVerificationStatus === "verified" ? "success" : "warning"}>
                  {incident.amountVerificationStatus}
                </Badge>
              </div>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Architecture
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-ink-soft">{incident.architecture}</dd>
                </div>
                <div>
                  <dt className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Root cause
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-ink-soft">{incident.rootCause}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Fund-lock mechanism
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-ink-soft">{incident.fundLockMechanism}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Recovery attempts
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-ink-soft">{incident.recoveryAttempts}</dd>
                </div>
                {incident.amount.note && (
                  <div className="sm:col-span-2">
                    <dt className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      Amount note
                    </dt>
                    <dd className="mt-1 font-sans text-sm text-ink-soft">{incident.amount.note}</dd>
                  </div>
                )}
                {incident.disputedNotes && (
                  <div className="sm:col-span-2 rounded-[var(--radius-control)] border border-warning-soft bg-warning-soft/40 p-3">
                    <dt className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-warning">
                      Disputed
                    </dt>
                    <dd className="mt-1 font-sans text-sm text-ink-soft">{incident.disputedNotes}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Limitations
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-ink-soft">{incident.limitations}</dd>
                </div>
              </dl>

              {incident.primarySources.length > 0 && (
                <div className="mt-6">
                  <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Primary sources
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {incident.primarySources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-sans text-sm text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
                        >
                          {source.title}
                        </a>{" "}
                        <span className="text-xs text-muted">— {source.publisher}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>

        <DocsPrevNext slug="case-studies" />
      </div>
    </DocsShell>
  );
}
