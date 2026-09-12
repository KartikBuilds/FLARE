"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { FlareMark } from "@flare/ui/illustrations";
import { NavLink, ButtonLink, cn, usePrefersReducedMotion } from "@flare/ui";
import { Magnetic } from "@/components/motion";
import { EASE_PAPER, staggerVariants } from "@/lib/motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { scrollY } = useScroll();

  // Retract on the way down, return on the way up. Setting the same boolean is
  // a no-op in React, so this does not re-render on every scroll frame.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 12);
    if (open || reduced) {
      setHidden(false);
      return;
    }
    setHidden(latest > previous && latest > 180);
  });

  // Close the menu when the route actually changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300",
          scrolled
            ? "border-line bg-paper/92 backdrop-blur"
            : "border-transparent bg-paper/70 backdrop-blur-sm",
        )}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: reduced ? 0.001 : 0.35, ease: EASE_PAPER }}
      >
        <div className="container-flare flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="group flex items-center gap-2.5 text-ink">
            <motion.span
              whileHover={reduced ? undefined : { rotate: -12, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="inline-flex"
            >
              <FlareMark size={26} />
            </motion.span>
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

          <div className="flex items-center gap-3">
            <Magnetic className="hidden sm:inline-block">
              <ButtonLink href="/app" className="text-[12px] md:text-[13px]">
                Open App
              </ButtonLink>
            </Magnetic>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="sketch-control flex items-center gap-2 border-[1.5px] border-ink/35 px-3.5 py-2 font-condensed text-[12px] uppercase tracking-[0.06em] text-ink md:hidden"
            >
              <Menu className="size-4" aria-hidden="true" />
              Menu
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            tabIndex={-1}
            className="bg-grain fixed inset-0 z-50 flex flex-col bg-ink p-6 text-paper outline-none md:hidden"
            initial={{ y: reduced ? 0 : "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: reduced ? 0 : "-100%" }}
            transition={{ duration: reduced ? 0.001 : 0.42, ease: EASE_PAPER }}
          >
            <div className="flex items-center justify-between">
              <span className="font-handwritten text-3xl text-paper">FLARE</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-full p-2 text-paper hover:bg-paper/10"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <motion.nav
              aria-label="Primary"
              className="mt-16 flex flex-col gap-2"
              initial="hidden"
              animate="show"
              variants={staggerVariants(reduced, 0.08, 0.12)}
            >
              {[...links, { href: "/app", label: "Open App" }].map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 22 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: reduced ? 0.001 : 0.45, ease: EASE_PAPER },
                    },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="block border-b border-paper/15 py-4 font-display text-4xl font-bold tracking-tight text-paper"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            <p className="mt-auto font-handwritten text-2xl text-paper/70">
              trace the exit.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
