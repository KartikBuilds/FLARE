import type { ReactNode } from "react";
import { ReadingProgress } from "@/components/docs/ReadingProgress";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper">
      <ReadingProgress />
      {children}
    </div>
  );
}
