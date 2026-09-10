"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { usePrefersReducedMotion } from "@flare/ui";
import { DocsSidebar } from "./DocsSidebar";
import type { DocSearchEntry } from "@/lib/docs-search";
import { DocsSearch } from "./DocsSearch";

export function DocsMobileDrawer({ searchIndex }: { searchIndex: DocSearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-[var(--radius-control)] border border-line px-3.5 py-2 font-condensed text-[12px] uppercase tracking-[0.06em]"
      >
        <Menu className="size-4" aria-hidden="true" />
        Sections
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Documentation sections"
              tabIndex={-1}
              initial={{ x: reduced ? 0 : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: reduced ? 0 : "-100%" }}
              transition={{ duration: reduced ? 0.01 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col gap-6 overflow-y-auto bg-paper p-6 shadow-xl outline-none"
            >
              <div className="flex items-center justify-between">
                <p className="font-condensed text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Documentation
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 hover:bg-line-soft"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <DocsSearch index={searchIndex} />
              <DocsSidebar onNavigate={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
