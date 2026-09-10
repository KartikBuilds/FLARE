"""Redirects the analyzer's workspace/db paths into a throwaway temp
directory *before* any `app.*` module is imported, so tests never touch
the real /srv/analyzer/data volume."""

import os
import tempfile
from pathlib import Path

_TEST_ROOT = Path(tempfile.mkdtemp(prefix="flare-test-"))
os.environ["FLARE_WORKSPACE_DIR"] = str(_TEST_ROOT / "workspaces")
os.environ["FLARE_DB_PATH"] = str(_TEST_ROOT / "flare-test.db")

import pytest  # noqa: E402

from app.db.database import init_db  # noqa: E402

# Belt-and-braces: don't rely on FastAPI's lifespan hook running under
# every TestClient usage pattern — every test gets a ready schema.
init_db()


@pytest.fixture()
def fixtures_dir() -> Path:
    return Path(__file__).parent / "fixtures"
