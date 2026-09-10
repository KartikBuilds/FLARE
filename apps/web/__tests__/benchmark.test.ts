import { describe, expect, it } from "vitest";
import { getBenchmarkResult } from "@/lib/benchmark";

describe("getBenchmarkResult", () => {
  it("reads the generated evaluation/benchmark-result.json with perfect precision and recall", () => {
    const result = getBenchmarkResult();
    expect(result).not.toBeNull();
    expect(result?.total_cases).toBe(40);
    expect(result?.precision).toBe(1);
    expect(result?.recall).toBe(1);
    expect(result?.false_positives).toBe(0);
    expect(result?.false_negatives).toBe(0);
  });
});
