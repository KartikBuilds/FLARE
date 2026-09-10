"use client";

import { useEffect, useState } from "react";

export const REDUCED_MOTION_OVERRIDE_KEY = "flare:reduced-motion-override";
export const REDUCED_MOTION_OVERRIDE_EVENT = "flare:reduced-motion-override-change";

function readOverride(): boolean {
  try {
    return window.localStorage.getItem(REDUCED_MOTION_OVERRIDE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Tracks whether motion should be reduced: the OS `prefers-reduced-motion`
 * setting, reactively, OR the app's own Settings > "Reduce motion" override
 * (stored in localStorage, since some users want less motion without
 * changing a system-wide OS setting). Every scroll-driven, looping, or
 * parallax animation in FLARE must branch on this before starting — the
 * global CSS rule in globals.css is a backstop, not a substitute, since it
 * cannot cancel GSAP timelines or Motion `animate()` calls already in
 * flight.
 */
export function usePrefersReducedMotion(): boolean {
  const [systemReduced, setSystemReduced] = useState(false);
  const [override, setOverride] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setSystemReduced(event.matches);
    query.addEventListener("change", listener);

    setOverride(readOverride());
    const onOverrideChange = () => setOverride(readOverride());
    window.addEventListener(REDUCED_MOTION_OVERRIDE_EVENT, onOverrideChange);
    window.addEventListener("storage", onOverrideChange);

    return () => {
      query.removeEventListener("change", listener);
      window.removeEventListener(REDUCED_MOTION_OVERRIDE_EVENT, onOverrideChange);
      window.removeEventListener("storage", onOverrideChange);
    };
  }, []);

  return systemReduced || override;
}

export function setReducedMotionOverride(value: boolean): void {
  try {
    window.localStorage.setItem(REDUCED_MOTION_OVERRIDE_KEY, String(value));
    window.dispatchEvent(new Event(REDUCED_MOTION_OVERRIDE_EVENT));
  } catch {
    // localStorage can be unavailable (private browsing); the OS setting still applies.
  }
}
