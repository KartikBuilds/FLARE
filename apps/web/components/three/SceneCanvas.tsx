"use client";

import * as React from "react";
import { Canvas, type CameraProps } from "@react-three/fiber";
import { LIGHTING } from "./palette";
import type { SceneQuality } from "./capabilities";

interface SceneCanvasProps {
  quality: Exclude<SceneQuality, "off">;
  visible: boolean;
  onFailure: () => void;
  onReady: () => void;
  camera?: CameraProps;
  children: React.ReactNode;
}

/**
 * The renderer settings every FLARE scene shares.
 *
 * Everything here is a deliberate cost decision:
 *
 * - `frameloop` follows visibility. An off-screen canvas renders no frames at
 *   all rather than quietly spinning a rAF loop behind the fold.
 * - Device pixel ratio is capped. Left uncapped a 3× phone renders nine times
 *   the fragments for a scene nobody is inspecting at pixel level.
 * - Shadows are off entirely. Scenes use a flat blob under the props, which
 *   costs one transparent disc instead of a depth pass per light.
 * - `powerPreference: "low-power"` asks for the integrated GPU. These scenes
 *   are decoration; they should not spin up a discrete card.
 *
 * A lost context hands the slot back to the static illustration rather than
 * leaving a dead black rectangle on the page.
 */
export function SceneCanvas({
  quality,
  visible,
  onFailure,
  onReady,
  camera,
  children,
}: SceneCanvasProps) {
  const handleCreated = React.useCallback(
    ({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
      gl.domElement.addEventListener(
        "webglcontextlost",
        (event) => {
          event.preventDefault();
          onFailure();
        },
        { once: true },
      );
      // One frame's grace before the illustration underneath is faded out, so
      // the cross-fade never passes through an empty slot.
      requestAnimationFrame(() => requestAnimationFrame(onReady));
    },
    [onFailure, onReady],
  );

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      shadows={false}
      gl={{
        antialias: quality === "high",
        alpha: true,
        powerPreference: "low-power",
      }}
      camera={camera}
      onCreated={handleCreated}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={LIGHTING.ambient} />
      <directionalLight position={LIGHTING.keyPosition} intensity={LIGHTING.keyIntensity} />
      <directionalLight position={LIGHTING.rimPosition} intensity={LIGHTING.rimIntensity} />
      {children}
    </Canvas>
  );
}
