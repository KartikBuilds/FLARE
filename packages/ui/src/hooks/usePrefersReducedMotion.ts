"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` OS setting reactively (it can
 * change at runtime). Every scroll-driven, looping, or parallax animation in
 * FLARE must branch on this before starting — the global CSS rule in
 * globals.css is a backstop, not a substitute, since it cannot cancel GSAP
 * timelines or Motion `animate()` calls already in flight.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}
