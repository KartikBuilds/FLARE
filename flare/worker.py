"""Child process that runs Slither: `python -m flare.worker <file> <solc_path>`.

Runs in its own process so the engine can kill it on timeout. Prints exactly
one JSON object on the last line of stdout and never prints source code.
"""

import importlib.metadata
import json
import re
import sys

from flare.mapping import DETECTOR_MAP

# Compiler messages are never shown to the user: they can quote source in many
# ways (literals, identifiers, old-solc excerpts). The worker recognizes known
# message types and reports FLARE's own fixed wording plus the line number.
_HEADER = re.compile(r"(?:^|\s)\w*Error: ")
_OLD_LOCATION = re.compile(r":(\d+):\d+:\s*$")          # solc < 0.6: "file:LINE:COL: Error: ..."
_NEW_LOCATION = re.compile(r"-->\s*[^\n]*?:(\d+):\d+")  # solc >= 0.6: " --> file:LINE:COL:"
_TEMPLATES = [
    (re.compile(r"^Expected "), "Syntax error"),
    (re.compile(r"^(Function|Contract|Expected)? ?(declaration|definition|pragma)", re.I), "Syntax error"),
    (re.compile(r"not implicitly convertible|Invalid type|Type .* is not"), "Type mismatch"),
    (re.compile(r"^Undeclared identifier"), "Undeclared identifier"),
    (re.compile(r"^Member .* not found|not found or not visible"), "Unknown member or name"),
    (re.compile(r"already declared"), "Duplicate declaration"),
    (re.compile(r"requires different compiler version"), "Compiler version mismatch"),
    (re.compile(r"Wrong argument count|Invalid number of arguments"), "Wrong number of arguments"),
]


def compile_reason(text: str) -> str:
    """FLARE-owned description of the first compiler error, with its line.

    No compiler text is passed through: the message only selects one of the
    fixed labels above (or a generic one), so nothing from the source can
    reach the output.
    """
    header = _HEADER.search(text)
    if not header:
        return "The compiler reported an error."
    message = text[header.end():header.end() + 300].split("\n", 1)[0]
    label = next((name for pattern, name in _TEMPLATES if pattern.search(message)), "Compiler error")
    location = _OLD_LOCATION.search(text[max(0, header.start() - 300):header.start() + 1])
    if location is None:
        location = _NEW_LOCATION.search(text, header.end())
    return f"{label} (line {location.group(1)})" if location else label


def _emit(obj: dict) -> None:
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()


def main(argv: list[str]) -> int:
    path, solc_path = argv[0], argv[1]
    from slither import Slither
    from slither.detectors import all_detectors
    from slither.detectors.abstract_detector import AbstractDetector

    try:
        slither = Slither(path, solc=solc_path, compile_force_framework="solc")
    except Exception as exc:  # compile failure; report the solc error type only
        _emit({"ok": False, "code": "COMPILE_FAILED",
               "message": f"The source did not compile. {compile_reason(str(exc))}"})
        return 0

    for name in dir(all_detectors):
        cls = getattr(all_detectors, name)
        if isinstance(cls, type) and issubclass(cls, AbstractDetector) and cls.ARGUMENT in DETECTOR_MAP:
            slither.register_detector(cls)
    registered = {d.ARGUMENT for d in slither.detectors}
    missing = sorted(set(DETECTOR_MAP) - registered)
    if missing:  # never let a missing detector turn into a clean report
        _emit({"ok": False, "code": "ANALYZER_FAILED",
               "message": "Mapped detector(s) not available in this Slither version: " + ", ".join(missing)})
        return 0
    results = [r for batch in slither.run_detectors() for r in batch]
    _emit({
        "ok": True,
        "slither_version": importlib.metadata.version("slither-analyzer"),
        "detectors": results,
    })
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
