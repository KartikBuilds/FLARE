import type { Metadata } from "next";
import { SectionLabel } from "@flare/ui";
import { TaxonomyIcon } from "@flare/ui/illustrations";
import { TAXONOMY_CATEGORIES } from "@flare/schemas";
import { getDetectorsByTaxonomy } from "@flare/rules";
import { getDocSource } from "@/lib/docs";
import { MdxArticle } from "@/components/docs/MdxArticle";
import { DocsShell } from "@/components/docs/DocsShell";
import { DocsPrevNext } from "@/components/docs/DocsPrevNext";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fund-Lock Taxonomy",
  description: "A comprehensive taxonomy of smart-contract fund-lock vulnerabilities.",
};

export default function TaxonomyPage() {
  const doc = getDocSource("taxonomy")!;

  return (
    <DocsShell>
      <div>
        <SectionLabel index="02" label="Documentation" />
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Fund-Lock Taxonomy</h1>
        <p className="mt-3 max-w-2xl font-sans text-base text-ink-soft">{doc.frontmatter.description}</p>

        <div className="mt-8">
          <MdxArticle id="doc-article" content={doc.content} />
        </div>

        <div className="mt-12 space-y-8">
          {TAXONOMY_CATEGORIES.map((category) => {
            const detectors = getDetectorsByTaxonomy(category.id);
            return (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-28 rounded-[var(--radius-card)] border border-line p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <TaxonomyIcon category={category.id} className="size-20 shrink-0 text-ink-soft" />
                  <div className="min-w-0">
                    <p className="font-condensed text-[12px] font-semibold text-muted">{category.index}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">{category.name}</h2>
                    <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-soft">{category.detail}</p>

                    <p className="mt-5 font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      Example detector signals
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {category.signals.map((signal) => (
                        <li key={signal} className="flex gap-2 font-sans text-sm text-ink-soft">
                          <span aria-hidden="true" className="text-muted">
                            —
                          </span>
                          {signal}
                        </li>
                      ))}
                    </ul>

                    {detectors.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {detectors.map((d) => (
                          <Link
                            key={d.id}
                            href="/docs/detectors"
                            className="rounded-[var(--radius-chip)] border border-line px-2.5 py-1 font-condensed text-[11px] uppercase tracking-[0.05em] text-ink-soft hover:border-ink hover:text-ink"
                          >
                            {d.id}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <DocsPrevNext slug="taxonomy" />
      </div>
    </DocsShell>
  );
}
