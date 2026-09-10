from app.core.cache import compute_content_hash, get_cached_ir, store_cached_ir
from app.db.database import init_db
from app.schemas.ir import ProjectIR


def test_content_hash_is_stable_for_same_content(tmp_path):
    f = tmp_path / "A.sol"
    f.write_text("contract A {}")
    assert compute_content_hash([f]) == compute_content_hash([f])


def test_content_hash_changes_with_content(tmp_path):
    f = tmp_path / "A.sol"
    f.write_text("contract A {}")
    first = compute_content_hash([f])
    f.write_text("contract A { uint x; }")
    assert compute_content_hash([f]) != first


def test_store_and_retrieve_cached_ir():
    init_db()
    ir = ProjectIR(solc_version="0.8.24", contracts=[])
    store_cached_ir("test-hash-abc", ir)
    retrieved = get_cached_ir("test-hash-abc")
    assert retrieved is not None
    assert retrieved.solc_version == "0.8.24"


def test_missing_hash_returns_none():
    init_db()
    assert get_cached_ir("does-not-exist") is None
