import { describe, expect, it } from "vitest";
import { layoutGraph } from "@flare/graph";
import { VAULTLINE_GRAPH } from "@/lib/demo-findings";

describe("layoutGraph", () => {
  it("positions every node exactly once", () => {
    const positioned = layoutGraph(VAULTLINE_GRAPH);
    expect(positioned).toHaveLength(VAULTLINE_GRAPH.nodes.length);
    expect(new Set(positioned.map((n) => n.id)).size).toBe(VAULTLINE_GRAPH.nodes.length);
  });

  it("places the constructor before downstream nodes it reaches", () => {
    const positioned = layoutGraph(VAULTLINE_GRAPH);
    const byId = new Map(positioned.map((n) => [n.id, n]));
    const constructor = byId.get("VaultLine.constructor")!;
    const deposit = byId.get("VaultLine.deposit")!;
    const withdraw = byId.get("VaultLine.withdraw")!;

    expect(constructor.x).toBeLessThan(deposit.x);
    expect(deposit.x).toBeLessThan(withdraw.x);
  });
});
