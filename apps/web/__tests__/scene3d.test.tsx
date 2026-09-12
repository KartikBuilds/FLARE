import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Scene3D, type SceneProps } from "@/components/three/Scene3D";
import { setMediaQuery } from "../vitest.setup";

/**
 * Stands in for a WebGL scene. If it is ever rendered in these tests, the
 * gating in Scene3D has failed — jsdom has no WebGL, so every path here must
 * resolve to the static illustration.
 */
const sceneRendered = vi.fn();
function FakeScene(_props: SceneProps) {
  sceneRendered();
  return <div data-testid="webgl-scene" />;
}

function Fallback() {
  return <div data-testid="fallback">Line art of the vault and its two exit routes</div>;
}

describe("Scene3D", () => {
  it("renders the static illustration", () => {
    render(<Scene3D Scene={FakeScene} fallback={<Fallback />} />);
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("never starts WebGL when the environment cannot provide a context", () => {
    sceneRendered.mockClear();
    const { container } = render(<Scene3D Scene={FakeScene} fallback={<Fallback />} />);
    expect(sceneRendered).not.toHaveBeenCalled();
    expect(screen.queryByTestId("webgl-scene")).not.toBeInTheDocument();
    expect(container.querySelector("[data-scene-quality]")).toHaveAttribute(
      "data-scene-quality",
      "off",
    );
  });

  it("stays on the illustration under reduced motion", () => {
    setMediaQuery("(prefers-reduced-motion: reduce)", true);
    sceneRendered.mockClear();
    render(<Scene3D Scene={FakeScene} fallback={<Fallback />} />);
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(sceneRendered).not.toHaveBeenCalled();
  });

  it("reserves a fixed box so an arriving scene cannot shift the layout", () => {
    const { container } = render(
      <Scene3D Scene={FakeScene} fallback={<Fallback />} aspect="16 / 7" />,
    );
    const host = container.querySelector("[data-scene-quality]") as HTMLElement;
    expect(host.style.aspectRatio).toBe("16 / 7");
  });

  it("drops the reserved box in fill mode, where the ancestor is already sized", () => {
    const { container } = render(
      <Scene3D Scene={FakeScene} fallback={<Fallback />} fill />,
    );
    const host = container.querySelector("[data-scene-quality]") as HTMLElement;
    expect(host.style.aspectRatio).toBe("");
    expect(host.className).toContain("absolute");
  });

  it("exposes an analytical scene's description to assistive tech", () => {
    render(
      <Scene3D
        Scene={FakeScene}
        fallback={<Fallback />}
        description="An asset enters the vault and leaves by one of two routes."
      />,
    );
    expect(
      screen.getByText("An asset enters the vault and leaves by one of two routes."),
    ).toBeInTheDocument();
  });

  it("adds no description for a purely atmospheric scene", () => {
    const { container } = render(<Scene3D Scene={FakeScene} fallback={<Fallback />} />);
    expect(container.querySelector(".sr-only")).toBeNull();
  });

  it("hides the illustration from assistive tech — it duplicates the copy around it", () => {
    const { container } = render(<Scene3D Scene={FakeScene} fallback={<Fallback />} />);
    const host = container.querySelector("[data-scene-quality]") as HTMLElement;
    const layer = host.querySelector(":scope > div");
    expect(layer).toHaveAttribute("aria-hidden", "true");
  });
});
