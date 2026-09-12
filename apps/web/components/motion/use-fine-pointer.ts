"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: fine)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  // The server cannot know the input device. Assume coarse so that nothing
  // pointer-only is ever rendered into the SSR markup; the first client read
  // corrects it before paint.
  return false;
}

/**
 * True when the visitor is driving a precise pointer (mouse, trackpad, stylus)
 * rather than a finger.
 *
 * Gate every pointer-only flourish — magnetic pull, card tilt, the ink
 * cursor — on this. useSyncExternalStore rather than an effect: matchMedia is
 * an external store, and subscribing to it this way keeps the value correct
 * on the very first client render instead of after a second pass.
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
