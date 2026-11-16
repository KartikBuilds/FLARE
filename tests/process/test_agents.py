"""Every department is a real Claude Code agent with a model, tools and a checklist."""

from pathlib import Path

AGENTS = Path(__file__).resolve().parents[2] / ".claude" / "agents"
DEPARTMENTS = {
    "research-security-intelligence", "product-business-analysis", "architecture",
    "core-development", "ui-ux-design", "qa-security-validation", "devops-maintenance",
    "academic-research-docs",
}
REVIEWERS = {"architecture", "qa-security-validation", "academic-research-docs"}
MODELS = {"haiku", "sonnet", "opus", "fable"}


def frontmatter(path):
    text = path.read_text()
    assert text.startswith("---\n"), path.name
    head, body = text[4:].split("\n---\n", 1)
    fields = dict(line.split(":", 1) for line in head.splitlines() if ":" in line)
    return {k.strip(): v.strip() for k, v in fields.items()}, body


def test_all_departments_defined():
    assert {p.stem for p in AGENTS.glob("*.md")} == DEPARTMENTS


def test_required_fields_and_valid_model():
    for p in AGENTS.glob("*.md"):
        fm, body = frontmatter(p)
        assert fm["name"] == p.stem
        assert fm["description"] and fm["tools"]
        assert fm["model"] in MODELS, p.name
        assert "## Checklist" in body and "## Output" in body, p.name


def test_reviewers_cannot_edit_code():
    for name in REVIEWERS:
        fm, _ = frontmatter(AGENTS / f"{name}.md")
        tools = {t.strip() for t in fm["tools"].split(",")}
        assert "Edit" not in tools, name


def test_reviewer_model_differs_from_builder():
    builder = frontmatter(AGENTS / "core-development.md")[0]["model"]
    reviewer = frontmatter(AGENTS / "qa-security-validation.md")[0]["model"]
    assert builder != reviewer
