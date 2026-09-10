import { Card, DemoBadge } from "@flare/ui";
import { getTaxonomyCategory } from "@flare/schemas";
import { DEMO_TAXONOMY_DISTRIBUTION } from "@/lib/demo-data";

export function TaxonomyDistributionWidget() {
  const max = Math.max(...DEMO_TAXONOMY_DISTRIBUTION.map((d) => d.count));

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold text-ink">Taxonomy Distribution</h2>
        <DemoBadge />
      </div>
      <ul className="mt-4 space-y-3">
        {DEMO_TAXONOMY_DISTRIBUTION.map((entry) => {
          const category = getTaxonomyCategory(entry.id);
          return (
            <li key={entry.id}>
              <div className="flex items-center justify-between font-sans text-[13px]">
                <span className="text-ink-soft">{category.name}</span>
                <span className="font-medium text-ink">{entry.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${(entry.count / max) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
