import zipfile

import httpx
import pytest

from app.core.intake import (
    IntakeError,
    extract_zip,
    fetch_verified_source,
    parse_github_url,
    resolve_benchmark_case,
    validate_sol_files,
)


def test_validate_sol_files_accepts_valid_input():
    validate_sol_files(["Token.sol", "Vault.sol"], [100, 200])


def test_validate_sol_files_rejects_empty():
    with pytest.raises(IntakeError, match="At least one"):
        validate_sol_files([], [])


def test_validate_sol_files_rejects_wrong_extension():
    with pytest.raises(IntakeError, match="not a .sol file"):
        validate_sol_files(["script.sh"], [10])


def test_validate_sol_files_rejects_oversized_file():
    with pytest.raises(IntakeError, match="per-file limit"):
        validate_sol_files(["Big.sol"], [10 * 1024 * 1024])


def test_validate_sol_files_rejects_path_traversal_filename():
    with pytest.raises(IntakeError, match="unsafe filename"):
        validate_sol_files(["../../etc/passwd.sol"], [10])


def test_validate_sol_files_rejects_too_many_files():
    names = [f"f{i}.sol" for i in range(500)]
    sizes = [10] * 500
    with pytest.raises(IntakeError, match="No more than"):
        validate_sol_files(names, sizes)


class TestExtractZip:
    def test_extracts_valid_sol_files(self, tmp_path):
        zip_path = tmp_path / "project.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            z.writestr("Token.sol", "contract Token {}")
            z.writestr("README.md", "hello")

        dest = tmp_path / "out"
        dest.mkdir()
        result = extract_zip(zip_path, dest)

        assert len(result) == 1
        assert result[0].name == "Token.sol"
        assert result[0].read_text() == "contract Token {}"

    def test_rejects_zip_slip(self, tmp_path):
        zip_path = tmp_path / "evil.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            z.writestr("../../../etc/evil.sol", "contract Evil {}")

        dest = tmp_path / "out"
        dest.mkdir()
        with pytest.raises(IntakeError, match="unsafe path"):
            extract_zip(zip_path, dest)

    def test_rejects_absolute_path_entry(self, tmp_path):
        zip_path = tmp_path / "evil2.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            z.writestr("/etc/evil.sol", "contract Evil {}")

        dest = tmp_path / "out"
        dest.mkdir()
        with pytest.raises(IntakeError):
            extract_zip(zip_path, dest)

    def test_rejects_symlink_entries(self, tmp_path):
        zip_path = tmp_path / "symlink.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            info = zipfile.ZipInfo("link.sol")
            info.external_attr = 0o120777 << 16  # symlink mode bits
            z.writestr(info, "/etc/passwd")

        dest = tmp_path / "out"
        dest.mkdir()
        with pytest.raises(IntakeError, match="symlink"):
            extract_zip(zip_path, dest)

    def test_rejects_zip_with_no_sol_files(self, tmp_path):
        zip_path = tmp_path / "empty.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            z.writestr("README.md", "hello")

        dest = tmp_path / "out"
        dest.mkdir()
        with pytest.raises(IntakeError, match="does not contain"):
            extract_zip(zip_path, dest)

    def test_rejects_oversized_zip(self, tmp_path, monkeypatch):
        import app.config as config_module

        monkeypatch.setattr(config_module.settings, "max_zip_bytes", 10)
        zip_path = tmp_path / "big.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            z.writestr("Token.sol", "contract Token {}" * 100)

        dest = tmp_path / "out"
        dest.mkdir()
        with pytest.raises(IntakeError, match="exceeds"):
            extract_zip(zip_path, dest)


class TestParseGithubUrl:
    def test_valid_url(self):
        owner, repo = parse_github_url("https://github.com/foo/bar")
        assert owner == "foo"
        assert repo == "bar"

    def test_valid_url_with_trailing_slash_and_git_suffix(self):
        owner, repo = parse_github_url("https://github.com/foo/bar.git/")
        assert owner == "foo"
        assert repo == "bar"

    def test_rejects_non_github_url(self):
        with pytest.raises(IntakeError):
            parse_github_url("https://gitlab.com/foo/bar")

    def test_rejects_malformed_url(self):
        with pytest.raises(IntakeError):
            parse_github_url("not a url")


class TestFetchVerifiedSource:
    def test_rejects_invalid_address(self, tmp_path):
        with pytest.raises(IntakeError, match="valid 0x-prefixed"):
            fetch_verified_source("not-an-address", "fake-key", tmp_path)

    def test_parses_single_file_response(self, tmp_path, monkeypatch):
        def fake_get(url, params, timeout):
            return httpx.Response(
                200,
                request=httpx.Request("GET", "https://api.etherscan.io/api"),
                json={
                    "status": "1",
                    "result": [
                        {
                            "SourceCode": "contract Token { function f() public {} }",
                            "ContractName": "Token",
                        }
                    ],
                },
            )

        monkeypatch.setattr(httpx, "get", fake_get)
        files = fetch_verified_source("0x" + "11" * 20, "fake-key", tmp_path)
        assert len(files) == 1
        assert files[0].name == "Token.sol"
        assert "contract Token" in files[0].read_text()

    def test_parses_multi_file_response(self, tmp_path, monkeypatch):
        multi_source = (
            '{{"language":"Solidity","sources":{'
            '"contracts/A.sol":{"content":"contract A {}"},'
            '"contracts/B.sol":{"content":"contract B {}"}'
            "}}}"
        )

        def fake_get(url, params, timeout):
            return httpx.Response(
                200,
                request=httpx.Request("GET", "https://api.etherscan.io/api"),
                json={
                    "status": "1",
                    "result": [{"SourceCode": multi_source, "ContractName": "A"}],
                },
            )

        monkeypatch.setattr(httpx, "get", fake_get)
        files = fetch_verified_source("0x" + "22" * 20, "fake-key", tmp_path)
        names = sorted(f.name for f in files)
        assert names == ["A.sol", "B.sol"]

    def test_raises_when_no_verified_source(self, tmp_path, monkeypatch):
        def fake_get(url, params, timeout):
            return httpx.Response(
                200,
                request=httpx.Request("GET", "https://api.etherscan.io/api"),
                json={"status": "0", "result": "Contract source code not verified"},
            )

        monkeypatch.setattr(httpx, "get", fake_get)
        with pytest.raises(IntakeError, match="no verified source"):
            fetch_verified_source("0x" + "33" * 20, "fake-key", tmp_path)


class TestResolveBenchmarkCase:
    def test_resolves_a_real_fixture(self, tmp_path):
        detector_dir = tmp_path / "flare-lib-001"
        detector_dir.mkdir()
        (detector_dir / "vulnerable.sol").write_text("contract V {}")

        resolved = resolve_benchmark_case("flare-lib-001/vulnerable.sol", tmp_path)
        assert resolved == (detector_dir / "vulnerable.sol").resolve()

    def test_rejects_path_traversal(self, tmp_path):
        with pytest.raises(IntakeError):
            resolve_benchmark_case("../../etc/passwd", tmp_path)

    def test_rejects_unknown_filename(self, tmp_path):
        detector_dir = tmp_path / "flare-lib-001"
        detector_dir.mkdir()
        with pytest.raises(IntakeError):
            resolve_benchmark_case("flare-lib-001/evil.sol", tmp_path)

    def test_rejects_missing_case(self, tmp_path):
        with pytest.raises(IntakeError, match="Unknown benchmark case"):
            resolve_benchmark_case("flare-lib-001/vulnerable.sol", tmp_path)
