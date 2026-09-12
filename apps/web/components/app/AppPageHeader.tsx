import type { ReactNode } from "react";
import { HandNote, Reveal, TextReveal } from "@/components/motion";

interface AppPageHeaderProps {
  /** Rendered as the h1. Pass several entries to control where it breaks. */
  title: string | string[];
  lead: ReactNode;
  /** Handwritten margin note, sat beside the title. */
  note?: string;
  /** Badges or controls pinned to the right of the header. */
  action?: ReactNode;
}

/**
 * The masthead every application route opens with.
 *
 * Kept in one place so all nine app routes share the same rhythm: title,
 * one-line lead, an optional note in the margin, and a rule underneath.
 */
export function AppPageHeader({ title, lead, note, action }: AppPageHeaderProps) {
  const lines = Array.isArray(title) ? title : [title];

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <TextReveal
            as="h1"
            lines={lines}
            immediate
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          />
          <Reveal delay={0.08}>
            <p className="mt-1.5 max-w-2xl font-sans text-sm text-muted">{lead}</p>
          </Reveal>
        </div>

        {/* min-w-0, not shrink-0: a long status badge ("Demo / Fixture Data —
            Analyzer Not Configured") cannot fit beside the title at 320px, and
            a non-shrinking column pushes the page into horizontal scroll.
            Below sm the column drops under the title and aligns left. */}
        <div className="flex min-w-0 flex-col items-start gap-2 sm:items-end">
          {action}
          {note ? (
            <HandNote className="text-xl sm:text-right" delay={0.18}>
              {note}
            </HandNote>
          ) : null}
        </div>
      </div>
    </header>
  );
}
