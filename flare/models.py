"""Result types for a FLARE scan."""

from dataclasses import asdict, dataclass

from flare import __version__

SEVERITY_ORDER = ("Critical", "High", "Medium", "Low")
DISCLAIMER = "FLARE is a triage aid, not an audit. An empty report does not mean the contract is safe."


@dataclass(frozen=True)
class Finding:
    detector: str
    analyzer: str
    category: str
    severity: str
    confidence: str
    line_start: int | None
    line_end: int | None
    description: str


@dataclass(frozen=True)
class AnalyzerRun:
    name: str
    version: str
    status: str  # completed | failed | timed_out


@dataclass
class ScanResult:
    status: str  # complete | incomplete | failed
    source_name: str
    source_sha256: str | None
    size_bytes: int | None
    line_count: int | None
    compiler: str | None
    analyzers: list[AnalyzerRun]
    findings: list[Finding]
    error: dict | None
    not_checked: list[str]

    def overall_level(self) -> str | None:
        """Highest severity found. Only a complete scan gets a level."""
        if self.status != "complete":
            return None
        for level in SEVERITY_ORDER:
            if any(f.severity == level for f in self.findings):
                return level
        return "None found"

    def to_dict(self) -> dict:
        data = asdict(self)
        data["flare_version"] = __version__
        data["overall_level"] = self.overall_level()
        data["disclaimer"] = DISCLAIMER
        return data
