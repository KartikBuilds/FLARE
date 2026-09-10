import fs from "node:fs";
import path from "node:path";

export interface BenchmarkResult {
  precision: number | null;
  recall: number | null;
  total_cases: number;
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  errors: number;
}

const RESULT_PATH = path.join(process.cwd(), "..", "..", "evaluation", "benchmark-result.json");

/** Reads the generated benchmark report — see services/analyzer/app/core/benchmark.py.
 * Returns null if it hasn't been generated (fresh checkout before the
 * benchmark has been run), never a fabricated placeholder. */
export function getBenchmarkResult(): BenchmarkResult | null {
  try {
    const raw = fs.readFileSync(RESULT_PATH, "utf-8");
    return JSON.parse(raw) as BenchmarkResult;
  } catch {
    return null;
  }
}
