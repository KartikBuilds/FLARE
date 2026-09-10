from pathlib import Path

from app.core.compiler import compile_check
from app.core.graph import build_fund_flow_graph
from app.core.slither_service import run_slither
from app.detectors.registry import run_all_detectors

BENCHMARKS_DIR = Path("/srv/contracts/benchmarks")


def _analyze(sol_path: Path):
    compile_check([sol_path])
    ir = run_slither([sol_path], "0.8.24")
    findings = run_all_detectors(ir, [sol_path])
    return ir, findings


class TestBuildFundFlowGraph:
    def test_produces_nodes_for_every_function(self, fixtures_dir):
        ir, findings = _analyze(fixtures_dir / "Simple.sol")
        graph = build_fund_flow_graph(ir, findings)

        function_names = {n.function for n in graph.nodes}
        assert {"constructor", "deposit", "withdraw", "destroyContract"}.issubset(function_names)

    def test_classifies_payable_function_as_entry(self, fixtures_dir):
        ir, findings = _analyze(fixtures_dir / "Simple.sol")
        graph = build_fund_flow_graph(ir, findings)

        deposit = next(n for n in graph.nodes if n.function == "deposit")
        assert deposit.role == "entry"

    def test_classifies_withdraw_shaped_function_as_exit(self, fixtures_dir):
        ir, findings = _analyze(fixtures_dir / "Simple.sol")
        graph = build_fund_flow_graph(ir, findings)

        withdraw = next(n for n in graph.nodes if n.function == "withdraw")
        assert withdraw.role == "exit"

    def test_marks_blocked_node_from_a_wd_finding(self):
        sol_path = BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol"
        if not sol_path.exists():
            import pytest

            pytest.skip("contracts/benchmarks not mounted")
        ir, findings = _analyze(sol_path)
        assert any(f.detector_id == "FLARE-WD-001" for f in findings)

        graph = build_fund_flow_graph(ir, findings)
        withdraw = next(n for n in graph.nodes if n.function == "withdraw")
        assert withdraw.role == "blocked"
        assert withdraw.finding_ids
