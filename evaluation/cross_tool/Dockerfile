# Mythril only — deliberately its own image, separate from both
# services/analyzer's (installing Mythril there downgrades web3's
# transitive deps below what app/core/validation.py's Foundry/Anvil
# integration needs) and from slither-analyzer (mythril 0.24.8 pins
# eth-hash<0.4, which conflicts with slither-analyzer's own web3-compatible
# chain — confirmed directly: installing both in one image is
# pip-dependency-unresolvable). Slither runs from the existing `analyzer`
# image instead — see evaluation/tool-mapping.md.
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir \
        solc-select==1.0.4 \
        mythril==0.24.8 \
        "setuptools<81"
# Mythril's eth/py-evm dependency chain imports pkg_resources at import
# time; setuptools>=81 stopped bundling it, which breaks `myth` entirely
# (verified directly — see evaluation/tool-mapping.md).

# `solc-select install` downloads from GitHub release assets, which hit a
# real, reproducible 403 from this environment (confirmed directly, several
# separate build attempts) despite the exact same command working fine in
# services/analyzer's image built earlier the same session — copying the
# already-installed artifact from that local image sidesteps it entirely
# rather than silently retrying/faking success.
COPY --from=flare-analyzer:latest /root/.solc-select /root/.solc-select
RUN solc-select use 0.8.24

WORKDIR /work
