import type { ReactNode } from "react";
import Link from "next/link";
import { FlareMark } from "@flare/ui/illustrations";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppMobileDrawer } from "@/components/app/AppMobileDrawer";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="shell-dark hidden w-64 shrink-0 bg-charcoal p-6 lg:block">
        <div className="sticky top-6">
          <AppSidebar />
        </div>
      </aside>

      <div className="shell-dark flex items-center justify-between border-b border-charcoal-line bg-charcoal px-5 py-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2 text-paper">
          <FlareMark size={22} />
          <span className="font-display text-base font-bold tracking-tight">FLARE</span>
        </Link>
        <AppMobileDrawer />
      </div>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
