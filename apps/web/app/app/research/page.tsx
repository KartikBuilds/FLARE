import Link from "next/link";
import { Card, Badge } from "@flare/ui";
import { RESEARCH_PILLARS } from "@/lib/research-pillars";
import { getIncidents } from "@/lib/incidents";

export const metadata = { title: "Research" };

export default function AppResearchPage() {
  const incidents = getIncidents();

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Research</h1>
      <p className="mt-1 max-w-xl font-sans text-sm text-muted">
        The research program behind FLARE, and the case studies that motivated its taxonomy.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {RESEARCH_PILLARS.map((pillar) => (
          <Card key={pillar.name}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-sans text-sm font-semibold text-ink">{pillar.name}</h2>
              <Badge tone={pillar.tone}>{pillar.status}</Badge>
            </div>
            <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted">{pillar.description}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold tracking-tight">Case studies</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/docs/case-studies#${incident.id}`}
            className="rounded-[var(--radius-card)] border border-line bg-paper-flat p-4 transition-colors hover:border-ink"
          >
            <p className="font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">{incident.year}</p>
            <p className="mt-1 font-sans text-sm font-medium text-ink">{incident.name.replace(" — Unverified", "")}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/docs/objectives"
        className="mt-8 inline-block font-condensed text-[12px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
      >
        Read the full research objectives →
      </Link>
    </div>
  );
}
