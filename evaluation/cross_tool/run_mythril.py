"""Runs Mythril against the frozen 20-fixture RO3 comparison subset. Run
inside the `cross-tool-eval` Docker service:

    docker compose run --rm cross-tool-eval python3 run_mythril.py

See evaluation/tool-mapping.md for why Mythril needs its own image and for
the frozen-subset rationale, and run_slither.py (run inside the `analyzer`
service instead) for the Slither half of this evaluation.
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


def run_mythril(sol_path: Path) -> dict:
    start = time.monotonic()
    timed_out = False
    try:
        proc = subprocess.run(
            ["myth", "analyze", str(sol_path), "-o", "json"], capture_output=True, text=True, timeout=180
        )
        stdout, stderr, code = proc.stdout, proc.stderr, proc.returncode
    except subprocess.TimeoutExpired as exc:
        stdout = exc.stdout.decode() if isinstance(exc.stdout, bytes) else (exc.stdout or "")
        stderr = "TIMEOUT after 180s"
        code = -1
        timed_out = True
    elapsed = time.monotonic() - start

    result: dict = {
        "tool": "mythril",
        "returncode": code,
        "elapsed_seconds": round(elapsed, 3),
        "timed_out": timed_out,
    }
    try:
        result["output"] = json.loads(stdout) if stdout.strip() else None
    except json.JSONDecodeError:
        result["output"] = None
        result["stderr"] = (stderr or stdout)[-4000:]
    return result


def main() -> None:
    out_dir = RAW_DIR / "mythril"
    out_dir.mkdir(parents=True, exist_ok=True)

    for detector_dir in DETECTOR_DIRS:
        for variant in VARIANTS:
            sol_path = BENCHMARKS_DIR / detector_dir / variant
            if not sol_path.exists():
                print(f"SKIP (missing): {sol_path}")
                continue
            print(f"=== {detector_dir}/{variant} ===")
            result = run_mythril(sol_path)
            (out_dir / f"{detector_dir}-{variant}.json").write_text(json.dumps(result, indent=2))
            print(f"  {result['elapsed_seconds']}s, returncode={result['returncode']}, ok={result['output'] is not None}")

    print(f"\nDone. Raw output under {out_dir}.")


if __name__ == "__main__":
    main()
