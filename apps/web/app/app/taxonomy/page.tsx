import Link from "next/link";
import { Card } from "@flare/ui";
import { TaxonomyIcon } from "@flare/ui/illustrations";
import { TAXONOMY_CATEGORIES } from "@flare/schemas";
import { getDetectorsByTaxonomy } from "@flare/rules";

export const metadata = { title: "Taxonomy" };

export default function AppTaxonomyPage() {
  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Taxonomy</h1>
      <p className="mt-1 max-w-xl font-sans text-sm text-muted">
        Quick reference for the five fund-lock categories FLARE checks for. Full detail and
        detector mappings live in{" "}
        <Link href="/docs/taxonomy" className="text-ink underline decoration-line underline-offset-2 hover:decoration-ink">
          the documentation
        </Link>
        .
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TAXONOMY_CATEGORIES.map((category) => {
          const count = getDetectorsByTaxonomy(category.id).length;
          return (
            <Card key={category.id}>
              <div className="flex items-start justify-between">
                <span className="font-condensed text-[12px] font-semibold text-muted">{category.index}</span>
                <TaxonomyIcon category={category.id} className="size-12 text-ink-soft" />
              </div>
              <h2 className="mt-3 font-sans text-sm font-semibold uppercase tracking-[0.02em]">{category.name}</h2>
              <p className="mt-2 font-sans text-[13px] leading-snug text-muted">{category.shortDescription}</p>
              <p className="mt-3 font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">
                {count} detector{count === 1 ? "" : "s"}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
