"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SceneCanvas } from "./SceneCanvas";
import type { SceneProps } from "./Scene3D";
import {
  AssetCoin,
  BlobShadow,
  Fragments,
  Gauge,
  PipeRun,
  ProtocolCore,
  Vault,
  useSceneMaterials,
  usePipeCurve,
  type Materials,
} from "./parts";

/** Where the asset enters, before the intake checkpoint. */
const INTAKE_PATH: [number, number, number][] = [
  [-5.4, 1.5, 0],
  [-4.4, 0.9, 0],
  [-3.7, 0.2, 0],
  [-2.4, 0.05, 0],
];

/** The route that actually returns value to the holder. */
const EXIT_PATH: [number, number, number][] = [
  [1.0, -0.2, 0.2],
  [2.4, -0.5, 0.5],
  [3.6, -1.1, 0.6],
  [5.2, -1.3, 0.6],
];

/** The route that does not. The break sits just past the vault. */
const BLOCKED_PATH: [number, number, number][] = [
  [1.0, 0.5, -0.2],
  [2.3, 0.9, -0.5],
  [3.4, 1.2, -0.8],
  [4.6, 1.1, -1.0],
];

/**
 * A bead of value travelling a route.
 *
 * The blocked route's bead is not a different animation — it runs the same
 * path and simply cannot get past `limit`, which is where the pipe is severed.
 * That is the whole argument of the product, stated as motion.
 */
function Pulse({
  curve,
  materials,
  limit = 1,
  speed = 0.22,
  tone,
}: {
  curve: THREE.CatmullRomCurve3;
  materials: Materials;
  limit?: number;
  speed?: number;
  tone: "verified" | "blocked";
}) {
  const ref = React.useRef<THREE.Mesh>(null);
  const progress = React.useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    progress.current += delta * speed;
    if (progress.current > 1) progress.current = 0;

    const t = Math.min(progress.current, limit);
    const point = curve.getPointAt(t);
    ref.current.position.copy(point);

    // At the break the bead stalls and shrinks rather than vanishing, so the
    // failure is legible instead of just being an absence.
    const stalled = progress.current > limit;
    const scale = stalled ? Math.max(0, 1 - (progress.current - limit) * 6) : 1;
    ref.current.scale.setScalar(scale * 0.12);
  });

  return (
    <mesh ref={ref} material={tone === "blocked" ? materials.blocked : materials.verified}>
      <sphereGeometry args={[1, 12, 12]} />
    </mesh>
  );
}

function HeroRig({ quality }: { quality: "low" | "high" }) {
  const materials = useSceneMaterials();
  const group = React.useRef<THREE.Group>(null);
  const coinBob = React.useRef<THREE.Group>(null);
  const coinSpin = React.useRef<THREE.Group>(null);
  const core = React.useRef<THREE.Group>(null);
  const drift = React.useRef<THREE.Group>(null);

  const intake = usePipeCurve(INTAKE_PATH);
  const exit = usePipeCurve(EXIT_PATH);
  const blocked = usePipeCurve(BLOCKED_PATH);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Tilt and spin are separated: the outer group holds the angle that shows
    // the coin's face to the camera, the inner one turns about the coin's own
    // axis. Spinning the tilted group instead would make it tumble.
    if (coinBob.current) coinBob.current.position.y = 1.5 + Math.sin(t * 0.9) * 0.12;
    if (coinSpin.current) coinSpin.current.rotation.y += delta * 0.55;
    if (core.current) core.current.rotation.y += delta * 0.12;
    if (drift.current) drift.current.rotation.y = Math.sin(t * 0.15) * 0.12;

    if (group.current) {
      // Restrained pointer parallax, damped so it trails the cursor rather
      // than snapping to it. Capped well under a degree of real rotation.
      const targetY = state.pointer.x * 0.12;
      const targetX = -state.pointer.y * 0.06;
      group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(1, delta * 2.2);
      group.current.rotation.x += (targetX - group.current.rotation.x) * Math.min(1, delta * 2.2);

      // Scroll progression: the rig sinks and turns very slightly as the hero
      // leaves. Reads scrollY only — the page scrolls normally throughout.
      const scrolled = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
      group.current.position.y = -scrolled * 0.9;
    }
  });

  return (
    <group ref={group}>
      <group ref={drift}>
        <Fragments count={quality === "high" ? 16 : 8} materials={materials} spread={6} seed={7} />
      </group>

      {/* The asset, still outside the protocol. */}
      <group ref={coinBob} position={[-5.4, 1.5, 0]} rotation={[1.16, 0, 0.22]}>
        <group ref={coinSpin}>
          <AssetCoin materials={materials} quality={quality} radius={0.62} />
        </group>
      </group>

      {/* Intake checkpoint. */}
      <group position={[-3.1, -0.35, 0]}>
        <mesh material={materials.metal}>
          <boxGeometry args={[1.1, 0.9, 1.0]} />
        </mesh>
        <mesh position={[0, 0.62, 0]} material={materials.metalDark}>
          <cylinderGeometry args={[0.34, 0.5, 0.36, 12]} />
        </mesh>
        <Gauge materials={materials} position={[0, 0.5, 0.52]} rotation={[1.2, 0, 0]} radius={0.17} />
        <BlobShadow materials={materials} radius={1.0} position={[0, -0.52, 0]} />
      </group>

      {/* Mounting rail the intake and vault are both bolted to, so the two
          machines read as one installation rather than two floating props. */}
      <mesh position={[-1.75, -1.28, 0]} material={materials.metalDark}>
        <boxGeometry args={[3.4, 0.16, 0.7]} />
      </mesh>
      {[-3.1, -0.45].map((x) => (
        <mesh key={x} position={[x, -1.12, 0]} material={materials.brass}>
          <cylinderGeometry args={[0.07, 0.07, 0.2, 8]} />
        </mesh>
      ))}

      <PipeRun curve={intake} materials={materials} quality={quality} radius={0.13} />

      {/* The vault. */}
      <group position={[-0.4, 0.05, 0]} rotation={[0, -0.45, 0]}>
        <Vault materials={materials} quality={quality} />
      </group>
      <BlobShadow materials={materials} radius={1.9} position={[-0.4, -1.28, 0]} />

      {/* Two routes out. One of them works. */}
      <PipeRun curve={exit} materials={materials} quality={quality} radius={0.13} tone="verified" />
      <Pulse curve={exit} materials={materials} tone="verified" speed={0.24} />

      <PipeRun
        curve={blocked}
        materials={materials}
        quality={quality}
        radius={0.13}
        tone="blocked"
        severed
      />
      <Pulse curve={blocked} materials={materials} tone="blocked" limit={0.34} speed={0.3} />

      {/* Debris thrown from the break, so the cut route reads as a failure and
          not as a design decision. */}
      <group position={[2.9, 1.05, -0.65]}>
        <Fragments count={quality === "high" ? 7 : 4} materials={materials} spread={1.1} seed={31} />
      </group>

      {/* Protocol core, riding above the far end. */}
      <group ref={core} position={[4.6, 2.0, -0.6]}>
        <ProtocolCore materials={materials} quality={quality} radius={0.95} />
      </group>
    </group>
  );
}

export default function HeroScene({ quality, visible, onFailure, onReady }: SceneProps) {
  return (
    <SceneCanvas
      quality={quality}
      visible={visible}
      onFailure={onFailure}
      onReady={onReady}
      camera={{ position: [0, 0.9, 11.5], fov: 40 }}
    >
      <HeroRig quality={quality} />
    </SceneCanvas>
  );
}
