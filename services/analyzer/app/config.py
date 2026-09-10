"""Central configuration. Everything here has a safe local default so the
service runs (in a limited, disabled-AI, no-live-address mode) with no
environment variables set at all — see docs/FREE_RESOURCES.md."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


def _bool_env(name: str, default: bool) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class Settings:
    workspace_dir: Path = field(
        default_factory=lambda: Path(os.environ.get("FLARE_WORKSPACE_DIR", "/tmp/flare-workspaces"))
    )
    db_path: Path = field(default_factory=lambda: Path(os.environ.get("FLARE_DB_PATH", "/tmp/flare.db")))
    ai_provider: str = field(default_factory=lambda: os.environ.get("FLARE_AI_PROVIDER", "disabled"))
    etherscan_api_key: str | None = field(default_factory=lambda: os.environ.get("FLARE_ETHERSCAN_API_KEY"))

    # Intake safety limits — enforced before any project touches the
    # filesystem beyond the isolated workspace. See SECURITY.md.
    max_upload_files: int = 200
    max_file_bytes: int = 2 * 1024 * 1024  # 2MB per source file
    max_zip_bytes: int = 25 * 1024 * 1024  # 25MB compressed
    max_extracted_bytes: int = 100 * 1024 * 1024  # 100MB decompressed, guards zip bombs
    allowed_extensions: frozenset[str] = frozenset({".sol"})

    # Per-stage timeouts (seconds) so one hung compile/Slither run can't
    # block the service indefinitely.
    compile_timeout_seconds: int = 60
    slither_timeout_seconds: int = 120
    foundry_timeout_seconds: int = 60

    max_concurrent_analyses: int = 2


settings = Settings()
