"""Isolated per-analysis workspaces. Every analysis gets its own directory
under settings.workspace_dir, named by a random token — never the caller's
own path input — and is removed once the analysis finishes or fails, so a
crashed run can't leak disk space or state into the next one."""

from __future__ import annotations

import secrets
import shutil
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from app.config import settings


def new_workspace_id() -> str:
    return secrets.token_hex(16)


@contextmanager
def isolated_workspace(workspace_id: str | None = None) -> Iterator[Path]:
    """Creates workspaces/<id>/{intake,extracted} and cleans it up on exit,
    including when the analysis raises."""
    workspace_id = workspace_id or new_workspace_id()
    root = settings.workspace_dir / workspace_id
    root.mkdir(parents=True, exist_ok=True)
    (root / "intake").mkdir(exist_ok=True)
    (root / "extracted").mkdir(exist_ok=True)
    try:
        yield root
    finally:
        shutil.rmtree(root, ignore_errors=True)


def persistent_workspace(workspace_id: str | None = None) -> Path:
    """Like isolated_workspace, but the caller is responsible for cleanup —
    used when a workspace must outlive a single request (background jobs)."""
    workspace_id = workspace_id or new_workspace_id()
    root = settings.workspace_dir / workspace_id
    root.mkdir(parents=True, exist_ok=True)
    (root / "intake").mkdir(exist_ok=True)
    (root / "extracted").mkdir(exist_ok=True)
    return root


def cleanup_workspace(root: Path) -> None:
    shutil.rmtree(root, ignore_errors=True)
