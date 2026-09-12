import type { ReactNode } from "react";
import Link from "next/link";
import { FlareMark } from "@flare/ui/illustrations";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppMobileDrawer } from "@/components/app/AppMobileDrawer";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="terminal-shell min-h-screen bg-terminal-bg lg:flex">
      <aside className="hidden w-64 shrink-0 bg-terminal-panel p-6 lg:block border-r border-terminal-line">
        <div className="sticky top-6">
          <AppSidebar />
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-terminal-line bg-terminal-panel px-5 py-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2 terminal-white">
          <FlareMark size={22} />
          <span className="font-mono text-base font-bold tracking-tight">FLARE</span>
        </Link>
        <AppMobileDrawer />
      </div>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
