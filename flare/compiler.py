"""Pick and install the Solidity compiler a source file asks for."""

from pathlib import Path

import semantic_version
from solc_select import solc_select

from flare.errors import FlareError


def resolve_solc_version(pragma: str, available: list[str]) -> str:
    """Highest available version satisfying every space-separated constraint.

    Solidity pragma ranges follow npm semver rules (a bare version is exact,
    ^0.8.0 means >=0.8.0 <0.9.0, space means AND), so NpmSpec matches them.
    """
    try:
        spec = semantic_version.NpmSpec(pragma)
    except ValueError:
        raise FlareError("UNSUPPORTED_COMPILER", "The pragma version range could not be read.") from None
    versions = []
    for v in available:
        try:
            versions.append(semantic_version.Version(v))
        except ValueError:
            continue
    best = spec.select(versions)
    if best is None:
        raise FlareError("UNSUPPORTED_COMPILER", "No installable Solidity compiler satisfies the pragma.")
    return str(best)


def installable_versions() -> list[str]:
    """Versions already installed plus those solc-select can download."""
    installed = set(solc_select.installed_versions())
    try:
        installed |= set(solc_select.get_available_versions())
    except Exception:  # offline: fall back to what is installed
        pass
    return sorted(installed)


def ensure_solc(version: str) -> Path:
    """Install the compiler if missing and return its binary path."""
    if version not in solc_select.installed_versions():
        if not solc_select.install_artifacts([version], silent=True):
            raise FlareError("UNSUPPORTED_COMPILER", f"Solidity compiler {version} could not be installed.")
    return solc_select.artifact_path(version)
