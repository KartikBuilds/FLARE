"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { Badge, Card, cn } from "@flare/ui";
import { getTaxonomyCategory } from "@flare/schemas";
import type { Finding, Incident } from "@flare/schemas";

const SEVERITY_TONE: Record<string, "danger" | "warning" | "neutral"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "neutral",
};

function FindingCard({ finding, incidents }: { finding: Finding; incidents: Incident[] }) {
  const [open, setOpen] = useState(false);
  const category = getTaxonomyCategory(finding.taxonomy);

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={SEVERITY_TONE[finding.severity] ?? "neutral"}>{finding.severity}</Badge>
            <Badge tone="neutral">{category.name}</Badge>
            {finding.validated && (
              <Badge tone="success">
                <ShieldCheck className="mr-1 inline size-3" aria-hidden="true" />
                Foundry-validated
              </Badge>
            )}
            <span className="font-mono text-[11px] text-muted">{finding.detectorId}</span>
          </div>
          <p className="mt-1.5 font-sans text-sm font-medium text-ink">{finding.title}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">
            {finding.file}:{finding.lineStart}
            {finding.lineEnd !== finding.lineStart ? `-${finding.lineEnd}` : ""} · confidence{" "}
            {Math.round(finding.confidence * 100)}%
          </p>
        </div>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-line px-5 py-4">
          <div>
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Source
            </p>
            <pre
              tabIndex={0}
              role="region"
              aria-label="Source code excerpt"
              className="mt-1.5 overflow-x-auto rounded-[var(--radius-control)] border border-line bg-charcoal p-3 font-mono text-[12.5px] leading-relaxed text-paper focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {finding.codeExcerpt}
            </pre>
          </div>

          <div>
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Explanation
            </p>
            <p className="mt-1 font-sans text-sm text-ink-soft">{finding.explanation}</p>
          </div>

          <div>
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Triggering condition
            </p>
            <code className="mt-1 block font-mono text-xs text-ink-soft">{finding.triggeringCondition}</code>
          </div>

          <div>
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-danger">
              Asset-lock consequence
            </p>
            <p className="mt-1 font-sans text-sm text-ink-soft">{finding.assetLockConsequence}</p>
          </div>

          <div>
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-success">
              Recommended remediation
            </p>
            <p className="mt-1 font-sans text-sm text-ink-soft">{finding.remediation}</p>
          </div>

          {finding.falsePositiveSuppressed && finding.suppressionReason && (
            <div className="rounded-[var(--radius-control)] border border-warning-soft bg-warning-soft/40 p-3">
              <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-warning">
                Suppressed as a false positive
              </p>
              <p className="mt-1 font-sans text-sm text-ink-soft">{finding.suppressionReason}</p>
            </div>
          )}

          {finding.relatedIncidentIds.length > 0 && (
            <div>
              <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                Related incidents
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {finding.relatedIncidentIds.map((id) => {
                  const incident = incidents.find((i) => i.id === id);
                  if (!incident) return null;
                  return (
                    <Link
                      key={id}
                      href={`/docs/case-studies#${id}`}
                      className="rounded-[var(--radius-chip)] border border-line px-2.5 py-1 font-condensed text-[11px] uppercase tracking-[0.05em] text-ink-soft hover:border-ink hover:text-ink"
                    >
                      {incident.name.replace(" — Unverified", "")}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <p className="font-mono text-[11px] text-muted">
            {finding.id} · detector v{finding.detectorVersion}
          </p>
        </div>
      )}
    </Card>
  );
}

export function FindingsList({ findings, incidents }: { findings: Finding[]; incidents: Incident[] }) {
  if (findings.length === 0) {
    return (
      <Card>
        <p className="font-sans text-sm text-muted">No findings from the current detector registry.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {findings.map((finding) => (
        <FindingCard key={finding.id} finding={finding} incidents={incidents} />
      ))}
    </div>
  );
}
