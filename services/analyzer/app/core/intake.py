"""Safe intake for every source FLARE accepts: direct .sol uploads, a
project ZIP, or a public GitHub URL. Every path here treats its input as
untrusted — see SECURITY.md. Nothing in this module ever executes code
from the analyzed project; it only reads and copies files."""

from __future__ import annotations

import re
import subprocess
import zipfile
from pathlib import Path

from app.config import settings


class IntakeError(ValueError):
    """Raised for any untrusted input that fails a safety check. The message
    is always safe to show a caller — never includes raw filesystem paths
    from the host, only the offending filename/detail."""


def validate_sol_files(filenames: list[str], sizes: list[int]) -> None:
    if len(filenames) == 0:
        raise IntakeError("At least one .sol file is required.")
    if len(filenames) > settings.max_upload_files:
        raise IntakeError(f"No more than {settings.max_upload_files} files may be uploaded at once.")
    for name, size in zip(filenames, sizes, strict=True):
        if not name.endswith(".sol"):
            raise IntakeError(f"'{name}' is not a .sol file.")
        if "/" in name or "\\" in name or name.startswith("."):
            raise IntakeError(f"'{name}' has an unsafe filename.")
        if size > settings.max_file_bytes:
            raise IntakeError(f"'{name}' exceeds the {settings.max_file_bytes // 1024}KB per-file limit.")


def _safe_member_path(dest_root: Path, member_name: str) -> Path | None:
    """Resolves a zip member's target path and returns None if it would
    escape dest_root (zip-slip) or is an absolute/drive path."""
    if member_name.startswith("/") or member_name.startswith("\\"):
        return None
    if re.match(r"^[A-Za-z]:", member_name):  # Windows drive letter
        return None

    target = (dest_root / member_name).resolve()
    try:
        target.relative_to(dest_root.resolve())
    except ValueError:
        return None
    return target


def extract_zip(zip_path: Path, dest_root: Path) -> list[Path]:
    """Safely extracts a ZIP, returning the list of extracted .sol files.
    Rejects zip-slip paths, symlinks, and archives that exceed the
    decompressed-size or file-count budget (zip-bomb protection)."""
    if zip_path.stat().st_size > settings.max_zip_bytes:
        raise IntakeError(f"ZIP exceeds the {settings.max_zip_bytes // (1024 * 1024)}MB limit.")

    extracted_sol_files: list[Path] = []
    total_extracted = 0
    file_count = 0

    with zipfile.ZipFile(zip_path) as archive:
        for info in archive.infolist():
            if info.is_dir():
                continue

            file_count += 1
            if file_count > settings.max_upload_files:
                raise IntakeError(f"ZIP contains more than {settings.max_upload_files} files.")

            # Reject symlinks: unix mode bits for a symlink are 0o120000 in
            # the upper 16 bits of external_attr.
            is_symlink = (info.external_attr >> 16) & 0o170000 == 0o120000
            if is_symlink:
                raise IntakeError(f"'{info.filename}' is a symlink, which is not allowed.")

            total_extracted += info.file_size
            if total_extracted > settings.max_extracted_bytes:
                raise IntakeError("ZIP's decompressed contents exceed the extraction size limit.")

            target = _safe_member_path(dest_root, info.filename)
            if target is None:
                raise IntakeError(f"'{info.filename}' has an unsafe path and was rejected.")

            target.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(info) as src, open(target, "wb") as out:
                out.write(src.read())

            if target.suffix == ".sol":
                extracted_sol_files.append(target)

    if not extracted_sol_files:
        raise IntakeError("ZIP does not contain any .sol files.")
    return extracted_sol_files


GITHUB_URL_RE = re.compile(r"^https://github\.com/(?P<owner>[\w.-]+)/(?P<repo>[\w.-]+?)(?:\.git)?/?$")


def parse_github_url(url: str) -> tuple[str, str]:
    match = GITHUB_URL_RE.match(url.strip())
    if not match:
        raise IntakeError("Not a valid public GitHub repository URL.")
    return match.group("owner"), match.group("repo")


def clone_github_repo(url: str, dest: Path, timeout_seconds: int = 30) -> list[Path]:
    """Shallow-clones a public repo. Never runs anything from the cloned
    repo (no install scripts, no build steps) — only reads .sol files
    afterwards."""
    owner, repo = parse_github_url(url)
    clone_url = f"https://github.com/{owner}/{repo}.git"

    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", "--", clone_url, str(dest)],
            check=True,
            capture_output=True,
            timeout=timeout_seconds,
        )
    except subprocess.TimeoutExpired as exc:
        raise IntakeError("Cloning the repository timed out.") from exc
    except subprocess.CalledProcessError as exc:
        raise IntakeError(
            "Could not clone that repository — check it's public and the URL is correct."
        ) from exc

    sol_files = sorted(p for p in dest.rglob("*.sol") if ".git" not in p.parts)
    if not sol_files:
        raise IntakeError("Repository does not contain any .sol files.")
    if len(sol_files) > settings.max_upload_files:
        raise IntakeError(f"Repository contains more than {settings.max_upload_files} .sol files.")
    return sol_files
