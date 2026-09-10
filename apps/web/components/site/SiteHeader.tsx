"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FlareMark } from "@flare/ui/illustrations";
import { NavLink, ButtonLink } from "@flare/ui";

const links = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-flare flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <FlareMark size={26} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">FLARE</span>
            <span className="hidden font-condensed text-[9px] font-medium uppercase tracking-[0.14em] text-muted sm:block">
              Fund-Lock Assessment &amp; Risk Evaluation
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} active={pathname === link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <ButtonLink href="/app" className="text-[12px] md:text-[13px]">
          Open App
        </ButtonLink>
      </div>
    </header>
  );
}
