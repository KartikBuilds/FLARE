from flare import __version__
from flare.models import DISCLAIMER, AnalyzerRun, Finding, ScanResult


def _finding(severity):
    return Finding(detector="d", analyzer="slither", category="Missing Recovery", severity=severity,
                   confidence="High", line_start=1, line_end=2, description="x")


def _result(status, findings):
    return ScanResult(status=status, source_name="a.sol", source_sha256=None, size_bytes=None,
                      line_count=None, compiler=None, analyzers=[AnalyzerRun("slither", "0", "completed")],
                      findings=findings, error=None, not_checked=[])


def test_overall_level_highest_severity():
    assert _result("complete", [_finding("Low"), _finding("High")]).to_dict()["overall_level"] == "High"


def test_overall_level_none_found():
    assert _result("complete", []).to_dict()["overall_level"] == "None found"


def test_incomplete_has_no_level():
    assert _result("incomplete", [_finding("High")]).to_dict()["overall_level"] is None


def test_to_dict_has_disclaimer_and_version():
    d = _result("complete", []).to_dict()
    assert d["disclaimer"] == DISCLAIMER and d["flare_version"] == __version__
    assert d["analyzers"] == [{"name": "slither", "version": "0", "status": "completed"}]
