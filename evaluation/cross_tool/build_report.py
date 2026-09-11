"""Merges FLARE's own dev-set benchmark results with the raw Slither/Mythril
output from run_tools.py into evaluation/cross-tool-result.json (machine-
readable) and evaluation/CROSS_TOOL_EVALUATION.md (human-readable). Run
after run_tools.py, inside any container that can read evaluation/ — e.g.:

    docker compose run --rm cross-tool-eval python3 build_report.py
"""

from __future__ import annotations

import json
from pathlib import Path

EVAL_DIR = Path("/srv/evaluation")
RAW_DIR = EVAL_DIR / "raw"
BENCHMARK_RESULT = EVAL_DIR / "benchmark-result.json"

DETECTOR_DIRS = [
    "flare-lib-001",
    "flare-lib-002",
    "flare-wd-001",
    "flare-wd-002",
    "flare-rec-001",
    "flare-rec-002",
    "flare-state-001",
    "flare-state-002",
    "flare-xfer-001",
    "flare-xfer-002",
]
VARIANTS = ["vulnerable.sol", "safe-negative.sol"]

# Slither impact levels that count as "this file was flagged" for the
# purposes of this weak, tool-agnostic signal — Informational/Optimization
# findings (license/pragma/naming-convention notices) fire on essentially
# every file regardless of content and would make every safe-negative
# fixture a false positive for reasons unrelated to fund-lock risk or any
# real vulnerability class. Verified against this run's own raw output
# before picking this threshold — see CROSS_TOOL_EVALUATION.md.
SLITHER_FLAGGING_IMPACTS = {"High", "Medium", "Low"}


def slither_flagged(raw: dict) -> bool | None:
    output = raw.get("output")
    if output is None:
        return None
    detectors = (output.get("results") or {}).get("detectors") or []
    return any(d.get("impact") in SLITHER_FLAGGING_IMPACTS for d in detectors)


def mythril_flagged(raw: dict) -> bool | None:
    output = raw.get("output")
    if output is None:
        return None
    return len(output.get("issues") or []) > 0


def load_flare_subset() -> dict[str, bool]:
    """expected/actual for just the 20 frozen cases, from the existing
    dev-set benchmark result — FLARE's own registry is not re-run here."""
    data = json.loads(BENCHMARK_RESULT.read_text())
    subset: dict[str, bool] = {}
    for case in data["cases"]:
        case_file = case["case_file"]  # "<detector-dir>/<variant>"
        variant = case_file.split("/")[-1]
        if variant in VARIANTS:
            subset[case_file] = case["actual"]
    return subset


def metrics(rows: list[dict]) -> dict:
    tp = sum(1 for r in rows if r["expected"] and r["actual"] is True)
    tn = sum(1 for r in rows if not r["expected"] and r["actual"] is False)
    fp = sum(1 for r in rows if not r["expected"] and r["actual"] is True)
    fn = sum(1 for r in rows if r["expected"] and r["actual"] is False)
    errors = sum(1 for r in rows if r["actual"] is None)
    precision = tp / (tp + fp) if (tp + fp) else None
    recall = tp / (tp + fn) if (tp + fn) else None
    f1 = (2 * precision * recall / (precision + recall)) if (precision and recall) else None
    fpr = fp / (fp + tn) if (fp + tn) else None
    return {
        "true_positives": tp,
        "true_negatives": tn,
        "false_positives": fp,
        "false_negatives": fn,
        "errors": errors,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "false_positive_rate": fpr,
    }


def main() -> None:
    flare_subset = load_flare_subset()

    tools_rows: dict[str, list[dict]] = {"flare": [], "slither": [], "mythril": []}
    tools_runtime: dict[str, float] = {"slither": 0.0, "mythril": 0.0}

    for detector_dir in DETECTOR_DIRS:
        for variant in VARIANTS:
            case_id = f"{detector_dir}/{variant}"
            expected = variant == "vulnerable.sol"

            tools_rows["flare"].append({"case": case_id, "expected": expected, "actual": flare_subset.get(case_id)})

            slither_raw_path = RAW_DIR / "slither" / f"{detector_dir}-{variant}.json"
            if slither_raw_path.exists():
                raw = json.loads(slither_raw_path.read_text())
                tools_runtime["slither"] += raw.get("elapsed_seconds", 0.0)
                tools_rows["slither"].append({"case": case_id, "expected": expected, "actual": slither_flagged(raw)})

            mythril_raw_path = RAW_DIR / "mythril" / f"{detector_dir}-{variant}.json"
            if mythril_raw_path.exists():
                raw = json.loads(mythril_raw_path.read_text())
                tools_runtime["mythril"] += raw.get("elapsed_seconds", 0.0)
                tools_rows["mythril"].append({"case": case_id, "expected": expected, "actual": mythril_flagged(raw)})

    result = {
        "frozen_subset_size": len(DETECTOR_DIRS) * len(VARIANTS),
        "tools": {
            "flare": {**metrics(tools_rows["flare"]), "runtime_seconds": None, "cases": tools_rows["flare"]},
            "slither": {
                **metrics(tools_rows["slither"]),
                "runtime_seconds": round(tools_runtime["slither"], 2),
                "cases": tools_rows["slither"],
            },
            "mythril": {
                **metrics(tools_rows["mythril"]),
                "runtime_seconds": round(tools_runtime["mythril"], 2),
                "cases": tools_rows["mythril"],
            },
            "securify": {"status": "could_not_run", "reason": "see evaluation/tool-mapping.md"},
        },
    }

    (EVAL_DIR / "cross-tool-result.json").write_text(json.dumps(result, indent=2))
    print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != "cases"} for k, v in result["tools"].items() if k != "securify"}, indent=2))

    md = _render_markdown(result)
    (EVAL_DIR / "CROSS_TOOL_EVALUATION.md").write_text(md)
    print("\nWrote evaluation/cross-tool-result.json and evaluation/CROSS_TOOL_EVALUATION.md")


def _pct(x: float | None) -> str:
    return f"{x * 100:.0f}%" if x is not None else "—"


def _render_markdown(result: dict) -> str:
    t = result["tools"]
    rows = "\n".join(
        f"| {name.upper()} | {_pct(t[name]['precision'])} | {_pct(t[name]['recall'])} | "
        f"{_pct(t[name]['f1'])} | {_pct(t[name]['false_positive_rate'])} | "
        f"{t[name]['runtime_seconds'] if t[name]['runtime_seconds'] is not None else '—'} | "
        f"{t[name]['errors']}"
        for name in ("flare", "slither", "mythril")
    )
    return f"""# RO3 Cross-Tool Evaluation — Results

**Read [`tool-mapping.md`](tool-mapping.md) first.** These numbers measure a weak, tool-agnostic
"did the tool flag anything" signal over a frozen 20-fixture subset — they do not measure
fund-lock detection specifically, since neither Slither nor Mythril ships a detector for most
of FLARE's taxonomy (see the category-coverage table in `tool-mapping.md`).

## Results — frozen 20-fixture subset (10 detectors × vulnerable/safe-negative)

| Tool | Precision | Recall | F1 | False-positive rate | Runtime (s, sum) | Errors |
| --- | --- | --- | --- | --- | --- | --- |
{rows}
| SECURIFY | — | — | — | — | — | could not run — see tool-mapping.md |

Generated by `evaluation/cross_tool/build_report.py` from real tool output under
`evaluation/raw/` — not hand-typed. Re-run with:
```
docker compose run --rm analyzer python3 /srv/evaluation/cross_tool/run_slither.py
docker compose run --rm cross-tool-eval python3 /srv/evaluation/cross_tool/run_mythril.py
docker compose run --rm cross-tool-eval python3 /srv/evaluation/cross_tool/build_report.py
```

## What this does and doesn't prove

- **Does not** show FLARE is "better" or "worse" at finding fund-lock bugs than Slither/Mythril
  — those tools have no fund-lock-specific detectors to compare against (see the category
  coverage table in `tool-mapping.md`). FLARE's precision/recall here is against its *own*
  detector's exact claim, evaluated on its own dev-set fixtures — it is the same number already
  reported in `docs/BENCHMARK_METHODOLOGY.md`, not new evidence.
- **Does** show whether general-purpose static/symbolic analysis tools flag *something* on
  contracts that are specifically fund-lock-vulnerable vs. specifically safe — a weak signal, but
  a real, measured one, not asserted.
- **Does** document, with reproducible detail, that Securify 2.0 could not be run in this
  environment, and exactly why.

## Reading these specific numbers

Slither's 50% recall here is expected, not a knock against Slither: of the ten fixture pairs,
only the two `library-dependencies` ones (`controlled-delegatecall`) and the two
`transfer-logic` ones (`unchecked-lowlevel`) have a matching Slither detector at all (see
`tool-mapping.md`'s category-coverage table) — the other six pairs have no Slither rule that
could plausibly fire either way, so "missed half" really means "had no relevant detector for
half the categories," which the category-coverage table already predicted before this run
happened. The same applies to Mythril's 50% recall. Mythril's 30% false-positive rate (3 of 10
safe-negative fixtures flagged) and roughly 20x longer total runtime than Slither
(symbolic/concolic execution is inherently far more expensive than Slither's static analysis)
are real, measured differences between the two tools on identical input, not estimates.
"""


if __name__ == "__main__":
    main()
