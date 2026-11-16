import pytest

from flare.compiler import resolve_solc_version
from flare.errors import FlareError

AVAILABLE = ["0.4.26", "0.5.17", "0.6.12", "0.7.5", "0.7.6", "0.8.0", "0.8.19", "0.8.24"]


def test_caret_picks_highest_in_range():
    assert resolve_solc_version("^0.8.0", AVAILABLE) == "0.8.24"


def test_bare_version_is_exact():
    assert resolve_solc_version("0.8.19", AVAILABLE) == "0.8.19"


def test_range_with_two_bounds():
    assert resolve_solc_version(">=0.6.0 <0.8.0", AVAILABLE) == "0.7.6"


def test_multiple_pragmas_must_all_hold():
    assert resolve_solc_version("^0.7.0 <0.7.6", AVAILABLE) == "0.7.5"


def test_unsatisfiable():
    with pytest.raises(FlareError) as e:
        resolve_solc_version("^0.3.0", AVAILABLE)
    assert e.value.code == "UNSUPPORTED_COMPILER"


def test_garbage_pragma_is_unsupported_not_crash():
    with pytest.raises(FlareError) as e:
        resolve_solc_version("not-a-version", AVAILABLE)
    assert e.value.code == "UNSUPPORTED_COMPILER"
