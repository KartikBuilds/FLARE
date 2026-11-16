"""Load one Solidity file and reject anything outside the supported input (spec §4.9).

Error messages are fixed text: they never quote the submitted source.
"""

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path

from flare.errors import FlareError

MAX_BYTES = 500_000
MAX_LINES = 3_000

# Strings and comments, matched together so a quote inside a comment (or a
# comment marker inside a string) is handled correctly.
_STRIP = re.compile(
    r'"(?:\\.|[^"\\\n])*"'      # double-quoted string
    r"|'(?:\\.|[^'\\\n])*'"     # single-quoted string
    r"|//[^\n]*"                # line comment
    r"|/\*.*?\*/",              # block comment
    re.DOTALL,
)
_IMPORT = re.compile(r"\bimport\b")
_PRAGMA = re.compile(r"\bpragma\s+solidity\s+([^;]+);")


@dataclass(frozen=True)
class SourceFile:
    name: str
    text: str
    sha256: str
    size_bytes: int
    line_count: int
    pragma: str


def _code_only(text: str) -> str:
    """Blank out comments and string literals, keeping line structure."""
    return _STRIP.sub(lambda m: re.sub(r"[^\n]", " ", m.group(0)), text)


def count_lines(text: str) -> int:
    if not text:
        return 0
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    return normalized.count("\n") + (0 if normalized.endswith("\n") else 1)


def load_source(path: Path) -> SourceFile:
    path = Path(path)
    if not path.is_file():
        raise FlareError("FILE_NOT_FOUND", "The input file does not exist.")
    if path.suffix.lower() != ".sol":
        raise FlareError("UNSUPPORTED_FILE_TYPE", "Only Solidity (.sol) files are supported.")
    if path.stat().st_size > MAX_BYTES:
        raise FlareError("FILE_TOO_LARGE", f"The file exceeds {MAX_BYTES:,} bytes.")

    raw = path.read_bytes()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise FlareError("INVALID_SOURCE", "The file is not valid UTF-8 text.") from None
    text = text.removeprefix("﻿")

    if not text.strip():
        raise FlareError("EMPTY_SOURCE", "The file is empty.")
    if "\x00" in text:
        raise FlareError("INVALID_SOURCE", "The file contains a NUL character.")
    lines = count_lines(text)
    if lines > MAX_LINES:
        raise FlareError("TOO_MANY_LINES", f"The file exceeds {MAX_LINES:,} lines.")

    code = _code_only(text)
    if _IMPORT.search(code):
        raise FlareError(
            "UNRESOLVED_IMPORT",
            "The file imports other files. Flatten the project into one file first "
            "(for example with `forge flatten`).",
        )
    pragmas = [" ".join(m.group(1).split()) for m in _PRAGMA.finditer(code)]
    if not pragmas:
        raise FlareError("NO_PRAGMA", "The file has no `pragma solidity` version line.")

    return SourceFile(
        name=path.name,
        text=text,
        sha256=hashlib.sha256(raw).hexdigest(),
        size_bytes=len(raw),
        line_count=lines,
        pragma=" ".join(pragmas),
    )
