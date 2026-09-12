"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SceneCanvas } from "./SceneCanvas";
import type { SceneProps } from "./Scene3D";
import { Fragments, useSceneMaterials } from "./parts";
import { Astronaut, CrateredBody, DistantNodes } from "./parts-space";

function DashboardRig({ quality }: { quality: "low" | "high" }) {
  const materials = useSceneMaterials();
  const figure = React.useRef<THREE.Group>(null);
  const planet = React.useRef<THREE.Group>(null);
  const debris = React.useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // The figure is seated and still. It breathes; it does not perform.
    // Anything more would pull attention off the analysis controls above.
    if (figure.current) {
      figure.current.position.y = -1.15 + Math.sin(t * 0.5) * 0.022;
      figure.current.rotation.y = Math.PI - 0.2 + Math.sin(t * 0.22) * 0.025;
    }
    if (planet.current) planet.current.rotation.y += delta * 0.018;
    if (debris.current) debris.current.rotation.y -= delta * 0.03;
  });

  return (
    <group>
      {/* The ground. A large radius set far below frame gives a shallow horizon
          curve across the whole width; a small sphere just reads as a ball. */}
      <group position={[0, -24.4, -2]}>
        <CrateredBody materials={materials} quality={quality} radius={22} craters={22} />
      </group>

      {/* A researcher, seen from behind, looking out at the thing they are
          responsible for — so the analyzer pack faces the reader. */}
      <group ref={figure} position={[2.4, -1.15, 1.6]} rotation={[0, Math.PI - 0.2, 0]} scale={1.85}>
        <Astronaut materials={materials} quality={quality} seated />
      </group>

      {/* The body on the horizon. */}
      <group ref={planet} position={[-5.6, 1.6, -18]}>
        <CrateredBody materials={materials} quality={quality} radius={5.2} craters={12} />
      </group>

      <DistantNodes materials={materials} count={quality === "high" ? 6 : 3} />

      <group ref={debris} position={[0, 0.8, -1]}>
        <Fragments count={quality === "high" ? 14 : 6} materials={materials} spread={8} seed={53} />
      </group>
    </group>
  );
}

export default function DashboardScene({ quality, visible, onFailure, onReady }: SceneProps) {
  return (
    <SceneCanvas
      quality={quality}
      visible={visible}
      onFailure={onFailure}
      onReady={onReady}
      camera={{ position: [0, 0.6, 9.5], fov: 38 }}
    >
      <DashboardRig quality={quality} />
    </SceneCanvas>
  );
}
