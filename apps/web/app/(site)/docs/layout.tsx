import type { ReactNode } from "react";

/* The reading-progress bar that used to live here is now <ScrollProgress> in
   the root layout, which draws the same indicator on every route. */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return <div className="bg-paper">{children}</div>;
}
