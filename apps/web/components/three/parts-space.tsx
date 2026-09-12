"use client";

import * as React from "react";
import * as THREE from "three";
import { Instance, Instances } from "@react-three/drei";
import { detail, noise } from "./palette";
import { AssetCoin, type Materials } from "./parts";

/**
 * A pressure-suited figure, assembled from jointed segments rather than one
 * blob: helmet, collar, torso, analyzer pack, shoulder and hip rings, limbs
 * and boots. The head can be the suit helmet or the asset itself — the 404
 * scene uses the coin, because the thing that took a wrong turn *is* the
 * asset.
 */
export function Astronaut({
  materials,
  quality,
  head = "helmet",
  seated = false,
  ...props
}: {
  materials: Materials;
  quality: "low" | "high";
  head?: "helmet" | "coin";
  seated?: boolean;
} & React.ComponentProps<"group">) {
  const d = detail(quality);

  // Seated: thighs forward and shins down. Floating: legs loose and splayed.
  const legPose: Array<{ hip: [number, number, number]; rot: [number, number, number] }> = seated
    ? [
        { hip: [-0.26, -0.62, 0.1], rot: [-1.15, 0, 0.06] },
        { hip: [0.26, -0.62, 0.1], rot: [-1.15, 0, -0.06] },
      ]
    : [
        { hip: [-0.26, -0.62, 0], rot: [-0.5, 0, 0.22] },
        { hip: [0.26, -0.62, 0], rot: [-0.2, 0, -0.3] },
      ];

  return (
    <group {...props}>
      {/* Head */}
      {/* The coin head is tipped so its struck face angles toward the camera;
          left upright it reads as a plain ring from the front. */}
      {head === "coin" ? (
        <group position={[0, 0.86, 0]} rotation={[1.22, 0.3, 0.12]}>
          <AssetCoin materials={materials} quality={quality} radius={0.46} />
        </group>
      ) : (
        <group position={[0, 0.86, 0]}>
          <mesh material={materials.paperLight}>
            <sphereGeometry args={[0.42, d.sphere, d.sphere]} />
          </mesh>
          {/* Visor */}
          <mesh position={[0, 0.02, 0.19]} scale={[1, 0.78, 0.55]} material={materials.metalDark}>
            <sphereGeometry args={[0.34, d.sphere, d.sphere]} />
          </mesh>
          {/* Visor rim */}
          <mesh position={[0, 0.02, 0.19]} rotation={[0.1, 0, 0]} material={materials.brass}>
            <torusGeometry args={[0.31, 0.025, 8, d.ring]} />
          </mesh>
        </group>
      )}

      {/* Collar */}
      <mesh position={[0, 0.52, 0]} material={materials.metal}>
        <cylinderGeometry args={[0.26, 0.3, 0.12, 14]} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.06, 0]} material={materials.paper}>
        <capsuleGeometry args={[0.36, 0.5, 6, d.radial]} />
      </mesh>
      {/* Chest control panel */}
      <mesh position={[0, 0.14, 0.34]} rotation={[0.12, 0, 0]} material={materials.metalDark}>
        <boxGeometry args={[0.3, 0.22, 0.07]} />
      </mesh>
      <mesh position={[0, 0.14, 0.38]} rotation={[0.12, 0, 0]} material={materials.brass}>
        <boxGeometry args={[0.19, 0.1, 0.02]} />
      </mesh>

      {/* Analyzer pack */}
      <group position={[0, 0.12, -0.42]}>
        <mesh material={materials.metal}>
          <boxGeometry args={[0.62, 0.74, 0.3]} />
        </mesh>
        {/* A readout plate on both faces of the pack, so the figure carries the
            same detail whether the scene views it from the front or the back. */}
        {[0.17, -0.17].map((z) => (
          <mesh key={z} position={[0, 0.06, z]} material={materials.paperDeep}>
            <boxGeometry args={[0.42, 0.36, 0.02]} />
          </mesh>
        ))}
        {[0.19, -0.19].map((z) => (
          <mesh key={z} position={[0, 0.06, z]} material={materials.brass}>
            <boxGeometry args={[0.2, 0.14, 0.02]} />
          </mesh>
        ))}
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, -0.42, 0]} material={materials.brass}>
            <cylinderGeometry args={[0.07, 0.07, 0.16, 10]} />
          </mesh>
        ))}
      </group>

      {/* Shoulder and hip joints */}
      {[
        [-0.42, 0.32, 0],
        [0.42, 0.32, 0],
      ].map(([x, y, z]) => (
        <mesh key={`s${x}`} position={[x, y, z]} material={materials.brass}>
          <sphereGeometry args={[0.14, 12, 12]} />
        </mesh>
      ))}

      {/* Arms */}
      <mesh position={[-0.5, 0.05, 0.08]} rotation={[0.3, 0, 0.55]} material={materials.paperDeep}>
        <capsuleGeometry args={[0.12, 0.42, 4, 12]} />
      </mesh>
      <mesh position={[0.5, 0.05, 0.08]} rotation={[0.3, 0, -0.55]} material={materials.paperDeep}>
        <capsuleGeometry args={[0.12, 0.42, 4, 12]} />
      </mesh>

      {/* Legs and boots */}
      {legPose.map((leg, i) => (
        <group key={i} position={leg.hip} rotation={leg.rot}>
          <mesh material={materials.paper}>
            <capsuleGeometry args={[0.145, 0.44, 4, 12]} />
          </mesh>
          <mesh position={[0, -0.38, 0.06]} rotation={[0.4, 0, 0]} material={materials.metalDark}>
            <boxGeometry args={[0.24, 0.16, 0.34]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * A cratered body filling the lower frame.
 *
 * Craters are instanced rings laid onto the sphere's surface and oriented
 * outward — cheaper and more controllable than displacing the geometry, and it
 * keeps the silhouette clean.
 */
export function CrateredBody({
  materials,
  quality,
  radius = 6,
  craters = 12,
  ...props
}: {
  materials: Materials;
  quality: "low" | "high";
  radius?: number;
  craters?: number;
} & React.ComponentProps<"group">) {
  const d = detail(quality);
  const count = quality === "high" ? craters : Math.ceil(craters / 2);

  const placements = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const k = 900 + i * 5;
      // Bias toward the upper hemisphere — that is the part on screen.
      const theta = noise(k) * Math.PI * 2;
      const phi = Math.acos(0.25 + noise(k + 1) * 0.7);
      const position = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      ).multiplyScalar(radius * 0.995);
      // A torus lies in its own XY plane with its axis on Z, so the surface
      // normal has to be matched to Z. Aligning Y instead stands every crater
      // up on edge like a wheel half-sunk in the ground.
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize(),
      );
      return {
        position: position.toArray() as [number, number, number],
        quaternion,
        scale: 0.25 + noise(k + 2) * 0.75,
      };
    });
  }, [count, radius]);

  return (
    <group {...props}>
      <mesh material={materials.paperDeep}>
        <sphereGeometry args={[radius, d.sphere * 2, d.sphere]} />
      </mesh>
      <Instances limit={count} material={materials.paperDeep}>
        <torusGeometry args={[0.55, 0.09, 6, 18]} />
        {placements.map((placement, i) => (
          <Instance
            key={i}
            position={placement.position}
            quaternion={placement.quaternion}
            scale={placement.scale}
          />
        ))}
      </Instances>
    </group>
  );
}

/** Distant protocol nodes: small lit instruments hanging in the background. */
export function DistantNodes({
  materials,
  count = 5,
  ...props
}: { materials: Materials; count?: number } & React.ComponentProps<"group">) {
  const items = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const k = 4200 + i * 4;
        return {
          position: [
            (noise(k) - 0.5) * 18,
            noise(k + 1) * 5 + 1.5,
            -8 - noise(k + 2) * 6,
          ] as [number, number, number],
          scale: 0.2 + noise(k + 3) * 0.22,
        };
      }),
    [count],
  );

  return (
    <group {...props}>
      {items.map((item, i) => (
        <group key={i} position={item.position} scale={item.scale}>
          <mesh material={materials.paperDeep}>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
          <mesh material={materials.brass}>
            <torusGeometry args={[1.25, 0.08, 6, 20]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
