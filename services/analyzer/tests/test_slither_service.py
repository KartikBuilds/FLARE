from app.core.slither_service import run_slither


class TestRunSlither:
    def test_extracts_contract_and_functions(self, fixtures_dir):
        ir = run_slither([fixtures_dir / "Simple.sol"], "0.8.24")

        assert ir.solc_version == "0.8.24"
        names = [c.name for c in ir.contracts]
        assert "Simple" in names

        simple = next(c for c in ir.contracts if c.name == "Simple")
        function_names = {f.name for f in simple.functions}
        assert {"deposit", "withdraw", "destroyContract"}.issubset(function_names)

    def test_detects_selfdestruct(self, fixtures_dir):
        ir = run_slither([fixtures_dir / "Simple.sol"], "0.8.24")
        simple = next(c for c in ir.contracts if c.name == "Simple")
        destroy = next(f for f in simple.functions if f.name == "destroyContract")
        assert destroy.contains_selfdestruct is True

    def test_detects_low_level_transfer(self, fixtures_dir):
        ir = run_slither([fixtures_dir / "Simple.sol"], "0.8.24")
        simple = next(c for c in ir.contracts if c.name == "Simple")
        withdraw = next(f for f in simple.functions if f.name == "withdraw")
        assert withdraw.uses_low_level_transfer is True

    def test_deposit_is_payable(self, fixtures_dir):
        ir = run_slither([fixtures_dir / "Simple.sol"], "0.8.24")
        simple = next(c for c in ir.contracts if c.name == "Simple")
        deposit = next(f for f in simple.functions if f.name == "deposit")
        assert deposit.state_mutability == "payable"

    def test_captures_source_location(self, fixtures_dir):
        ir = run_slither([fixtures_dir / "Simple.sol"], "0.8.24")
        simple = next(c for c in ir.contracts if c.name == "Simple")
        withdraw = next(f for f in simple.functions if f.name == "withdraw")
        assert withdraw.source is not None
        assert withdraw.source.file.endswith("Simple.sol")
        assert withdraw.source.line_start > 0
