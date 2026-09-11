from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.db.database import init_db


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


app = FastAPI(
    title="FLARE Analyzer",
    description="Fund-Lock Assessment and Risk Evaluation — analysis engine.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Local dev origins only — this service is never exposed publicly.
    # 3000/3001: `pnpm dev`. 3100: the Playwright E2E webServer
    # (playwright.config.ts) — see tests/e2e/live-analysis.spec.ts.
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3100"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
