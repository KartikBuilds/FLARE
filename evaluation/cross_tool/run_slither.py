"""Runs Slither (CLI) against the frozen 20-fixture RO3 comparison subset.
Run inside the `analyzer` Docker service, which already has Slither
installed for FLARE's own use of its Python API:

    docker compose run --rm analyzer python3 /srv/evaluation/cross_tool/run_slither.py

See evaluation/tool-mapping.md for the frozen-subset rationale and
run_mythril.py (run inside the `cross-tool-eval` service instead) for the
Mythril half of this evaluation.
"""

from __future__ import annotations

import json
import subprocess
import time
from pathlib import Path

BENCHMARKS_DIR = Path("/srv/contracts/benchmarks")
RAW_DIR = Path("/srv/evaluation/raw")

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


def run_slither(sol_path: Path) -> dict:
    out_json = sol_path.with_suffix(".slither-out.json")
    start = time.monotonic()
    timed_out = False
    try:
        proc = subprocess.run(
            ["slither", str(sol_path), "--json", str(out_json)], capture_output=True, text=True, timeout=90
        )
        stderr, code = proc.stderr, proc.returncode
    except subprocess.TimeoutExpired:
        stderr = "TIMEOUT after 90s"
        code = -1
        timed_out = True
    elapsed = time.monotonic() - start

    result: dict = {
        "tool": "slither",
        "returncode": code,
        "elapsed_seconds": round(elapsed, 3),
        "timed_out": timed_out,
    }
    if out_json.exists():
        try:
            result["output"] = json.loads(out_json.read_text())
        finally:
            out_json.unlink(missing_ok=True)
    else:
        result["output"] = None
        result["stderr"] = stderr[-4000:]
    return result


def main() -> None:
    out_dir = RAW_DIR / "slither"
    out_dir.mkdir(parents=True, exist_ok=True)

    for detector_dir in DETECTOR_DIRS:
        for variant in VARIANTS:
            sol_path = BENCHMARKS_DIR / detector_dir / variant
            if not sol_path.exists():
                print(f"SKIP (missing): {sol_path}")
                continue
            print(f"=== {detector_dir}/{variant} ===")
            result = run_slither(sol_path)
            (out_dir / f"{detector_dir}-{variant}.json").write_text(json.dumps(result, indent=2))
            print(f"  {result['elapsed_seconds']}s, returncode={result['returncode']}, ok={result['output'] is not None}")

    print(f"\nDone. Raw output under {out_dir}.")


if __name__ == "__main__":
    main()
