import pytest

from flare.errors import FlareError
from flare.source import MAX_BYTES, MAX_LINES, load_source

PRAGMA = "pragma solidity ^0.8.0;\n"


def write(tmp_path, content, name="C.sol"):
    p = tmp_path / name
    p.write_bytes(content if isinstance(content, bytes) else content.encode("utf-8"))
    return p


def code_of(path):
    with pytest.raises(FlareError) as e:
        load_source(path)
    return e.value.code


def test_limits_are_spec_values():
    assert MAX_BYTES == 500_000 and MAX_LINES == 3_000


def test_missing_file(tmp_path):
    assert code_of(tmp_path / "nope.sol") == "FILE_NOT_FOUND"


def test_wrong_extension(tmp_path):
    assert code_of(write(tmp_path, PRAGMA, "C.txt")) == "UNSUPPORTED_FILE_TYPE"


def test_too_large(tmp_path):
    assert code_of(write(tmp_path, PRAGMA + "/" * MAX_BYTES)) == "FILE_TOO_LARGE"


def test_not_utf8(tmp_path):
    assert code_of(write(tmp_path, PRAGMA.encode() + b"\xff\xfe\xfa")) == "INVALID_SOURCE"


def test_empty(tmp_path):
    assert code_of(write(tmp_path, "  \n\t")) == "EMPTY_SOURCE"


def test_nul(tmp_path):
    assert code_of(write(tmp_path, PRAGMA + "contract A {}\x00")) == "INVALID_SOURCE"


def test_limits_boundary(tmp_path):
    load_source(write(tmp_path, PRAGMA + "\n" * (MAX_LINES - 1)))
    assert code_of(write(tmp_path, PRAGMA + "\n" * MAX_LINES + "x")) == "TOO_MANY_LINES"


def test_import_rejected(tmp_path):
    assert code_of(write(tmp_path, PRAGMA + 'import "./B.sol";\ncontract A {}')) == "UNRESOLVED_IMPORT"


def test_import_in_comment_or_string_ignored(tmp_path):
    src = PRAGMA + '// import "./B.sol";\n/* import "x"; */\ncontract A { string s = "import y"; }'
    assert load_source(write(tmp_path, src)).pragma == "^0.8.0"


def test_no_pragma(tmp_path):
    assert code_of(write(tmp_path, "contract A {}")) == "NO_PRAGMA"


def test_bom_and_crlf_accepted(tmp_path):
    src = load_source(write(tmp_path, b"\xef\xbb\xbf" + b"pragma solidity ^0.8.0;\r\ncontract A {}\r\n// end"))
    assert src.line_count == 3 and not src.text.startswith("﻿")


def test_pragma_extracted(tmp_path):
    src = load_source(write(tmp_path, "// SPDX\npragma solidity >=0.6.0 <0.8.0;\ncontract A {}\n"))
    assert src.pragma == ">=0.6.0 <0.8.0" and src.line_count == 3 and len(src.sha256) == 64


def test_message_never_contains_source(tmp_path):
    with pytest.raises(FlareError) as e:
        load_source(write(tmp_path, PRAGMA + 'import "SECRET_MARKER.sol";'))
    assert "SECRET_MARKER" not in e.value.message
