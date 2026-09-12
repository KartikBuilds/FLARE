"use client";

import { useSyncExternalStore } from "react";

export type SceneQuality = "off" | "low" | "high";

/**
 * Whether this browser can give us a WebGL context at all.
 *
 * Cached after the first probe: creating throwaway canvases is not free, and
 * the answer cannot change within a page's lifetime.
 */
let webglSupport: boolean | null = null;

export function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

interface ConstrainedNavigator extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/**
 * Classifies how much 3D this device should be asked to do.
 *
 * "off"  — do not start WebGL; render the static illustration instead.
 * "low"  — render the scene, but at reduced pixel ratio and geometry detail.
 * "high" — full detail.
 *
 * Deliberately conservative about what counts as constrained: Save-Data is an
 * explicit request to send less, and 2GB/2-core class hardware will drop
 * frames on anything worth rendering. A four-core laptop is not constrained,
 * so it lands in "low" rather than "off" — it gets the scene, just cheaper.
 */
let cachedQuality: SceneQuality | null = null;

export function detectQuality(): SceneQuality {
  // Memoised because useSyncExternalStore calls getSnapshot on every render and
  // requires a value that does not change between render and commit. Device
  // class does not change within a session; viewport width can, but promoting
  // a scene mid-resize is not worth an unstable snapshot.
  if (cachedQuality !== null) return cachedQuality;
  cachedQuality = computeQuality();
  return cachedQuality;
}

function computeQuality(): SceneQuality {
  if (typeof window === "undefined") return "off";
  if (!supportsWebGL()) return "off";

  const nav = navigator as ConstrainedNavigator;

  if (nav.connection?.saveData) return "off";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return "off";
  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2) {
    return "off";
  }

  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return "low";
  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) {
    return "low";
  }
  if (window.matchMedia("(pointer: coarse)").matches) return "low";
  if (window.innerWidth < 768) return "low";

  return "high";
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function reducedSnapshot() {
  return window.matchMedia(REDUCED_QUERY).matches;
}

function reducedServerSnapshot() {
  return true;
}

/**
 * The quality this render should target, accounting for the motion preference.
 *
 * Reduced motion resolves to "off" — every one of these scenes exists to show
 * movement (an asset travelling a pipe, a figure drifting in zero-g), so a
 * frozen canvas would spend a WebGL context to say less than the static
 * illustration already says. The server snapshot is also "off", so nothing
 * WebGL-shaped is ever in the server-rendered markup.
 */
export function useSceneQuality(): SceneQuality {
  const reduced = useSyncExternalStore(
    subscribeReduced,
    reducedSnapshot,
    reducedServerSnapshot,
  );
  const quality = useSyncExternalStore(
    () => () => {},
    detectQuality,
    () => "off" as SceneQuality,
  );

  return reduced ? "off" : quality;
}
