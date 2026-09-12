import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "./fonts";
import { Providers } from "./providers";
import { InkCursor, ScrollProgress } from "@/components/motion";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FLARE — Fund-Lock Assessment & Risk Evaluation",
    template: "%s · FLARE",
  },
  description:
    "FLARE analyzes whether assets entering an EVM smart-contract protocol can reach a legitimate withdrawal, redemption, migration or recovery path — a research platform for the fund-lock vulnerability class.",
  metadataBase: new URL("https://flare.local"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior tells Next about the smooth scrolling set in
    // globals.css, so it can suppress it while restoring scroll on a route
    // change — without it every navigation animates its way back to the top.
    <html lang="en" data-scroll-behavior="smooth" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        {/* Scroll reveals ship their hidden state in the server-rendered markup,
            so without this a client that never runs the reveal JS would be left
            looking at blank sections. Everything marked data-reveal is forced
            to its resting, visible state when scripting is off. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>

        <ScrollProgress />
        <InkCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
