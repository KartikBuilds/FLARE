"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@flare/ui";
import { DOCS_NAV } from "@/lib/docs-nav";

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="space-y-1">
      {DOCS_NAV.map((item) => {
        const href = `/docs/${item.slug}`;
        const isActive = pathname === href || (pathname === "/docs" && item.slug === "overview");
        const Icon = item.icon;
        return (
          <Link
            key={item.slug}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className="group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 font-sans text-[13.5px]"
          >
            {isActive && (
              <motion.span
                layoutId="docs-sidebar-active"
                className="absolute inset-0 rounded-[var(--radius-control)] bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 42 }}
              />
            )}
            <Icon
              aria-hidden="true"
              className={cn(
                "relative z-10 size-4 shrink-0",
                isActive ? "text-paper" : "text-muted group-hover:text-ink",
              )}
            />
            <span className={cn("relative z-10", isActive ? "text-paper" : "text-ink-soft group-hover:text-ink")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
