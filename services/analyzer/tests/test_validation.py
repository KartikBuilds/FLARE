from pathlib import Path

import pytest

from app.core.compiler import compile_check
from app.core.slither_service import run_slither
from app.core.validation import validate_findings
from app.detectors.registry import run_all_detectors

BENCHMARKS_DIR = Path("/srv/contracts/benchmarks")
pytestmark = pytest.mark.skipif(not BENCHMARKS_DIR.exists(), reason="contracts/benchmarks not mounted")


class TestValidateFindings:
    def test_confirms_an_unsatisfiable_condition_finding_by_executing_it(self):
        sol_path = BENCHMARKS_DIR / "flare-wd-001" / "vulnerable.sol"
        compile_result = compile_check([sol_path])
        ir = run_slither([sol_path], "0.8.24")
        findings = run_all_detectors(ir, [sol_path])
        assert any(f.detector_id == "FLARE-WD-001" for f in findings)

        validated = validate_findings(findings, compile_result, primary_contract="VulnerableVault")
        wd001 = next(f for f in validated if f.detector_id == "FLARE-WD-001")
        assert wd001.validated is True

    def test_leaves_non_validatable_detector_types_unvalidated(self):
        sol_path = BENCHMARKS_DIR / "flare-lib-001" / "vulnerable.sol"
        compile_result = compile_check([sol_path])
        ir = run_slither([sol_path], "0.8.24")
        findings = run_all_detectors(ir, [sol_path])
        assert any(f.detector_id == "FLARE-LIB-001" for f in findings)

        validated = validate_findings(findings, compile_result, primary_contract="VulnerableProxy")
        lib001 = next(f for f in validated if f.detector_id == "FLARE-LIB-001")
        assert lib001.validated is False
