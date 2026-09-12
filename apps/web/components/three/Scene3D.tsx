"use client";

import * as React from "react";
import { cn } from "@flare/ui";
import { useSceneQuality, type SceneQuality } from "./capabilities";

export interface SceneProps {
  quality: Exclude<SceneQuality, "off">;
  /** False while the container is off-screen — scenes must stop rendering. */
  visible: boolean;
  /** Call on a lost WebGL context to hand the slot back to the illustration. */
  onFailure: () => void;
  /** Call once the renderer exists, so the illustration beneath can fade out. */
  onReady: () => void;
}

interface Scene3DProps {
  /**
   * The WebGL scene, created by the caller with next/dynamic and ssr:false so
   * three.js lands in its own chunk and never in a route's initial bundle.
   */
  Scene: React.ComponentType<SceneProps>;
  /**
   * Full-quality static illustration of the same composition. This is not a
   * placeholder — it is what a visitor without WebGL, with reduced motion, on
   * constrained hardware, or behind a failed chunk load actually keeps.
   */
  fallback: React.ReactNode;
  /** CSS aspect-ratio for the reserved box. Fixed to keep layout shift at zero. */
  aspect?: string;
  /**
   * Fill the nearest positioned ancestor instead of reserving a box of its
   * own. Use when the scene is a full-bleed backdrop — a composition designed
   * to run off the edge of the page looks boxed if it is confined to a cell.
   * The ancestor must already be sized by its own content, so there is still
   * nothing to shift.
   */
  fill?: boolean;
  className?: string;
  /**
   * Screen-reader description. Supply it when the scene carries analytical
   * meaning; omit it when the scene is purely atmospheric and the surrounding
   * copy already says everything.
   */
  description?: string;
}

/** Reverts to the static illustration if the scene throws at any point. */
class SceneBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Hosts one WebGL scene over its static illustration.
 *
 * The illustration renders first and always. WebGL is only started once the
 * box is near the viewport *and* the device has been judged capable, and the
 * canvas fades in over the illustration rather than replacing it — so there is
 * no frame where the slot is empty, and no layout shift when the scene
 * arrives. If anything goes wrong (no WebGL, chunk fails, scene throws,
 * context lost) the illustration is simply what stays on screen.
 */
export function Scene3D({
  Scene,
  fallback,
  aspect = "16 / 10",
  fill = false,
  className,
  description,
}: Scene3DProps) {
  const quality = useSceneQuality();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // Two thresholds from one observer: a generous margin decides when to start
  // fetching and mounting, a tight one decides whether to keep rendering
  // frames. An off-screen canvas must not burn a frame loop.
  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          preload.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    const onScreen = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "0px" },
    );

    preload.observe(element);
    onScreen.observe(element);
    return () => {
      preload.disconnect();
      onScreen.disconnect();
    };
  }, []);

  const canRender = quality !== "off" && near && !failed;

  return (
    <div
      ref={containerRef}
      className={cn(fill ? "absolute inset-0" : "relative w-full", className)}
      style={fill ? undefined : { aspectRatio: aspect }}
      // Surfaced so the QA harness can assert which path a device actually
      // took — WebGL or illustration — instead of inferring it from pixels.
      data-scene-quality={quality}
      data-scene-near={String(near)}
      data-scene-visible={String(visible)}
      data-scene-ready={String(ready)}
      data-scene-failed={String(failed)}
    >
      {/* Always mounted and always sized, so the slot is never empty and the
          box never resizes. It only fades out once the renderer actually
          exists — the canvas is alpha:true, so leaving both at full opacity
          would show line art through the middle of the 3D scene. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        {fallback}
      </div>

      {canRender ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <SceneBoundary onError={() => setFailed(true)}>
            <Scene
              quality={quality as Exclude<SceneQuality, "off">}
              visible={visible}
              onReady={() => setReady(true)}
              onFailure={() => {
                setFailed(true);
                setReady(false);
              }}
            />
          </SceneBoundary>
        </div>
      ) : null}

      {description ? <p className="sr-only">{description}</p> : null}
    </div>
  );
}
