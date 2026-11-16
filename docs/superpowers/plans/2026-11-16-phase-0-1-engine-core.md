# Phase 0–1: Foundation and Engine Core — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `flare scan contract.sol --format json` runs a real Slither analysis in a killable subprocess and returns a complete, incomplete, or failed result with fund-lock findings from mapped built-in detectors.

**Architecture:** A Python package `flare` at the repo root. Input checks and compiler selection run in-process; Slither runs in a child process (`python -m flare.worker`) so a timeout can kill it. Only detectors listed in the mapping become FLARE findings; Phase 1 maps one built-in (`locked-ether` → Missing Recovery). Custom detectors arrive in Phase 2.

**Tech Stack:** Python 3.11, slither-analyzer, solc-select, semantic_version, pytest. GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-16-flare-product-design.md`

## Global Constraints

- Python 3.11. Every dependency pinned with `==` in `pyproject.toml` (`[project.dependencies]` and `[project.optional-dependencies].dev`).
- License AGPL-3.0 (spec §4.7). `LICENSE` contains the full AGPL-3.0 text.
- Input: one `.sol` file, ≤ 500,000 bytes and ≤ 3,000 lines (spec §4.9). Imports → `UNRESOLVED_IMPORT`.
- Scan timeout default 30 s (spec §4.6). Timeout → status `incomplete`, never a risk level.
- No mock, sample, or hard-coded findings anywhere (spec §2 anti-goals).
- Every result carries the disclaimer: `FLARE is a triage aid, not an audit. An empty report does not mean the contract is safe.`
- The compile step always forces the plain `solc` framework (spec §4.9).
- Tests that need real Slither + solc are marked `@pytest.mark.slither`; CI installs solc so they run there too.

## Review Focus

1. A file with `import` statements → `failed` with `UNRESOLVED_IMPORT`, not a Slither traceback. (Task 2)
2. A pragma no installable compiler satisfies (e.g. `^0.3.0`) or no pragma at all → `failed` with `UNSUPPORTED_COMPILER` / `NO_PRAGMA`. (Tasks 2–3)
3. Source that does not compile → `failed` with `COMPILE_FAILED` and a one-line reason, no traceback. (Task 4)
4. Analysis exceeding the timeout → process killed, status `incomplete`, code `TIMEOUT`. (Task 4)
5. Non-UTF-8 bytes, a UTF-8 BOM, or CRLF line endings → `INVALID_SOURCE` for bad bytes; BOM and CRLF accepted and counted correctly. (Task 2)

---

## File Structure

```
pyproject.toml            package metadata, pinned deps, entry point flare = flare.cli:main
LICENSE                   AGPL-3.0 text
CLAUDE.md                 working rules for Claude Code sessions
.github/workflows/ci.yml  install, solc-select install, pytest
flare/__init__.py         __version__ = "0.1.0"
flare/errors.py           FlareError
flare/models.py           Finding, AnalyzerRun, ScanResult (+ to_dict)
flare/source.py           load_source -> SourceFile (limits, imports, pragma)
flare/compiler.py         resolve_solc_version, ensure_solc
flare/mapping.py          DETECTOR_MAP: built-in detector -> (category, severity)
flare/worker.py           child process: run Slither, print JSON detector results
flare/engine.py           run_scan(path, timeout_s) -> ScanResult
flare/cli.py              argparse CLI, exit codes
tests/fixtures/*.sol      small contracts written for testing
tests/test_*.py
```

---

### Task 1: Project foundation

**Files:** Create `pyproject.toml`, `LICENSE`, `CLAUDE.md`, `.github/workflows/ci.yml`, `flare/__init__.py`, `flare/errors.py`, `flare/models.py`. Test: `tests/test_models.py`.

**Interfaces — Produces:**
- `class FlareError(Exception)`: `__init__(self, code: str, message: str)`; attributes `code`, `message`.
- `@dataclass(frozen=True) class Finding`: `detector: str, analyzer: str, category: str, severity: str, confidence: str, line_start: int | None, line_end: int | None, description: str`.
- `@dataclass(frozen=True) class AnalyzerRun`: `name: str, version: str, status: str` (`completed|failed|timed_out`).
- `@dataclass class ScanResult`: `status: str` (`complete|incomplete|failed`), `source_name: str, source_sha256: str | None, size_bytes: int | None, line_count: int | None, compiler: str | None, analyzers: list[AnalyzerRun], findings: list[Finding], error: dict | None` (`{"code","message"}`), `not_checked: list[str]`; method `to_dict() -> dict` that adds `flare_version`, `disclaimer`, and `overall_level` (highest severity among findings, `"None found"` if complete with none, `None` unless status is `complete`).
- `SEVERITY_ORDER = ("Critical", "High", "Medium", "Low")`, `DISCLAIMER` (exact text from Global Constraints).

- [ ] **Step 1: Write failing tests** `test_overall_level_highest_severity` (High + Low → "High"), `test_overall_level_none_found` (complete, no findings → "None found"), `test_incomplete_has_no_level` (incomplete with a High finding → `overall_level is None`), `test_to_dict_has_disclaimer_and_version`.
- [ ] **Step 2:** `pytest tests/test_models.py -v` → FAIL (ImportError).
- [ ] **Step 3:** Implement the files above. Pin current stable versions of slither-analyzer, solc-select, semantic_version, pytest. `LICENSE`: copy the AGPL-3.0 text shipped in slither-analyzer's dist-info. CI: ubuntu-latest, Python 3.11, `pip install -e .[dev]`, `solc-select install 0.4.26 0.5.17 0.6.12 0.7.6 0.8.24`, `pytest -v`.
- [ ] **Step 4:** `pytest tests/test_models.py -v` → 4 passed.
- [ ] **Step 5:** Stop for review (owner commits).

### Task 2: Source loading and limits

**Files:** Create `flare/source.py`, `tests/test_source.py`, fixtures as needed.

**Interfaces:**
- Consumes: `FlareError`.
- Produces: `MAX_BYTES = 500_000`, `MAX_LINES = 3_000`; `@dataclass(frozen=True) class SourceFile: name: str, text: str, sha256: str, size_bytes: int, line_count: int, pragma: str`; `load_source(path: Path) -> SourceFile`.

Checks in order, each raising `FlareError`: missing file `FILE_NOT_FOUND`; not `.sol` `UNSUPPORTED_FILE_TYPE`; bytes > MAX_BYTES `FILE_TOO_LARGE` (check size before reading the file); not UTF-8 `INVALID_SOURCE`; empty/whitespace `EMPTY_SOURCE`; NUL `INVALID_SOURCE`; lines > MAX_LINES `TOO_MANY_LINES`; an `import` directive outside comments and strings `UNRESOLVED_IMPORT` (message tells the user to flatten, e.g. `forge flatten`); no `pragma solidity` `NO_PRAGMA`. A leading BOM is stripped. Lines count CRLF/CR as one break; one trailing newline adds no line. `pragma` holds the version spec text (e.g. `^0.8.0`); with several pragmas, join them with a space.

- [ ] **Step 1: Write failing tests:** one per error code above (asserting `e.code`), plus `test_bom_and_crlf_accepted` (3-line CRLF file with BOM → `line_count == 3`), `test_import_in_comment_ignored`, `test_pragma_extracted` (`^0.8.0`), `test_limits_boundary` (exactly 3,000 lines passes; 3,001 fails).
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** implement `load_source`. Strip comments and string literals before looking for `import` and `pragma`.
- [ ] **Step 4:** run → all pass.
- [ ] **Step 5:** stop for review.

### Task 3: Compiler selection

**Files:** Create `flare/compiler.py`, `tests/test_compiler.py`.

**Interfaces:**
- Produces: `resolve_solc_version(pragma: str, available: list[str]) -> str` (highest available version satisfying every space-separated spec; raises `FlareError("UNSUPPORTED_COMPILER", ...)` if none); `installable_versions() -> list[str]` (from solc-select); `ensure_solc(version: str) -> None` (installs via solc-select if missing).

Use `semantic_version.NpmSpec` for matching. Solidity's bare `0.8.24` means exactly that version.

- [ ] **Step 1: Write failing tests** with a fixed `available` list: `^0.8.0` → highest 0.8.x; `0.8.24` → `0.8.24`; `>=0.6.0 <0.8.0` → highest 0.7.x; `^0.3.0` → `UNSUPPORTED_COMPILER`.
- [ ] **Step 2:** run → FAIL. **Step 3:** implement. **Step 4:** run → pass. **Step 5:** stop for review.

### Task 4: Worker, mapping and engine

**Files:** Create `flare/mapping.py`, `flare/worker.py`, `flare/engine.py`, `tests/test_engine.py`, fixtures `tests/fixtures/locked_ether.sol` (payable, no way to send ETH out), `tests/fixtures/safe_vault.sol`, `tests/fixtures/does_not_compile.sol`.

**Interfaces:**
- Consumes: `load_source`, `resolve_solc_version`, `installable_versions`, `ensure_solc`, models.
- Produces:
  - `DETECTOR_MAP: dict[str, tuple[str, str]] = {"locked-ether": ("Missing Recovery", "High")}`.
  - `python -m flare.worker <file> <solc_version>` prints one JSON object to stdout: `{"ok": true, "slither_version": str, "detectors": [<Slither detector result dicts>]}` or `{"ok": false, "code": "COMPILE_FAILED", "message": str}`. Forces the `solc` compile framework. Never prints source.
  - `run_scan(path: Path, timeout_s: float = 30.0) -> ScanResult`.

Engine flow: `load_source` → resolve and ensure compiler → start the worker with `subprocess.run([...], timeout=timeout_s, capture_output=True)` → on `TimeoutExpired`: status `incomplete`, error `TIMEOUT`, analyzer status `timed_out` → on `ok: false`: status `failed` → else map results: keep only detectors in `DETECTOR_MAP`, take the first source mapping's lines → status `complete`. A `FlareError` anywhere → status `failed` with its code. `not_checked` always lists: `"Custom FLARE fund-lock detectors (Phase 2)"`, `"Contracts reached through imports or external addresses"`, `"Runtime behavior (FLARE does not execute code)"`.

- [ ] **Step 1: Write failing tests** (`@pytest.mark.slither`): `test_locked_ether_found` (one finding, category Missing Recovery, line numbers set), `test_safe_vault_no_findings` (complete, empty), `test_compile_failure_reported` (failed, `COMPILE_FAILED`, no `Traceback` in message), `test_timeout_incomplete` (`timeout_s=0.01` → incomplete, `TIMEOUT`, `overall_level is None`), `test_import_fails_before_analysis` (failed, `UNRESOLVED_IMPORT`, no analyzer run).
- [ ] **Step 2:** run → FAIL. **Step 3:** implement. **Step 4:** run → pass. **Step 5:** stop for review.

### Task 5: CLI

**Files:** Create `flare/cli.py`, `tests/test_cli.py`.

**Interfaces:**
- Consumes: `run_scan`, `ScanResult.to_dict`.
- Produces: `main(argv: list[str] | None = None) -> int`. Command: `flare scan <path> [--format json|text] [--timeout SECONDS]`. Exit codes: `0` complete with no findings, `1` complete with findings, `2` incomplete or failed. `json` prints `to_dict()`; `text` prints a short human summary (level, each finding as `[severity] category — detector @ lines`, the not-checked list, the disclaimer).

- [ ] **Step 1: Write failing tests:** exit codes 1/0/2 on the three fixtures; `--format json` output parses and has `disclaimer`; `text` output contains the disclaimer.
- [ ] **Step 2:** run → FAIL. **Step 3:** implement. **Step 4:** run full suite → all pass.
- [ ] **Step 5: Phase verification:** fresh venv, `pip install -e .[dev]`, `pytest -v`, then `flare scan tests/fixtures/locked_ether.sol --format text`. Show output. Stop for review.
