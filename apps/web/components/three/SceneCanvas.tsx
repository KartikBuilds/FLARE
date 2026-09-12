"use client";

import * as React from "react";
import { Canvas, useFrame, type CameraProps } from "@react-three/fiber";
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
    },
    [onFailure],
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
      <FirstFrame onReady={onReady} />
      {children}
    </Canvas>
  );
}

/**
 * Signals upward once the scene has actually drawn a frame.
 *
 * Deliberately not onCreated: that fires when the renderer is constructed,
 * which is before anything has been painted. Fading the illustration out at
 * that moment shows an empty slot for a frame or two. Waiting for a real frame
 * also means the illustration correctly stays put on a canvas that never draws
 * one — an off-screen scene with frameloop "never", for instance.
 */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = React.useRef(false);

  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });

  return null;
}
