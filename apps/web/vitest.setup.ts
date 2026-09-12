import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

/**
 * jsdom ships no matchMedia, but every motion primitive reads one (reduced
 * motion, pointer precision) before deciding whether to animate. Without a
 * stub those components throw on render rather than failing a useful
 * assertion.
 *
 * Queries default to not matching — a coarse pointer with motion allowed —
 * and a test opts into the state it cares about via setMediaQuery().
 */
const matches = new Map<string, boolean>();

export function setMediaQuery(query: string, value: boolean): void {
  matches.set(query, value);
}

beforeEach(() => {
  matches.clear();
});

/**
 * jsdom implements neither observer. Motion's scroll reveals construct an
 * IntersectionObserver on mount, and React Flow a ResizeObserver, so without
 * these the component throws before any assertion runs.
 *
 * Both are inert: they never report an intersection or a resize. That is the
 * state worth testing — it proves the markup is present and readable *before*
 * any animation has fired, which is exactly what a crawler or a client with
 * slow hydration sees.
 */
class InertObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

window.IntersectionObserver = InertObserver as unknown as typeof window.IntersectionObserver;
window.ResizeObserver = InertObserver as unknown as typeof window.ResizeObserver;

window.matchMedia = ((query: string) => ({
  media: query,
  get matches() {
    return matches.get(query) ?? false;
  },
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
