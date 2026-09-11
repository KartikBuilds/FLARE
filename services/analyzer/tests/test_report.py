from pathlib import Path

import pytest

from app.core.compiler import compile_check
from app.core.graph import build_fund_flow_graph
from app.core.report import render_html_report
from app.core.scoring import score_analysis
from app.core.slither_service import run_slither
from app.detectors.registry import run_all_detectors
from app.schemas.analysis import AnalysisStatus, AnalysisSummary, SeverityCounts

BENCHMARKS_DIR = Path("/srv/contracts/benchmarks")
pytestmark = pytest.mark.skipif(not BENCHMARKS_DIR.exists(), reason="contracts/benchmarks not mounted")


def _real_analysis(sol_path: Path, analysis_id: str, project_name: str) -> AnalysisSummary:
    compile_check([sol_path])
    ir = run_slither([sol_path], "0.8.24")
    findings = run_all_detectors(ir, [sol_path])
    graph = build_fund_flow_graph(ir, findings)
    score = score_analysis(ir, findings, graph, [sol_path])
    counts = SeverityCounts()
    for f in findings:
        if hasattr(counts, f.severity):
            setattr(counts, f.severity, getattr(counts, f.severity) + 1)
    return AnalysisSummary(
        id=analysis_id,
        project_name=project_name,
        status=AnalysisStatus.COMPLETE,
        created_at="2026-01-01T00:00:00+00:00",
        flare_score=score.score,
        risk_band=score.band,
        formula_version="2.0.0",
        coverage=score.coverage.multiplier,
        coverage_notes=score.coverage.notes,
        score_breakdown=score.breakdown,
        finding_count=len(findings),
        severity_counts=counts,
        ir=ir,
        findings=findings,
        graph=graph,
    )


class TestRenderHtmlReport:
    def test_produces_self_contained_html_with_no_external_requests(self):
        analysis = _real_analysis(
            BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol", "report-test-1", "VulnerableVault"
        )
        html_doc = render_html_report(analysis)

        assert html_doc.strip().startswith("<!doctype html>")
        assert "<script" not in html_doc  # no external or inline JS at all
        assert "<link" not in html_doc  # no external stylesheet/font links
        assert "@import" not in html_doc
        assert 'src="http' not in html_doc
        assert 'href="http' not in html_doc
        # The SVG namespace declaration is a fixed XML identifier, never an
        # actual network request — the only "http://" this report contains.
        assert html_doc.count("http://") <= 1
        assert "http://www.w3.org/2000/svg" in html_doc or "<svg" not in html_doc

    def test_contains_the_real_score_and_every_finding(self):
        analysis = _real_analysis(
            BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol", "report-test-2", "VulnerableVault"
        )
        html_doc = render_html_report(analysis)

        assert analysis.flare_score is not None
        assert f"{analysis.flare_score:.1f}" in html_doc
        for finding in analysis.findings:
            assert finding.id in html_doc
            assert finding.title in html_doc

    def test_report_for_one_analysis_never_leaks_another_analysiss_findings(self):
        a = _real_analysis(
            BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol", "report-test-a", "ProjectAlpha"
        )
        b = _real_analysis(
            BENCHMARKS_DIR / "flare-lib-001" / "vulnerable.sol", "report-test-b", "ProjectBravo"
        )

        html_a = render_html_report(a)

        b_only_ids = {f.id for f in b.findings} - {f.id for f in a.findings}
        for finding_id in b_only_ids:
            assert finding_id not in html_a
        assert a.project_name in html_a
        assert b.project_name not in html_a

    def test_handles_an_analysis_with_no_findings_and_no_graph(self):
        analysis = AnalysisSummary(
            id="report-test-empty",
            project_name="Empty",
            status=AnalysisStatus.COMPLETE,
            created_at="2026-01-01T00:00:00+00:00",
            flare_score=None,
            risk_band=None,
            coverage=None,
        )
        html_doc = render_html_report(analysis)
        assert "Empty" in html_doc
        assert "No findings" in html_doc
        assert "No fund-flow graph" in html_doc

    def test_escapes_untrusted_content(self):
        analysis = AnalysisSummary(
            id="report-test-xss",
            project_name="<script>alert(1)</script>",
            status=AnalysisStatus.COMPLETE,
            created_at="2026-01-01T00:00:00+00:00",
        )
        html_doc = render_html_report(analysis)
        assert "<script>alert(1)</script>" not in html_doc
        assert "&lt;script&gt;" in html_doc
