import json
from pathlib import Path

import pytest

from flare.cli import main
from flare.models import DISCLAIMER

FIX = Path(__file__).parent / "fixtures"
pytestmark = pytest.mark.slither


def test_exit_1_when_findings(capsys):
    assert main(["scan", str(FIX / "locked_ether.sol")]) == 1


def test_exit_0_when_clean(capsys):
    assert main(["scan", str(FIX / "safe_vault.sol")]) == 0


def test_exit_2_when_failed(capsys):
    assert main(["scan", str(FIX / "does_not_compile.sol")]) == 2


def test_exit_2_when_incomplete(capsys):
    assert main(["scan", str(FIX / "safe_vault.sol"), "--timeout", "0.01"]) == 2


def test_json_output(capsys):
    main(["scan", str(FIX / "locked_ether.sol"), "--format", "json"])
    data = json.loads(capsys.readouterr().out)
    assert data["disclaimer"] == DISCLAIMER and data["overall_level"] == "High"
    assert data["findings"][0]["category"] == "Missing Recovery"


def test_text_output(capsys):
    main(["scan", str(FIX / "locked_ether.sol"), "--format", "text"])
    out = capsys.readouterr().out
    assert DISCLAIMER in out and "[High] Missing Recovery" in out and "Not checked" in out


def test_text_output_failed_shows_code(capsys):
    main(["scan", str(FIX / "does_not_compile.sol"), "--format", "text"])
    assert "COMPILE_FAILED" in capsys.readouterr().out


def test_missing_subcommand_is_usage_error(capsys):
    with pytest.raises(SystemExit) as e:
        main([])
    assert e.value.code == 2
