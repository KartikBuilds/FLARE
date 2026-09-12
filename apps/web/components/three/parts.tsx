"use client";

import * as React from "react";
import * as THREE from "three";
import { Instance, Instances, Outlines } from "@react-three/drei";
import { PALETTE, OUTLINE, detail, noise } from "./palette";

export type Materials = ReturnType<typeof useSceneMaterials>;

/**
 * One set of materials per scene, shared by every mesh in it.
 *
 * Created imperatively rather than as JSX so that a single instance backs
 * dozens of meshes — but that also means React will not dispose them, so the
 * effect below does it explicitly when the scene unmounts. Without that, every
 * navigation away and back leaks a full material set on the GPU.
 */
export function useSceneMaterials() {
  const materials = React.useMemo(() => {
    const matte = (color: string, roughness = 0.85, metalness = 0.05) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: false });

    return {
      paper: matte(PALETTE.paper),
      paperLight: matte(PALETTE.paperLight),
      paperDeep: matte(PALETTE.paperDeep),
      metal: matte(PALETTE.metal, 0.55, 0.45),
      metalMid: matte(PALETTE.metalMid, 0.6, 0.35),
      metalDark: matte(PALETTE.metalDark, 0.5, 0.5),
      brass: matte(PALETTE.brass, 0.45, 0.6),
      ink: matte(PALETTE.ink, 0.95, 0),
      blocked: matte(PALETTE.blocked, 0.7, 0.1),
      verified: matte(PALETTE.verified, 0.7, 0.1),
      shadow: new THREE.MeshBasicMaterial({
        color: PALETTE.ink,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      }),
    };
  }, []);

  React.useEffect(() => {
    return () => {
      for (const material of Object.values(materials)) material.dispose();
    };
  }, [materials]);

  return materials;
}

/** Ink edge around a silhouette. Used sparingly — it costs a second draw. */
function Ink({ quality }: { quality: "low" | "high" }) {
  if (quality === "low") return null;
  return <Outlines thickness={OUTLINE.thickness} color={OUTLINE.color} />;
}

/**
 * A ring of bolt heads. Instanced — a vault face carries a dozen of these and
 * they must not become a dozen draw calls.
 */
export function BoltRing({
  count = 10,
  radius = 1,
  z = 0,
  size = 0.055,
  materials,
}: {
  count?: number;
  radius?: number;
  z?: number;
  size?: number;
  materials: Materials;
}) {
  const positions = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius, z] as [number, number, number];
      }),
    [count, radius, z],
  );

  return (
    <Instances limit={count} material={materials.brass}>
      <cylinderGeometry args={[size, size, 0.06, 6]} />
      {positions.map((position, i) => (
        <Instance key={i} position={position} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </Instances>
  );
}

/** A gauge face: bezel, dial, needle. Reads as instrumentation at a glance. */
export function Gauge({
  materials,
  radius = 0.22,
  angle = -0.6,
  ...props
}: { materials: Materials; radius?: number; angle?: number } & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <mesh material={materials.brass}>
        <cylinderGeometry args={[radius, radius, 0.05, 20]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={materials.paperLight}>
        <cylinderGeometry args={[radius * 0.8, radius * 0.8, 0.02, 20]} />
      </mesh>
      <mesh
        position={[Math.sin(angle) * radius * 0.3, 0.05, Math.cos(angle) * radius * 0.3]}
        rotation={[0, angle, 0]}
        material={materials.ink}
      >
        <boxGeometry args={[0.012, 0.01, radius * 0.66]} />
      </mesh>
    </group>
  );
}

/**
 * The asset: a struck coin with a bevelled rim, milled edge and an engraved
 * diamond raised off each face.
 */
export function AssetCoin({
  materials,
  quality,
  radius = 0.72,
  ...props
}: { materials: Materials; quality: "low" | "high"; radius?: number } & React.ComponentProps<"group">) {
  const d = detail(quality);

  return (
    <group {...props}>
      <mesh material={materials.paperDeep}>
        <cylinderGeometry args={[radius, radius, 0.16, d.radial]} />
        <Ink quality={quality} />
      </mesh>
      {/* Milled edge band */}
      <mesh material={materials.brass}>
        <torusGeometry args={[radius, 0.045, 8, d.ring]} />
      </mesh>
      {/* Raised face plate, both sides */}
      {[0.09, -0.09].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={materials.paperLight}>
          <cylinderGeometry args={[radius * 0.78, radius * 0.78, 0.02, d.radial]} />
        </mesh>
      ))}
      {/* The engraved mark */}
      {[0.12, -0.12].map((y) => (
        <mesh
          key={y}
          position={[0, y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.34, 0.52, 0.16]}
          material={materials.ink}
        >
          <octahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The vault: a pressure housing with a bolted door, a spoked hand-wheel and a
 * gauge. This is where assets sit once they are inside the protocol.
 */
export function Vault({
  materials,
  quality,
  ...props
}: { materials: Materials; quality: "low" | "high" } & React.ComponentProps<"group">) {
  const d = detail(quality);
  const spokes = [0, 1, 2, 3].map((i) => (i / 4) * Math.PI * 2);

  return (
    <group {...props}>
      {/* Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
        <cylinderGeometry args={[1.15, 1.15, 1.5, d.radial]} />
        <Ink quality={quality} />
      </mesh>
      {/* Reinforcing bands */}
      {[-0.5, 0.5].map((z) => (
        <mesh key={z} position={[0, 0, z]} material={materials.metalDark}>
          <torusGeometry args={[1.17, 0.07, 8, d.ring]} />
        </mesh>
      ))}
      {/* Door plate */}
      <mesh position={[0, 0, 0.78]} rotation={[Math.PI / 2, 0, 0]} material={materials.paperDeep}>
        <cylinderGeometry args={[1.0, 1.0, 0.12, d.radial]} />
      </mesh>
      <BoltRing count={12} radius={0.86} z={0.86} materials={materials} />
      {/* Hand-wheel */}
      <mesh position={[0, 0, 0.92]} material={materials.brass}>
        <torusGeometry args={[0.42, 0.055, 8, d.ring]} />
      </mesh>
      {spokes.map((angle) => (
        <mesh
          key={angle}
          position={[0, 0, 0.92]}
          rotation={[0, 0, angle]}
          material={materials.brass}
        >
          <boxGeometry args={[0.84, 0.05, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.95]} material={materials.metalDark}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
      </mesh>
      {/* Instrument on the shoulder */}
      <Gauge materials={materials} position={[0.62, 0.92, 0.1]} rotation={[0.35, 0, -0.25]} />
      {/* Feet */}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, -1.16, 0]} material={materials.metalDark}>
          <boxGeometry args={[0.34, 0.22, 1.2]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The protocol core: a banded orb with meridian rings, inset panels and a
 * mast. Deliberately reads as an instrument rather than a planet.
 */
export function ProtocolCore({
  materials,
  quality,
  radius = 1,
  ...props
}: { materials: Materials; quality: "low" | "high"; radius?: number } & React.ComponentProps<"group">) {
  const d = detail(quality);

  return (
    <group {...props}>
      <mesh material={materials.paperDeep}>
        <sphereGeometry args={[radius, d.sphere, d.sphere]} />
        <Ink quality={quality} />
      </mesh>
      {/* Meridians */}
      {[0, Math.PI / 2].map((rotation) => (
        <mesh key={rotation} rotation={[0, rotation, 0]} material={materials.metal}>
          <torusGeometry args={[radius * 1.005, 0.035, 8, d.ring]} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brass}>
        <torusGeometry args={[radius * 1.01, 0.05, 8, d.ring]} />
      </mesh>
      {/* Equatorial instrument band */}
      <mesh material={materials.metalDark}>
        <cylinderGeometry args={[radius * 0.99, radius * 0.99, radius * 0.26, d.radial, 1, true]} />
      </mesh>
      {/* Inset panels around the band */}
      <Instances limit={8} material={materials.paperLight}>
        <boxGeometry args={[0.24, 0.16, 0.04]} />
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <Instance
              key={i}
              position={[Math.cos(angle) * radius * 1.0, 0, Math.sin(angle) * radius * 1.0]}
              rotation={[0, -angle, 0]}
            />
          );
        })}
      </Instances>
      {/* Mast */}
      <mesh position={[0, radius * 1.22, 0]} material={materials.metal}>
        <cylinderGeometry args={[0.025, 0.035, radius * 0.5, 8]} />
      </mesh>
      <mesh position={[0, radius * 1.46, 0]} material={materials.brass}>
        <sphereGeometry args={[0.07, 12, 12]} />
      </mesh>
    </group>
  );
}

/**
 * A run of pipe between two points, with flanges at each end.
 *
 * `severed` opens a gap in the middle and caps both sides — this is how a
 * blocked withdrawal route reads in the scene. The curve is returned so the
 * caller can animate a pulse along exactly the same path.
 */
export function usePipeCurve(points: [number, number, number][]) {
  return React.useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points],
  );
}

export function PipeRun({
  curve,
  materials,
  quality,
  radius = 0.16,
  severed = false,
  tone = "metal",
}: {
  curve: THREE.CatmullRomCurve3;
  materials: Materials;
  quality: "low" | "high";
  radius?: number;
  severed?: boolean;
  tone?: "metal" | "verified" | "blocked";
}) {
  const d = detail(quality);
  const material =
    tone === "blocked" ? materials.blocked : tone === "verified" ? materials.verified : materials.metal;

  // A severed run is drawn as two shorter tubes with a gap, rather than one
  // tube with a hole — geometry is cheaper than a shader here. The gap is
  // wide because this break is the whole argument of the scene: if a viewer
  // has to look twice to see that the route is cut, it has failed.
  const segments = React.useMemo(() => {
    if (!severed) return [{ start: 0, end: 1 }];
    return [
      { start: 0, end: 0.34 },
      { start: 0.66, end: 1 },
    ];
  }, [severed]);

  const flangeAt = (t: number) => {
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      tangent.clone().normalize(),
    );
    return { position: point.toArray() as [number, number, number], quaternion };
  };

  return (
    <group>
      {segments.map((segment, index) => {
        const sub = new THREE.CatmullRomCurve3(
          Array.from({ length: d.tube + 1 }, (_, i) =>
            curve.getPointAt(segment.start + ((segment.end - segment.start) * i) / d.tube),
          ),
        );
        return (
          <mesh key={index} material={material}>
            <tubeGeometry args={[sub, d.tube, radius, Math.max(6, d.radial / 2), false]} />
          </mesh>
        );
      })}

      {/* End collars. */}
      {[0, 1].map((t) => {
        const { position, quaternion } = flangeAt(t);
        return (
          <mesh key={t} position={position} quaternion={quaternion} material={materials.brass}>
            <cylinderGeometry args={[radius * 1.7, radius * 1.7, 0.08, 12]} />
          </mesh>
        );
      })}

      {/* Torn ends either side of a break: a ragged collar, splayed wider than
          the pipe, so the cut reads as damage rather than as a join. */}
      {severed
        ? [0.34, 0.66].map((t) => {
            const { position, quaternion } = flangeAt(t);
            return (
              <mesh key={t} position={position} quaternion={quaternion} material={material}>
                <coneGeometry args={[radius * 1.9, radius * 1.3, 7, 1, true]} />
              </mesh>
            );
          })
        : null}
    </group>
  );
}

/** Floating fragments. Instanced, and the only thing in a scene with churn. */
export function Fragments({
  count,
  materials,
  spread = 6,
  seed = 1,
}: {
  count: number;
  materials: Materials;
  spread?: number;
  seed?: number;
}) {
  const items = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const k = seed * 1000 + i * 7;
        return {
          position: [
            (noise(k) - 0.5) * spread * 2,
            (noise(k + 1) - 0.5) * spread,
            (noise(k + 2) - 0.5) * spread,
          ] as [number, number, number],
          rotation: [
            noise(k + 3) * Math.PI,
            noise(k + 4) * Math.PI,
            noise(k + 5) * Math.PI,
          ] as [number, number, number],
          scale: 0.05 + noise(k + 6) * 0.1,
        };
      }),
    [count, spread, seed],
  );

  return (
    <Instances limit={count} material={materials.metalMid}>
      <dodecahedronGeometry args={[1, 0]} />
      {items.map((item, i) => (
        <Instance key={i} position={item.position} rotation={item.rotation} scale={item.scale} />
      ))}
    </Instances>
  );
}

/** A soft disc on the ground plane, standing in for a real shadow pass. */
export function BlobShadow({
  materials,
  radius = 2,
  ...props
}: { materials: Materials; radius?: number } & React.ComponentProps<"mesh">) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.shadow} {...props}>
      <circleGeometry args={[radius, 32]} />
    </mesh>
  );
}
