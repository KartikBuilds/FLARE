"use client";

import { Card, DemoBadge, LiveEngineBadge } from "@flare/ui";
import { getTaxonomyCategory, type TaxonomyCategoryId } from "@flare/schemas";
import { useAnalyses } from "@/lib/queries";
import { DEMO_TAXONOMY_DISTRIBUTION } from "@/lib/demo-data";

function liveDistribution(analyses: ReturnType<typeof useAnalyses>["data"]) {
  const counts: Record<string, number> = {};
  for (const analysis of analyses ?? []) {
    for (const finding of analysis.findings) {
      counts[finding.taxonomy] = (counts[finding.taxonomy] ?? 0) + 1;
    }
  }
  return Object.entries(counts).map(([id, count]) => ({ id: id as TaxonomyCategoryId, count }));
}

export function TaxonomyDistributionWidget() {
  const { data: analyses } = useAnalyses();
  const distribution = analyses ? liveDistribution(analyses) : DEMO_TAXONOMY_DISTRIBUTION;
  const max = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold text-ink">Taxonomy Distribution</h2>
        {analyses ? <LiveEngineBadge /> : <DemoBadge />}
      </div>
      {/* Reserve the full five-category height. This widget shows fixture
          counts first and swaps to live ones when the query resolves; a live
          run covering fewer categories would otherwise shrink the card and
          shift the panel beside it. The taxonomy has exactly five categories,
          so this is the tallest the list can ever be. */}
      <div className="min-h-[13.5rem]">
      {distribution.length === 0 ? (
        <p className="mt-4 font-sans text-sm text-muted">No findings to distribute yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {distribution.map((entry) => {
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
      )}
      </div>
    </Card>
  );
}
