import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "./fonts";
import { Providers } from "./providers";
import "./globals.css";
import "./terminal-theme.css";

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
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
