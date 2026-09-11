import time

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _poll_until_done(analysis_id: str, timeout_seconds: float = 15.0) -> dict:
    """The upload endpoints queue work onto a BackgroundTask and return
    immediately with status "queued" — this polls GET /analyses/{id} the
    same way a real client would, rather than assuming synchronous
    completion."""
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        res = client.get(f"/analyses/{analysis_id}")
        body = res.json()
        if body["status"] in ("complete", "failed"):
            return body
        time.sleep(0.1)
    raise AssertionError(f"Analysis {analysis_id} did not finish within {timeout_seconds}s")


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_list_analyses_starts_empty_or_returns_json_list():
    res = client.get("/analyses")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_unknown_analysis_returns_404():
    res = client.get("/analyses/does-not-exist")
    assert res.status_code == 404


def test_upload_files_end_to_end(fixtures_dir):
    with open(fixtures_dir / "Simple.sol", "rb") as f:
        res = client.post(
            "/analyses/upload-files",
            files=[("files", ("Simple.sol", f, "text/plain"))],
        )
    assert res.status_code == 200
    queued = res.json()
    assert queued["status"] == "queued"

    body = _poll_until_done(queued["id"])
    assert body["status"] == "complete"
    assert body["ir"] is not None
    assert any(c["name"] == "Simple" for c in body["ir"]["contracts"])


def test_upload_files_rejects_non_sol_extension():
    res = client.post(
        "/analyses/upload-files",
        files=[("files", ("script.sh", b"echo hi", "text/plain"))],
    )
    assert res.status_code == 400


def test_upload_zip_rejects_zip_slip(tmp_path):
    import zipfile

    zip_path = tmp_path / "evil.zip"
    with zipfile.ZipFile(zip_path, "w") as z:
        z.writestr("../../../etc/evil.sol", "contract Evil {}")

    with open(zip_path, "rb") as f:
        res = client.post(
            "/analyses/upload-zip",
            files=[("file", ("evil.zip", f, "application/zip"))],
        )
    assert res.status_code == 400


def test_analyze_github_rejects_non_github_url():
    res = client.post("/analyses/github", json={"url": "https://gitlab.com/foo/bar"})
    assert res.status_code == 400


def test_verified_address_returns_501_when_not_configured(monkeypatch):
    import app.api.routes as routes_module

    monkeypatch.setattr(routes_module.settings, "etherscan_api_key", None)
    res = client.post("/analyses/verified-address", json={"address": "0x" + "11" * 20})
    assert res.status_code == 501
    assert "not configured" in res.json()["detail"]


def test_analyze_benchmark_case_end_to_end(tmp_path, monkeypatch):
    import app.api.routes as routes_module

    detector_dir = tmp_path / "flare-lib-001"
    detector_dir.mkdir()
    (detector_dir / "vulnerable.sol").write_text(
        "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\ncontract V {}\n"
    )
    monkeypatch.setattr(routes_module.settings, "benchmarks_dir", tmp_path)

    res = client.post("/analyses/benchmark", json={"case": "flare-lib-001/vulnerable.sol"})
    assert res.status_code == 200
    queued = res.json()
    assert queued["status"] == "queued"
    assert queued["projectName"] == "flare-lib-001/vulnerable.sol"

    body = _poll_until_done(queued["id"])
    assert body["status"] == "complete"
    assert any(c["name"] == "V" for c in body["ir"]["contracts"])


def test_analyze_benchmark_case_rejects_unknown_case():
    res = client.post("/analyses/benchmark", json={"case": "../../etc/passwd"})
    assert res.status_code == 400
