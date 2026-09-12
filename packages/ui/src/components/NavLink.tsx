"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "../lib/cn";

interface NavLinkProps {
  href: string;
  active?: boolean;
  tone?: "ink" | "paper";
  className?: string;
  children: React.ReactNode;
  underlineId?: string;
}

/**
 * Nav link with an animated underline: the active link carries a shared
 * `layoutId` motion element that glides between links as the active route
 * changes; inactive links get a lightweight CSS hover underline instead so
 * hover doesn't fight the shared-layout animation.
 */
export function NavLink({
  href,
  active = false,
  tone = "ink",
  className,
  children,
  underlineId = "site-nav-underline",
}: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center py-1 font-condensed text-[13px] font-medium uppercase tracking-[0.08em]",
        tone === "ink" ? "text-ink" : "text-paper",
        active ? "" : "opacity-70 hover:opacity-100",
        className,
      )}
    >
      {children}
      {active ? (
        <motion.span
          layoutId={underlineId}
          className={cn("absolute -bottom-0.5 left-0 right-0 h-[2px]", tone === "ink" ? "bg-ink" : "bg-paper")}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-0.5 left-0 right-0 h-[2px] origin-left scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100",
            tone === "ink" ? "bg-ink/40" : "bg-paper/40",
          )}
        />
      )}
    </Link>
  );
}
