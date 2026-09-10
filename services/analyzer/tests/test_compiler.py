import pytest

from app.core.compiler import CompileError, compile_check, detect_solc_version


class TestDetectSolcVersion:
    def test_detects_exact_pragma(self):
        assert detect_solc_version(["pragma solidity 0.8.19;\ncontract C {}"]) == "0.8.19"

    def test_detects_caret_pragma(self):
        assert detect_solc_version(["pragma solidity ^0.8.24;"]) == "0.8.24"

    def test_falls_back_to_default_with_no_pragma(self):
        assert detect_solc_version(["contract C {}"]) == "0.8.24"

    def test_uses_first_file_with_a_pragma(self):
        sources = ["contract A {}", "pragma solidity 0.8.20;\ncontract B {}"]
        assert detect_solc_version(sources) == "0.8.20"


class TestCompileCheck:
    def test_compiles_valid_contract(self, fixtures_dir):
        result = compile_check([fixtures_dir / "Simple.sol"], version="0.8.24")
        assert result.solc_version == "0.8.24"
        assert "Simple" in result.stdout

    def test_raises_on_syntax_error(self, tmp_path):
        bad_file = tmp_path / "Bad.sol"
        bad_file.write_text("pragma solidity 0.8.24; contract Bad { this is not solidity")
        with pytest.raises(CompileError):
            compile_check([bad_file], version="0.8.24")

    def test_raises_with_no_files(self):
        with pytest.raises(CompileError, match="No .sol files"):
            compile_check([])
