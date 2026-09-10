# Security Policy

## Scope

FLARE's analyzer service (`services/analyzer`) is designed to accept **untrusted** input:
arbitrary uploaded Solidity files, ZIP archives, and public GitHub repository URLs. Security
issues in how that untrusted input is handled are the highest-priority class of report.

In scope:
- Path traversal / zip-slip in `services/analyzer/app/core/intake.py`
- Resource-exhaustion (zip bombs, unbounded file counts/sizes) bypassing the limits in
  `services/analyzer/app/config.py`
- Any way uploaded/cloned project content could execute code on the host, escape its isolated
  workspace, or reach a network the analyzer shouldn't reach
- Secrets or credentials leaking into logs, error messages, or committed files
- Any way the frontend or API could be tricked into treating demo data as live, or vice versa

Out of scope:
- Findings from FLARE's own detector registry about a contract you submitted to it — that's the
  product working as intended, not a vulnerability in FLARE itself
- Issues in third-party dependencies that don't have a FLARE-specific exploitation path (please
  report those upstream)

## Reporting

Please **do not** open a public GitHub issue for a suspected vulnerability. Instead, use
[GitHub's private vulnerability reporting](https://github.com/KartikBuilds/FLARE/security/advisories/new)
on this repository. Include:

- The affected file(s)/endpoint(s)
- Steps to reproduce (a minimal malicious ZIP/URL/Solidity file, where relevant)
- What you expected to happen vs. what actually happened

## What FLARE does to reduce risk by design

- **No execution of untrusted project code.** GitHub repositories are shallow-cloned only;
  nothing in a cloned repo (scripts, install hooks) is ever executed.
- **Safe extraction.** ZIP entries are checked for path traversal and symlinks before
  extraction (`intake.py::extract_zip`); decompressed-size and file-count limits guard against
  zip bombs.
- **Isolated, ephemeral workspaces.** Each analysis gets its own directory under
  `FLARE_WORKSPACE_DIR`, removed once the analysis completes or fails
  (`app/core/workspace.py`).
- **No public deployment of uploaded contracts.** All compilation and Foundry/Anvil validation
  is local-only — uploaded/cloned code is never deployed to a public network.
- **Containerized analysis toolchain.** Slither, solc-select and Foundry run inside a
  Python 3.12 Docker image (`services/analyzer/Dockerfile`), not against the host.
- **Per-stage timeouts and concurrency limits** bound how long a single malicious or pathological
  input can occupy the service (`app/config.py`, `app/core/slither_service.py`).
- **No secrets in logs.** Error messages returned to callers are deliberately generic
  (`IntakeError` messages never include raw host filesystem paths).

## Supported versions

This is a research prototype under active development on a single `main` branch — there is no
maintained release/patch branch structure yet. Fixes land on `main`.
