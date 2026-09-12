"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SceneCanvas } from "./SceneCanvas";
import type { SceneProps } from "./Scene3D";
import { Fragments, useSceneMaterials } from "./parts";
import { Astronaut, CrateredBody } from "./parts-space";

function NotFoundRig({ quality }: { quality: "low" | "high" }) {
  const materials = useSceneMaterials();
  const figure = React.useRef<THREE.Group>(null);
  const debris = React.useRef<THREE.Group>(null);
  const body = React.useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Zero-g: slow, uneven tumble on all three axes, with a long drift. No
    // single rotation rate, so it never reads as a turntable.
    if (figure.current) {
      figure.current.rotation.x += delta * 0.09;
      figure.current.rotation.y += delta * 0.13;
      figure.current.rotation.z = Math.sin(t * 0.21) * 0.3;
      figure.current.position.y = 0.4 + Math.sin(t * 0.27) * 0.42;
      figure.current.position.x = 3.6 + Math.sin(t * 0.17) * 0.3;
    }
    if (debris.current) {
      debris.current.rotation.y += delta * 0.05;
      debris.current.rotation.x = Math.sin(t * 0.13) * 0.12;
    }
    if (body.current) body.current.rotation.y += delta * 0.012;
  });

  return (
    <group>
      {/* The asset, adrift outside the protocol. Sits right of centre so it
          never collides with the headline on the left. */}
      <group ref={figure} position={[3.6, 0.4, 1.2]} scale={1.05}>
        <Astronaut materials={materials} quality={quality} head="coin" />
      </group>

      {/* Detached protocol fragments, scattered along its path. */}
      <group ref={debris} position={[2.2, 0, 0]}>
        <Fragments count={quality === "high" ? 22 : 10} materials={materials} spread={7} seed={17} />
      </group>

      {/* Only a shallow arc of the body shows, running off the bottom-right
          corner of the page rather than being cut by a visible frame edge. */}
      <group ref={body} position={[9.5, -13.5, -3]}>
        <CrateredBody materials={materials} quality={quality} radius={10.5} craters={16} />
      </group>
    </group>
  );
}

export default function NotFoundScene({ quality, visible, onFailure, onReady }: SceneProps) {
  return (
    <SceneCanvas
      quality={quality}
      visible={visible}
      onFailure={onFailure}
      onReady={onReady}
      camera={{ position: [0, 0.4, 9], fov: 42 }}
    >
      <NotFoundRig quality={quality} />
    </SceneCanvas>
  );
}
