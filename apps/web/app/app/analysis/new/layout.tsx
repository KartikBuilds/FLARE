import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "New Analysis",
};

export default function NewAnalysisLayout({ children }: { children: ReactNode }) {
  return children;
}
