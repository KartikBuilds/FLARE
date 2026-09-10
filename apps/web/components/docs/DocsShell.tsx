import type { ReactNode } from "react";
import { DocsSidebar } from "./DocsSidebar";
import { DocsSearch } from "./DocsSearch";
import { DocsMobileDrawer } from "./DocsMobileDrawer";
import { buildDocSearchIndex } from "@/lib/docs-search";

/** The persistent search + sidebar + content grid shared by every /docs page. */
export function DocsShell({ children }: { children: ReactNode }) {
  const searchIndex = buildDocSearchIndex();

  return (
    <>
      <div className="border-b border-line py-4 lg:hidden">
        <div className="container-flare">
          <DocsMobileDrawer searchIndex={searchIndex} />
        </div>
      </div>

      <div className="container-flare py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <DocsSearch index={searchIndex} />
              <DocsSidebar />
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </>
  );
}
