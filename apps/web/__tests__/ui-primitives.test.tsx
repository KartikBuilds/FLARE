import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, DemoBadge, LiveEngineBadge, Button, SectionLabel } from "@flare/ui";

describe("Badge", () => {
  it("renders arbitrary tone content", () => {
    render(<Badge tone="danger">Critical</Badge>);
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("DemoBadge always reads exactly Demo — never implies a live analysis", () => {
    render(<DemoBadge />);
    expect(screen.getByText("Demo")).toBeInTheDocument();
  });

  it("LiveEngineBadge always reads exactly Live Engine", () => {
    render(<LiveEngineBadge />);
    expect(screen.getByText("Live Engine")).toBeInTheDocument();
  });
});

describe("Button", () => {
  it("renders its label and is keyboard-focusable", () => {
    render(<Button>Run analysis</Button>);
    const button = screen.getByRole("button", { name: /run analysis/i });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });
});

describe("SectionLabel", () => {
  it("renders the numbered index and label", () => {
    render(<SectionLabel index="01" label="The Problem" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText(/the problem/i)).toBeInTheDocument();
  });
});
