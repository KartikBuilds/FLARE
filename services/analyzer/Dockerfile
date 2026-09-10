FROM python:3.12-slim

# Slither/solc-select need git+curl; Foundry's installer needs curl+git too.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Foundry (forge/anvil/cast) — local-only execution, never a public network.
ENV FOUNDRY_DIR=/root/.foundry
ENV PATH="${FOUNDRY_DIR}/bin:${PATH}"
RUN curl -L https://foundry.paradigm.xyz | bash \
    && foundryup

WORKDIR /srv/analyzer

# Dependencies in their own layer so `docker build` only reinstalls them
# when pyproject.toml actually changes, not on every source edit.
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -e ".[dev]"

# Pre-install a default solc version at build time so the container works
# fully offline for the common case; solc-select can still fetch other
# versions on demand when the host has network access.
RUN solc-select install 0.8.24 && solc-select use 0.8.24

COPY . .

ENV FLARE_WORKSPACE_DIR=/srv/analyzer/workspaces
ENV FLARE_DB_PATH=/srv/analyzer/data/flare.db
RUN mkdir -p "$FLARE_WORKSPACE_DIR" /srv/analyzer/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
