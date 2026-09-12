"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@flare/ui";
import { FlareMark } from "@flare/ui/illustrations";
import { APP_NAV } from "@/lib/app-nav";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-1 py-1 text-paper">
        <FlareMark size={24} />
        <span className="font-display text-base font-bold tracking-tight">FLARE</span>
      </Link>

      <nav aria-label="Application" className="mt-10 flex-1 space-y-1">
        {APP_NAV.map((item) => {
          const isActive = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className="group relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 font-sans text-[13.5px]"
            >
              {isActive && (
                <motion.span
                  layoutId="app-sidebar-active"
                  className="sketch-control absolute inset-0 border border-paper/15 bg-paper/10"
                  transition={{ type: "spring", stiffness: 500, damping: 42 }}
                />
              )}
              <Icon
                aria-hidden="true"
                className={cn("relative z-10 size-4 shrink-0", isActive ? "text-highlight" : "text-paper/50 group-hover:text-paper/80")}
              />
              <span className={cn("relative z-10", isActive ? "text-paper" : "text-paper/60 group-hover:text-paper/85")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-charcoal-line pt-4">
        <p className="font-handwritten text-xl leading-tight text-paper/70">
          open protocols.
          <br />
          safer ecosystems.
        </p>
      </div>
    </div>
  );
}
