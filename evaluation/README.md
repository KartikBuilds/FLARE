# Evaluation

Generated benchmark results land here as `benchmark-result.json`, produced by
`services/analyzer/app/core/benchmark.py` scoring the detector registry against
`contracts/benchmarks/*/ground-truth.json`. See
[`docs/BENCHMARK_METHODOLOGY.md`](../docs/BENCHMARK_METHODOLOGY.md).

This file is generated, not hand-edited — regenerate it with:

```bash
docker compose run --rm analyzer python3 -m app.core.benchmark /srv/contracts/benchmarks /srv/evaluation/benchmark-result.json
```
