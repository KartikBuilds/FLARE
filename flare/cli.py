"""Command line: `flare scan <file.sol> [--format json|text] [--timeout SECONDS]`.

Exit codes: 0 complete with no findings, 1 complete with findings,
2 incomplete or failed (and argparse usage errors).
"""

import argparse
import json
from pathlib import Path

from flare.engine import run_scan
from flare.models import DISCLAIMER, ScanResult


def _text(result: ScanResult) -> str:
    lines = [f"FLARE scan: {result.source_name}", f"Status: {result.status}"]
    if result.error:
        lines.append(f"Error: {result.error['code']}: {result.error['message']}")
    level = result.overall_level()
    if level:
        lines.append(f"Overall level: {level}")
    for f in result.findings:
        where = f"lines {f.line_start}-{f.line_end}" if f.line_start else "location unknown"
        lines.append(f"  [{f.severity}] {f.category} — {f.detector} @ {where}")
        lines.append(f"      {f.description}")
    lines.append("Not checked:")
    lines.extend(f"  - {item}" for item in result.not_checked)
    lines.append(DISCLAIMER)
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="flare", description="Fund-lock analysis for Solidity.")
    sub = parser.add_subparsers(dest="command", required=True)
    scan = sub.add_parser("scan", help="Scan one Solidity file.")
    scan.add_argument("path", type=Path)
    scan.add_argument("--format", choices=["text", "json"], default="text")
    scan.add_argument("--timeout", type=float, default=30.0, help="Seconds before the scan is stopped.")
    args = parser.parse_args(argv)

    result = run_scan(args.path, timeout_s=args.timeout)
    print(json.dumps(result.to_dict(), indent=2) if args.format == "json" else _text(result))
    if result.status != "complete":
        return 2
    return 1 if result.findings else 0
