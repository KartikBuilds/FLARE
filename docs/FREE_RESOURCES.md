# Free & Open-Source Resources

Every tool and asset this project depends on for core functionality is free and open-source.
Nothing here requires a paid plan, API key, or license to run the full analysis pipeline with
AI disabled (the default).

## Analysis toolchain (all inside `services/analyzer`'s Docker image)

| Tool | License | Purpose |
| --- | --- | --- |
| [Slither](https://github.com/crytic/slither) | AGPL-3.0 | Static analysis / IR extraction |
| [solc-select](https://github.com/crytic/solc-select) | AGPL-3.0 | Solidity compiler version management |
| [Foundry](https://github.com/foundry-rs/foundry) (forge/anvil) | MIT/Apache-2.0 | Local-only compilation & validation |
| [NetworkX](https://networkx.org/) | BSD-3-Clause | Fund-flow/dependency graph construction |
| [FastAPI](https://fastapi.tiangolo.com/) | MIT | Analyzer HTTP API |
| [web3.py](https://web3py.readthedocs.io/) | MIT | Talking to the local Anvil instance for validation |

## Frontend toolchain

| Tool | License | Purpose |
| --- | --- | --- |
| [Next.js](https://nextjs.org/) | MIT | App Router frontend |
| [Tailwind CSS](https://tailwindcss.com/) | MIT | Styling |
| [Motion](https://motion.dev/) | MIT | Component-level animation |
| [React Flow](https://reactflow.dev/) | MIT | Fund-flow graph visualization |
| [Recharts](https://recharts.org/) | MIT | Dashboard charts |
| [TanStack Query](https://tanstack.com/query) | MIT | Data fetching |
| [Zod](https://zod.dev/) | MIT | Runtime schema validation |
| [Lucide](https://lucide.dev/) | ISC | Interface icons |
| [MiniSearch](https://lucaong.github.io/minisearch/) | MIT | Client-side docs search |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | MPL-2.0 | MDX rendering for documentation |

## Fonts — vendored, not CDN-loaded

Every font is a real binary file committed at `apps/web/app/fonts/files/`, fetched once from
each family's SIL Open Font License source (the `google/fonts` GitHub repository) and loaded
via `next/font/local` — self-hosted from the app's own origin, no runtime or build-time request
to `fonts.googleapis.com` or any other font CDN. Licenses are vendored alongside the files at
`apps/web/app/fonts/licenses/`.

| Family | Role | Files |
| --- | --- | --- |
| Libre Baskerville (variable) | Display serif | `LibreBaskerville[wght].ttf` + italic |
| IBM Plex Sans (variable) | Interface sans | `IBMPlexSans[wdth,wght].ttf` |
| IBM Plex Sans Condensed | Condensed labels | Regular / Medium / SemiBold static instances |
| Caveat (variable) | Handwritten annotations | `Caveat[wght].ttf` |

## Illustrations

Every illustration in `packages/ui/src/illustrations/` is original inline SVG, hand-authored in
this repository — no stock art, no raster images, no external illustration service.

## Infrastructure

- **SQLite** — the analyzer's datastore; no external database service required.
- **Docker / Docker Compose** — free, standard container tooling.
- **GitHub Actions** — free CI minutes for public repositories.

## Optional, never required for core functionality

- A block-explorer API key (e.g. a free Etherscan-tier key) enables the "verified contract
  address" intake method only — every other intake method works without one.
- An AI provider (local model or a user-supplied API key) enables finding explanations only —
  the entire deterministic pipeline (intake through detection) works identically with AI
  disabled, which is the default.
