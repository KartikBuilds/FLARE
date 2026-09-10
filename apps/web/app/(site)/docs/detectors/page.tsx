import type { Metadata } from "next";
import { SectionLabel, Badge } from "@flare/ui";
import { DETECTOR_REGISTRY } from "@flare/rules";
import { getTaxonomyCategory } from "@flare/schemas";
import { getDocSource } from "@/lib/docs";
import { MdxArticle } from "@/components/docs/MdxArticle";
import { DocsShell } from "@/components/docs/DocsShell";
import { DocsPrevNext } from "@/components/docs/DocsPrevNext";

export const metadata: Metadata = {
  title: "Detector Registry",
  description: "A versioned, evidence-based detector registry.",
};

const SEVERITY_TONE = {
  critical: "danger",
  high: "warning",
  medium: "neutral",
  low: "neutral",
} as const;

export default function DetectorsPage() {
  const doc = getDocSource("detectors")!;
  const implementedCount = DETECTOR_REGISTRY.filter((d) => d.status === "implemented").length;

  return (
    <DocsShell>
      <div>
        <SectionLabel index="06" label="Documentation" />
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Detector Registry</h1>
        <p className="mt-3 max-w-2xl font-sans text-base text-ink-soft">{doc.frontmatter.description}</p>

        <div className="mt-8">
          <MdxArticle id="doc-article" content={doc.content} />
        </div>

        <div className="mt-10 flex items-center gap-3">
          <Badge tone={implementedCount === DETECTOR_REGISTRY.length ? "success" : "warning"}>
            {implementedCount} / {DETECTOR_REGISTRY.length} implemented
          </Badge>
        </div>

        <div className="mt-6 space-y-3">
          {DETECTOR_REGISTRY.map((detector) => (
            <div key={detector.id} className="rounded-[var(--radius-card)] border border-line p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-ink">{detector.id}</span>
                <span className="font-mono text-[11px] text-muted">v{detector.version}</span>
                <Badge tone={SEVERITY_TONE[detector.defaultSeverity]}>{detector.defaultSeverity}</Badge>
                <Badge tone={detector.status === "implemented" ? "success" : "neutral"}>{detector.status}</Badge>
                <Badge tone="neutral">{getTaxonomyCategory(detector.taxonomy).name}</Badge>
              </div>
              <p className="mt-2.5 font-sans text-sm font-medium text-ink">{detector.name}</p>
              <p className="mt-1.5 font-sans text-sm text-ink-soft">{detector.summary}</p>
              <p className="mt-2 font-sans text-xs text-muted">
                <span className="font-semibold">Evidence required:</span> {detector.evidenceRequirement}
              </p>
            </div>
          ))}
        </div>

        <DocsPrevNext slug="detectors" />
      </div>
    </DocsShell>
  );
}
