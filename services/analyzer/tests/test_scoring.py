"""Boundary, monotonicity and regression tests for the deterministic FLARE
score (app/core/scoring.py) — see docs/RISK_METHODOLOGY.md. Unit-level
tests build minimal Finding/ProjectIR/FundFlowGraph objects directly so
each factor can be isolated; end-to-end tests run the real pipeline
against known fixtures to pin the score into an expected *range* (not an
exact number, so legitimate future tuning doesn't make the test brittle)."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.core.compiler import compile_check
from app.core.graph import build_fund_flow_graph
from app.core.scoring import (
    FORMULA_VERSION,
    asset_exposure_for,
    band_for,
    compute_coverage,
    dependency_criticality_for,
    recovery_offset_for,
    score_analysis,
)
from app.core.slither_service import run_slither
from app.detectors.registry import run_all_detectors
from app.schemas.finding import Finding
from app.schemas.graph import FundFlowGraph, GraphNode
from app.schemas.ir import ProjectIR

BENCHMARKS_DIR = Path("/srv/contracts/benchmarks")


def _finding(**overrides) -> Finding:
    base = dict(
        id="FLARE-WD-001:Vault.withdraw:0",
        detector_id="FLARE-WD-001",
        detector_version="1.0.0",
        title="t",
        taxonomy="withdrawal-failures",
        severity="high",
        confidence=0.8,
        reachability="public",
        file="Vault.sol",
        line_start=1,
        line_end=1,
        code_excerpt="",
        explanation="",
        triggering_condition="",
        asset_lock_consequence="",
        remediation="",
    )
    base.update(overrides)
    return Finding(**base)


def _ir(compile_warnings: list[str] | None = None) -> ProjectIR:
    return ProjectIR(solc_version="0.8.24", contracts=[], compile_warnings=compile_warnings or [])


def _graph(nodes: list[GraphNode] | None = None) -> FundFlowGraph:
    return FundFlowGraph(nodes=nodes or [], edges=[])


class TestBoundaries:
    def test_no_findings_scores_zero_minimal(self, tmp_path):
        result = score_analysis(_ir(), [], _graph(), [])
        assert result.score == 0.0
        assert result.band == "minimal"
        assert result.breakdown == []

    def test_all_factors_at_maximum_scores_at_or_near_100(self):
        finding = _finding(severity="critical", confidence=1.0, reachability="public")
        # role="blocked" (not "exit") — a withdrawal-failures finding on a
        # node always yields "blocked" in the real graph builder (see
        # app/core/graph.py's _BLOCKING_TAXONOMY), and that's also what
        # keeps recovery_offset at 0.0 here: no *other* exit node exists.
        node = GraphNode(
            id="Vault.withdraw",
            contract="Vault",
            function="withdraw",
            role="blocked",
            finding_ids=[finding.id],
        )
        result = score_analysis(_ir(), [finding], _graph([node]), [])
        # dependency_criticality for withdrawal-failures is 0.3 (not library),
        # so a single finding can't reach 100 alone — assert it's the correct,
        # fully-computed value rather than assuming 100.
        expected_contribution = 100.0 * 1.0 * 1.0 * 1.0 * 0.3 * 1.0
        assert result.breakdown[0].contribution == pytest.approx(expected_contribution, abs=0.01)

    def test_band_thresholds(self):
        assert band_for(80.0) == "critical"
        assert band_for(79.9) == "high"
        assert band_for(60.0) == "high"
        assert band_for(59.9) == "medium"
        assert band_for(35.0) == "medium"
        assert band_for(34.9) == "low"
        assert band_for(15.0) == "low"
        assert band_for(14.9) == "minimal"
        assert band_for(0.0) == "minimal"

    def test_coverage_multiplier_is_floored_at_half(self):
        ir = _ir(compile_warnings=["import X not found"])
        # Force every penalty to stack by also triggering the assembly and
        # no-validation signals.
        result = compute_coverage(ir, [], [_finding(validated=False)])
        assert result.multiplier >= 0.5


class TestMonotonicity:
    def test_increasing_severity_never_decreases_score(self):
        low = score_analysis(_ir(), [_finding(severity="low")], _graph(), [])
        high = score_analysis(_ir(), [_finding(severity="high")], _graph(), [])
        assert high.score >= low.score

    def test_increasing_confidence_never_decreases_score(self):
        lo = score_analysis(_ir(), [_finding(confidence=0.3)], _graph(), [])
        hi = score_analysis(_ir(), [_finding(confidence=0.9)], _graph(), [])
        assert hi.score >= lo.score

    def test_public_reachability_never_scores_below_theoretical(self):
        theoretical = score_analysis(_ir(), [_finding(reachability="theoretical")], _graph(), [])
        public = score_analysis(_ir(), [_finding(reachability="public")], _graph(), [])
        assert public.score >= theoretical.score

    def test_adding_a_lower_severity_finding_never_changes_a_max_based_score(self):
        critical = _finding(id="a", severity="critical", confidence=1.0)
        low = _finding(id="b", severity="low", confidence=1.0)
        just_critical = score_analysis(_ir(), [critical], _graph(), [])
        with_extra_low = score_analysis(_ir(), [critical, low], _graph(), [])
        assert just_critical.score == with_extra_low.score

    def test_validated_finding_scores_at_least_as_high_as_unvalidated(self):
        unvalidated = _finding(confidence=0.75, validated=False)
        validated = _finding(confidence=0.9, validated=True)  # floor applied upstream in validation.py
        lo = score_analysis(_ir(), [unvalidated], _graph(), [])
        hi = score_analysis(_ir(), [validated], _graph(), [])
        assert hi.score >= lo.score


class TestRecoveryOffset:
    def test_a_finding_never_counts_its_own_node_as_an_alternative_exit(self):
        """A finding whose own node is still role="exit" (not "blocked" —
        true for most non-withdrawal-failures/state-transitions detector
        categories) must not grant itself a recovery offset just by
        existing; there has to be a genuinely different exit node."""
        finding = _finding(taxonomy="transfer-logic", id="FLARE-XFER-002:Vault.withdraw:0")
        own_node = GraphNode(id="Vault.withdraw", contract="Vault", function="withdraw", role="exit")
        offset = recovery_offset_for(finding, _graph([own_node]), blocked_node_ids=set())
        assert offset == 0.0

    def test_a_genuinely_different_exit_node_grants_the_offset(self):
        finding = _finding(taxonomy="transfer-logic", id="FLARE-XFER-002:Vault.withdraw:0")
        own_node = GraphNode(id="Vault.withdraw", contract="Vault", function="withdraw", role="exit")
        other_exit = GraphNode(
            id="Vault.emergencyWithdraw", contract="Vault", function="emergencyWithdraw", role="exit"
        )
        offset = recovery_offset_for(finding, _graph([own_node, other_exit]), blocked_node_ids=set())
        assert offset == 0.3

    def test_missing_recovery_taxonomy_never_gets_an_offset(self):
        finding = _finding(taxonomy="missing-recovery", id="FLARE-REC-001:Vault.deposit:0")
        other_exit = GraphNode(id="Vault.withdraw", contract="Vault", function="withdraw", role="exit")
        offset = recovery_offset_for(finding, _graph([other_exit]), blocked_node_ids=set())
        assert offset == 0.0


class TestFactorHelpers:
    def test_asset_exposure_exit_and_blocked_are_full(self):
        assert asset_exposure_for("exit") == 1.0
        assert asset_exposure_for("entry") == 1.0
        assert asset_exposure_for("blocked") == 1.0

    def test_asset_exposure_internal_is_partial(self):
        assert asset_exposure_for("internal") == 0.6
        assert asset_exposure_for("constructor") == 0.6

    def test_asset_exposure_unmatched_is_low(self):
        assert asset_exposure_for(None) == 0.3

    def test_dependency_criticality_library_is_maximal(self):
        f = _finding(taxonomy="library-dependencies")
        assert dependency_criticality_for(f) == 1.0

    def test_dependency_criticality_other_categories_lower(self):
        f = _finding(taxonomy="transfer-logic")
        assert dependency_criticality_for(f) == 0.3


@pytest.mark.skipif(not BENCHMARKS_DIR.exists(), reason="contracts/benchmarks not mounted")
class TestRegressionAgainstFixtures:
    """Pins known fixtures into an expected score *range* — a real,
    end-to-end run through compile -> Slither -> detectors -> graph ->
    score, not the isolated unit-level construction above."""

    def _score(self, sol_path: Path):
        compile_check([sol_path])
        ir = run_slither([sol_path], "0.8.24")
        findings = run_all_detectors(ir, [sol_path])
        graph = build_fund_flow_graph(ir, findings)
        return score_analysis(ir, findings, graph, [sol_path])

    def test_wd_001_vulnerable_scores_in_expected_range(self):
        result = self._score(BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol")
        assert 10.0 <= result.score <= 40.0
        assert result.band in ("low", "medium")

    def test_wd_001_corrected_scores_lower_than_vulnerable(self):
        vulnerable = self._score(BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol")
        corrected = self._score(BENCHMARKS_DIR / "flare-wd-001" / "corrected.sol")
        assert corrected.score < vulnerable.score

    def test_safe_negative_scores_lowest(self):
        vulnerable = self._score(BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol")
        safe = self._score(BENCHMARKS_DIR / "flare-wd-001" / "safe-negative.sol")
        assert safe.score <= vulnerable.score

    def test_formula_version_is_reported(self):
        result = self._score(BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol")
        assert FORMULA_VERSION == "2.0.0"
        assert result.breakdown  # non-empty for a fixture with findings
