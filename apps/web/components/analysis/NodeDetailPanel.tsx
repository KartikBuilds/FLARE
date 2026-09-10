import type { GraphNode } from "@flare/graph";
import type { Finding } from "@flare/schemas";
import { Badge, Card } from "@flare/ui";

const SEVERITY_TONE: Record<string, "danger" | "warning" | "neutral"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export function NodeDetailPanel({ node, findings }: { node: GraphNode | null; findings: Finding[] }) {
  if (!node) {
    return (
      <Card className="flex h-full items-center justify-center text-center">
        <p className="font-sans text-sm text-muted">Click a node to inspect its contract, function, and requirements.</p>
      </Card>
    );
  }

  const relatedFindings = findings.filter((f) => node.findingIds.includes(f.id));

  return (
    <Card>
      <p className="font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">{node.role}</p>
      <h3 className="mt-1 font-display text-xl font-bold tracking-tight">{node.function}</h3>
      <p className="font-sans text-sm text-muted">{node.contract}</p>

      {node.file && (
        <p className="mt-3 font-mono text-xs text-ink-soft">
          {node.file}:{node.lineStart}
          {node.lineEnd !== node.lineStart ? `-${node.lineEnd}` : ""}
        </p>
      )}

      {node.stateRequirements.length > 0 && (
        <div className="mt-4">
          <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            State requirements
          </p>
          <ul className="mt-1.5 space-y-1">
            {node.stateRequirements.map((r) => (
              <li key={r} className="font-mono text-xs text-ink-soft">
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {node.accessRequirements.length > 0 && (
        <div className="mt-4">
          <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Access requirements
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {node.accessRequirements.map((r) => (
              <Badge key={r} tone="neutral">
                {r}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {relatedFindings.length > 0 && (
        <div className="mt-4">
          <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Related findings
          </p>
          <ul className="mt-1.5 space-y-2">
            {relatedFindings.map((f) => (
              <li key={f.id} className="flex items-center gap-2">
                <Badge tone={SEVERITY_TONE[f.severity] ?? "neutral"}>{f.severity}</Badge>
                <span className="font-sans text-xs text-ink-soft">{f.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
