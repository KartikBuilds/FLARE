import localFont from "next/font/local";

/**
 * All font binaries are vendored in ./files (fetched once from each family's
 * open-license (SIL OFL) source and committed to the repo — see
 * ./licenses and docs/FREE_RESOURCES.md). next/font/local self-hosts them
 * from this app's own origin; nothing is fetched from a font CDN at build
 * or run time.
 */

export const fontDisplay = localFont({
  src: [
    { path: "./files/LibreBaskerville[wght].ttf", weight: "400 700", style: "normal" },
    { path: "./files/LibreBaskerville-Italic[wght].ttf", weight: "400 700", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const fontSans = localFont({
  src: [{ path: "./files/IBMPlexSans[wdth,wght].ttf", weight: "100 700", style: "normal" }],
  variable: "--font-sans",
  display: "swap",
});

export const fontCondensed = localFont({
  src: [
    { path: "./files/IBMPlexSansCondensed-Regular.ttf", weight: "400", style: "normal" },
    { path: "./files/IBMPlexSansCondensed-Medium.ttf", weight: "500", style: "normal" },
    { path: "./files/IBMPlexSansCondensed-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-condensed",
  display: "swap",
});

export const fontHandwritten = localFont({
  src: [{ path: "./files/Caveat[wght].ttf", weight: "400 700", style: "normal" }],
  variable: "--font-handwritten",
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontSans.variable,
  fontCondensed.variable,
  fontHandwritten.variable,
].join(" ");
