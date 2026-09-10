"""Content-hash caching for the compile+Slither stages — re-analyzing an
unchanged set of sources reuses the prior IR instead of recompiling and
re-running Slither."""

from __future__ import annotations

import hashlib
from datetime import UTC, datetime
from pathlib import Path

from app.db.database import db_session
from app.schemas.ir import ProjectIR


def compute_content_hash(files: list[Path]) -> str:
    hasher = hashlib.sha256()
    for file in sorted(files, key=lambda f: f.name):
        hasher.update(file.name.encode("utf-8"))
        hasher.update(file.read_bytes())
    return hasher.hexdigest()


def get_cached_ir(content_hash: str) -> ProjectIR | None:
    with db_session() as conn:
        row = conn.execute(
            "SELECT ir_json FROM analysis_cache WHERE content_hash = ?", (content_hash,)
        ).fetchone()
    if row is None:
        return None
    return ProjectIR.model_validate_json(row["ir_json"])


def store_cached_ir(content_hash: str, ir: ProjectIR) -> None:
    with db_session() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO analysis_cache (content_hash, ir_json, created_at) VALUES (?, ?, ?)",
            (content_hash, ir.model_dump_json(), datetime.now(UTC).isoformat()),
        )
