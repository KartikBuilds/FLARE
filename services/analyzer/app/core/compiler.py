"""Compiler-version detection and compilation, via solc-select. Slither
(core/slither_service.py) runs afterwards using whichever solc version this
module selects — solc-select shims the `solc` binary on PATH, so there is
one source of truth for "which compiler" rather than two tools guessing
independently."""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

from app.config import settings

DEFAULT_VERSION = "0.8.24"

_PRAGMA_RE = re.compile(r"pragma\s+solidity\s+([^;]+);")
_VERSION_TOKEN_RE = re.compile(r"(\d+\.\d+\.\d+)")


class CompileError(RuntimeError):
    """Raised when compiler resolution or compilation itself fails. The
    message is safe to surface to a caller."""


@dataclass(frozen=True)
class CompileResult:
    solc_version: str
    files: list[Path]
    stdout: str
    stderr: str


def detect_solc_version(sources: list[str]) -> str:
    """Reads pragma statements across all sources and picks one concrete,
    installable solc version. Falls back to DEFAULT_VERSION when no pragma
    is found or the pragma expresses a range rather than an exact version —
    full semver-range resolution is out of scope; see docs/LIMITATIONS.md."""
    for source in sources:
        match = _PRAGMA_RE.search(source)
        if not match:
            continue
        versions = _VERSION_TOKEN_RE.findall(match.group(1))
        if versions:
            return versions[0]
    return DEFAULT_VERSION


def ensure_solc_installed(version: str, timeout_seconds: int = 60) -> None:
    installed = subprocess.run(
        ["solc-select", "versions"], capture_output=True, text=True, timeout=timeout_seconds
    ).stdout
    if version not in installed:
        try:
            subprocess.run(
                ["solc-select", "install", version],
                check=True,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
        except subprocess.CalledProcessError as exc:
            raise CompileError(
                f"Could not install solc {version} (it may not exist, or network access is unavailable)."
            ) from exc
        except subprocess.TimeoutExpired as exc:
            raise CompileError(f"Installing solc {version} timed out.") from exc

    subprocess.run(["solc-select", "use", version], check=True, capture_output=True, timeout=timeout_seconds)


def compile_check(files: list[Path], version: str | None = None) -> CompileResult:
    """Confirms the given .sol files compile with solc, surfacing a clear
    CompileError (distinct from a Slither failure) if they don't."""
    if not files:
        raise CompileError("No .sol files to compile.")

    sources = [f.read_text(encoding="utf-8", errors="replace") for f in files]
    resolved_version = version or detect_solc_version(sources)
    ensure_solc_installed(resolved_version, settings.compile_timeout_seconds)

    try:
        proc = subprocess.run(
            ["solc", "--combined-json", "abi,bin", *[str(f) for f in files]],
            capture_output=True,
            text=True,
            timeout=settings.compile_timeout_seconds,
        )
    except subprocess.TimeoutExpired as exc:
        raise CompileError("Compilation timed out.") from exc

    if proc.returncode != 0:
        raise CompileError(f"Compilation failed with solc {resolved_version}:\n{proc.stderr.strip()}")

    return CompileResult(solc_version=resolved_version, files=files, stdout=proc.stdout, stderr=proc.stderr)
