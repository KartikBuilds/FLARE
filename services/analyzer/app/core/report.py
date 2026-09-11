"""Renders one self-contained, printable HTML report for a completed
analysis — no external requests (no CDN CSS/JS/fonts, no remote images),
so it works offline and as a Save-as-PDF target. Every figure in the
output comes from the AnalysisSummary passed in; nothing is fetched,
cached globally, or shared across analyses — see test_report.py's
isolation test.
"""

from __future__ import annotations

import html
from datetime import datetime

from app.schemas.analysis import AnalysisSummary
from app.schemas.finding import Finding
from app.schemas.graph import FundFlowGraph, GraphNode

_SEVERITY_ORDER = ["critical", "high", "medium", "low"]

_ROLE_COLOR = {
    "entry": "#3f7d55",
    "exit": "#131210",
    "blocked": "#8a2c1c",
    "constructor": "#9a9584",
    "internal": "#c7c2af",
}


def _e(value: object) -> str:
    """HTML-escapes any value for safe interpolation into the report —
    finding text, project names, etc. all ultimately come from analyzed
    source code or user-supplied input, so nothing here is trusted."""
    return html.escape(str(value), quote=True)


def _render_graph_svg(graph: FundFlowGraph) -> str:
    """A simple, dependency-free static layout: one row per node, ordered
    by role (entry -> internal/constructor -> exit/blocked), with straight
    edges. Not the interactive React Flow view — a readable, printable
    substitute for a document that can't run JavaScript."""
    if not graph.nodes:
        return "<p>No fund-flow graph is available for this analysis.</p>"

    role_rank = {"entry": 0, "constructor": 1, "internal": 2, "exit": 3, "blocked": 3}
    ordered: list[GraphNode] = sorted(
        graph.nodes, key=lambda n: (role_rank.get(n.role, 2), n.contract, n.function)
    )

    row_height = 56
    width = 720
    height = max(120, row_height * len(ordered) + 40)
    positions: dict[str, tuple[int, int]] = {}

    rows = []
    for i, node in enumerate(ordered):
        y = 30 + i * row_height
        positions[node.id] = (150, y)
        color = _ROLE_COLOR.get(node.role, "#c7c2af")
        label = _e(f"{node.contract}.{node.function}")
        rows.append(
            f'<rect x="20" y="{y - 14}" width="260" height="28" rx="4" '
            f'fill="none" stroke="{color}" stroke-width="2"/>'
            f'<text x="30" y="{y + 5}" font-family="monospace" font-size="12" fill="{color}">{label}'
            f' [{_e(node.role)}]</text>'
        )

    edges = []
    for edge in graph.edges:
        if edge.source not in positions or edge.target not in positions:
            continue
        x1, y1 = positions[edge.source]
        x2, y2 = positions[edge.target]
        stroke = "#8a2c1c" if edge.blocked else "#9a9584"
        dash = ' stroke-dasharray="4 4"' if edge.blocked else ""
        edges.append(
            f'<line x1="{x1 + 130}" y1="{y1}" x2="{x2 - 130 + 300}" y2="{y2}" '
            f'stroke="{stroke}" stroke-width="1.5"{dash}/>'
        )

    return (
        f'<svg viewBox="0 0 {width} {height}" width="100%" height="{height}" '
        f'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fund-flow graph">'
        f"{''.join(edges)}{''.join(rows)}</svg>"
    )


def _findings_section(findings: list[Finding]) -> str:
    if not findings:
        return "<p>No findings from the current detector registry.</p>"

    by_severity: dict[str, list[Finding]] = {s: [] for s in _SEVERITY_ORDER}
    for f in findings:
        by_severity.setdefault(f.severity, []).append(f)

    parts: list[str] = []
    for severity in _SEVERITY_ORDER:
        group = by_severity.get(severity, [])
        if not group:
            continue
        parts.append(f'<h3 class="severity-{_e(severity)}">{_e(severity.upper())} ({len(group)})</h3>')
        for f in group:
            validated_badge = ' <span class="badge-validated">Foundry-validated</span>' if f.validated else ""
            parts.append(
                f"""
                <article class="finding">
                  <h4>{_e(f.title)}{validated_badge}</h4>
                  <p class="meta">{_e(f.detector_id)} v{_e(f.detector_version)} ·
                     {_e(f.file)}:{f.line_start}-{f.line_end} · confidence {f.confidence:.2f} ·
                     reachability {_e(f.reachability)}</p>
                  <pre>{_e(f.code_excerpt)}</pre>
                  <p><strong>Explanation:</strong> {_e(f.explanation)}</p>
                  <p><strong>Triggering condition:</strong> {_e(f.triggering_condition)}</p>
                  <p><strong>Asset-lock consequence:</strong> {_e(f.asset_lock_consequence)}</p>
                  <p><strong>Remediation:</strong> {_e(f.remediation)}</p>
                </article>
                """
            )
    return "".join(parts)


def _score_breakdown_section(analysis: AnalysisSummary) -> str:
    if not analysis.score_breakdown:
        return ""
    rows = "".join(
        f"<tr><td>{_e(b.finding_id)}</td><td>{b.severity_weight:g}</td><td>{b.confidence:.2f}</td>"
        f"<td>{_e(b.reachability)}</td><td>{b.asset_exposure:.2f}</td>"
        f"<td>{b.dependency_criticality:.2f}</td><td>-{b.recovery_offset:.2f}</td>"
        f"<td>{b.contribution:.1f}</td></tr>"
        for b in analysis.score_breakdown
    )
    return f"""
    <table class="breakdown">
      <thead><tr><th>Finding</th><th>Severity</th><th>Confidence</th><th>Reach</th>
      <th>Exposure</th><th>Dependency</th><th>Recovery</th><th>Contribution</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>
    """


def _coverage_notes_html(notes: list[str]) -> str:
    if not notes:
        return ""
    items = "".join(f"<li>{_e(n)}</li>" for n in notes)
    return f"<ul>{items}</ul>"


def _graph_section_html(graph: FundFlowGraph | None) -> str:
    if not graph:
        return "<p>No fund-flow graph is available for this analysis.</p>"
    return _render_graph_svg(graph)


_LIMITATIONS_SUMMARY = """
This report reflects a deterministic, evidence-based static (and where noted, dynamically
validated) analysis against a fixed ten-detector registry — it is not a formal verification and
does not prove the absence of fund-lock risk beyond what these specific detectors check for.
Only findings from detector types FLARE-WD-001 and FLARE-WD-002 can be executable-proof
validated today; an unvalidated finding is not thereby wrong. See the project's
docs/LIMITATIONS.md for the complete, current list of scope and methodology caveats.
"""


def render_html_report(analysis: AnalysisSummary) -> str:
    generated_at = datetime.now().astimezone().isoformat(timespec="seconds")
    files_analyzed = sorted({c.file for c in (analysis.ir.contracts if analysis.ir else [])})
    coverage_pct = f"{analysis.coverage * 100:.0f}%" if analysis.coverage is not None else "—"
    score_display = f"{analysis.flare_score:.1f}" if analysis.flare_score is not None else "—"

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>FLARE Report — {_e(analysis.project_name)}</title>
<style>
  :root {{ color-scheme: light; }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; padding: 2rem; max-width: 900px; margin-inline: auto;
    font-family: Georgia, "Times New Roman", serif; color: #131210; background: #eeece3;
    line-height: 1.5;
  }}
  h1, h2, h3, h4 {{ font-family: -apple-system, "Segoe UI", sans-serif; font-weight: 700; }}
  h1 {{ font-size: 2rem; margin-bottom: 0.25rem; }}
  h2 {{ margin-top: 2.5rem; border-bottom: 2px solid #131210; padding-bottom: 0.25rem; }}
  h3 {{ margin-top: 1.5rem; }}
  .meta-line {{ font-family: monospace; font-size: 0.85rem; color: #37352d; }}
  .stat-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1rem; }}
  .stat {{ border: 1px solid #c7c2af; border-radius: 8px; padding: 1rem; background: #f6f5f0; }}
  .stat .value {{ font-size: 1.75rem; font-weight: 700; font-family: -apple-system, sans-serif; }}
  .stat .label {{
    font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #716c5c;
  }}
  table {{ border-collapse: collapse; width: 100%; font-size: 0.8rem; margin-top: 1rem; }}
  table th, table td {{ border: 1px solid #c7c2af; padding: 0.4rem 0.6rem; text-align: left; }}
  table th {{ background: #dad6c7; }}
  .finding {{
    border: 1px solid #c7c2af; border-radius: 8px; padding: 1rem;
    margin-top: 0.75rem; background: #f6f5f0;
  }}
  .finding pre {{
    background: #131210; color: #eeece3; padding: 0.75rem;
    border-radius: 6px; overflow-x: auto; font-size: 0.8rem;
  }}
  .badge-validated {{
    font-size: 0.7rem; background: #dbe9df; color: #245030;
    padding: 0.15rem 0.5rem; border-radius: 999px;
  }}
  .severity-critical, .severity-high {{ color: #8a2c1c; }}
  .severity-medium {{ color: #734810; }}
  .severity-low {{ color: #245030; }}
  .limitations {{ font-size: 0.85rem; color: #37352d; border-left: 3px solid #c7c2af; padding-left: 1rem; }}
  svg text {{ font-family: monospace; }}
  @media print {{
    body {{ background: #fff; max-width: none; padding: 0.5in; }}
    .stat, .finding {{ break-inside: avoid; }}
    h2 {{ break-before: page; }}
    h2:first-of-type {{ break-before: avoid; }}
  }}
</style>
</head>
<body>
  <h1>FLARE Analysis Report</h1>
  <p class="meta-line">{_e(analysis.project_name)} {_e(analysis.project_version)} ·
     id {_e(analysis.id)} · generated {_e(generated_at)} ·
     origin {_e(analysis.origin)}</p>

  <h2>Scope</h2>
  <p>Files analyzed ({len(files_analyzed)}):</p>
  <ul>{"".join(f"<li>{_e(f)}</li>" for f in files_analyzed) or "<li>(none recorded)</li>"}</ul>

  <h2>FLARE Score</h2>
  <div class="stat-grid">
    <div class="stat"><div class="value">{_e(score_display)}</div>
      <div class="label">FLARE Score</div></div>
    <div class="stat"><div class="value">{_e(analysis.risk_band or "—")}</div>
      <div class="label">Risk Band</div></div>
    <div class="stat"><div class="value">{_e(coverage_pct)}</div>
      <div class="label">Coverage</div></div>
    <div class="stat"><div class="value">{analysis.finding_count}</div>
      <div class="label">Findings</div></div>
  </div>
  <p class="meta-line">formula v{_e(analysis.formula_version or "—")}</p>
  {_coverage_notes_html(analysis.coverage_notes)}
  {_score_breakdown_section(analysis)}

  <h2>Findings</h2>
  {_findings_section(analysis.findings)}

  <h2>Fund-Flow Graph</h2>
  {_graph_section_html(analysis.graph)}

  <h2>Limitations</h2>
  <p class="limitations">{_LIMITATIONS_SUMMARY.strip()}</p>
</body>
</html>
"""
