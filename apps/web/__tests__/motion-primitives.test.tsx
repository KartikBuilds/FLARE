import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TextReveal, HandNote } from "@/components/motion/TextReveal";
import { InkCursor } from "@/components/motion/InkCursor";
import { Magnetic } from "@/components/motion/Magnetic";
import { setMediaQuery } from "../vitest.setup";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(pointer: fine)";

describe("Reveal", () => {
  it("renders its children", () => {
    render(<Reveal>Visible content</Reveal>);
    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });

  it("marks itself data-reveal so the no-script rule can force it visible", () => {
    const { container } = render(<Reveal>Content</Reveal>);
    expect(container.querySelector("[data-reveal]")).not.toBeNull();
  });

  it("still renders every child under reduced motion", () => {
    setMediaQuery(REDUCED, true);
    render(
      <RevealGroup>
        <RevealItem>First</RevealItem>
        <RevealItem>Second</RevealItem>
        <RevealItem>Third</RevealItem>
      </RevealGroup>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("renders as the requested element so list and definition markup stays valid", () => {
    const { container } = render(
      <RevealGroup as="dl">
        <RevealItem as="dd">Body</RevealItem>
      </RevealGroup>,
    );
    expect(container.querySelector("dl")).not.toBeNull();
    expect(container.querySelector("dd")).not.toBeNull();
  });
});

describe("TextReveal", () => {
  it("exposes the whole heading as one accessible name, not per-line fragments", () => {
    render(<TextReveal as="h2" lines={["Billions locked", "forever."]} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAccessibleName("Billions locked forever.");
  });

  it("hides the split spans from assistive tech", () => {
    const { container } = render(<TextReveal lines={["One", "Two"]} />);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThanOrEqual(2);
  });

  it("renders each word when splitting by word", () => {
    render(<TextReveal lines={["get back out"]} mode="word" />);
    expect(screen.getByText("get")).toBeInTheDocument();
    expect(screen.getByText("back")).toBeInTheDocument();
    expect(screen.getByText("out")).toBeInTheDocument();
  });

  it("keeps the text present under reduced motion", () => {
    setMediaQuery(REDUCED, true);
    render(<TextReveal as="h1" lines={["Path", "Not Found"]} immediate />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("Path Not Found");
  });
});

describe("HandNote", () => {
  it("renders the note text", () => {
    render(<HandNote>five we could verify</HandNote>);
    expect(screen.getByText("five we could verify")).toBeInTheDocument();
  });
});

describe("pointer-only effects", () => {
  it("InkCursor renders nothing on a coarse pointer", () => {
    const { container } = render(<InkCursor />);
    expect(container).toBeEmptyDOMElement();
  });

  it("InkCursor renders nothing when reduced motion is requested, even on a mouse", () => {
    setMediaQuery(FINE_POINTER, true);
    setMediaQuery(REDUCED, true);
    const { container } = render(<InkCursor />);
    expect(container).toBeEmptyDOMElement();
  });

  it("InkCursor draws its layer on a precise pointer", () => {
    setMediaQuery(FINE_POINTER, true);
    const { container } = render(<InkCursor />);
    expect(container.firstChild).not.toBeNull();
  });

  it("Magnetic always renders its child, however the pointer behaves", () => {
    render(
      <Magnetic>
        <button type="button">Open App</button>
      </Magnetic>,
    );
    expect(screen.getByRole("button", { name: "Open App" })).toBeInTheDocument();
  });
});
