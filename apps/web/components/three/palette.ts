/**
 * The material system every FLARE 3D scene draws from.
 *
 * Mirrors the tokens in globals.css so a vault rendered in WebGL and a vault
 * drawn in SVG are the same object in the same light. Nothing here is glossy:
 * these are machined, matte, slightly chalky surfaces — scientific
 * instrumentation rather than crypto chrome.
 *
 * Colour carries meaning in exactly two places, and nowhere else:
 *   blocked  — a withdrawal route that cannot be taken
 *   verified — a route confirmed to reach the holder
 * Both are also labelled in the surrounding HTML, so the scene never asks a
 * viewer to decode a hue.
 */
export const PALETTE = {
  /** Warm off-white — housings, plates, the moon surface. */
  paper: "#f5ebd0",
  paperLight: "#fbf6e7",
  paperDeep: "#e3d2ac",

  /** Machined metal, kept inside the burgundy family so it never reads grey. */
  metal: "#6b3b45",
  metalMid: "#8e4a55",
  metalDark: "#4a0113",

  /** Engraved line work and deep shadow. */
  ink: "#56010f",
  inkSoft: "#7f011f",

  /** Brass detailing on instrument faces. */
  brass: "#b99c63",

  /** The two meaning-bearing accents. */
  blocked: "#a4161a",
  verified: "#4a6741",
} as const;

/** Scene-wide lighting, matched across all three scenes for one house look. */
export const LIGHTING: {
  ambient: number;
  keyPosition: [number, number, number];
  keyIntensity: number;
  rimPosition: [number, number, number];
  rimIntensity: number;
} = {
  ambient: 0.75,
  keyPosition: [4, 6, 5],
  keyIntensity: 1.5,
  rimPosition: [-5, 2, -4],
  rimIntensity: 0.55,
};

/** Outline weight for the ink edge drawn around solid props. */
export const OUTLINE = {
  thickness: 0.012,
  color: PALETTE.ink,
} as const;

/**
 * Deterministic value in [0, 1) from an integer key.
 *
 * A pure function of its argument rather than a seeded generator carrying
 * mutable state: scatter layouts must be identical on every mount (so a
 * screenshot diff means a real change, not a reshuffle), and the React
 * Compiler cannot verify that a closure reassigning its own seed stays inside
 * the render that created it.
 *
 * Scene-only, so the client/server float divergence that round2() guards
 * against elsewhere does not apply — these never render on the server.
 */
export function noise(key: number): number {
  const value = Math.sin(key * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Segment counts per quality tier. Curved geometry is the cheapest thing to
 * over-specify and the first thing worth cutting on constrained hardware.
 */
export function detail(quality: "low" | "high") {
  return quality === "high"
    ? { radial: 28, tube: 14, sphere: 32, ring: 48 }
    : { radial: 14, tube: 8, sphere: 16, ring: 24 };
}
