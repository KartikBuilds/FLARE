"""Child process that runs Slither: `python -m flare.worker <file> <solc_path>`.

Runs in its own process so the engine can kill it on timeout. Prints exactly
one JSON object on the last line of stdout and never prints source code.
"""

import importlib.metadata
import json
import re
import sys

from flare.mapping import DETECTOR_MAP

_SOLC_ERROR = re.compile(r"\b(\w*Error): (.{1,200})$")
_SOLC_LOCATION = re.compile(r"-->\s*[^\n]*?:(\d+):\d+")


def compile_reason(text: str) -> str:
    """First solc error message and its line, never the quoted source excerpt.

    solc prints the offending source under the message in lines containing
    "|"; those lines are skipped so no submitted code reaches the output.
    """
    reason = None
    for line in text.splitlines():
        if "|" in line:
            continue
        match = _SOLC_ERROR.search(line.strip())
        if match:
            reason = f"{match.group(1)}: {match.group(2)}"
            break
    if reason is None:
        return "The compiler reported an error."
    location = _SOLC_LOCATION.search(text)
    return f"{reason} (line {location.group(1)})" if location else reason


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
