import * as React from "react";
import Link from "next/link";
import { MdxH2, MdxH3, MdxH4 } from "./Heading";

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

export const mdxComponents = {
  h2: MdxH2,
  h3: MdxH3,
  h4: MdxH4,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-5 font-sans text-[15.5px] leading-relaxed text-ink-soft first:mt-0" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-5 list-disc space-y-2 pl-5 font-sans text-[15.5px] leading-relaxed text-ink-soft" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 font-sans text-[15.5px] leading-relaxed text-ink-soft" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="pl-1" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-6 border-l-2 border-ink pl-5 font-display text-xl italic leading-snug text-ink"
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={
        "rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink " +
        // Only inline code (no language-* class from a fenced block) needs
        // to break on long, space-free paths — a fenced block already
        // scrolls horizontally via the <pre> wrapper below and should keep
        // its lines intact.
        (className ? className : "break-words")
      }
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      // tabIndex + role make this reachable and operable by keyboard when
      // it's actually scrollable (narrow viewport, long code) — an
      // overflow-x-auto region with no focusable content is otherwise
      // unreachable by keyboard-only users (WCAG 2.1.1).
      tabIndex={0}
      role="region"
      aria-label="Code sample"
      className="mt-5 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-charcoal p-4 font-mono text-[13px] leading-relaxed text-paper focus-visible:outline-2 focus-visible:outline-offset-2 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-paper"
      {...props}
    />
  ),
  a: ({ href = "", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    isExternal(href) ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
        {...props}
      />
    ) : (
      <Link
        href={href}
        className="text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
        {...props}
      />
    ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-ink" {...props} />,
  hr: () => <hr className="mt-10 border-line" />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div
      // Same keyboard-reachability fix as the <pre> renderer above — a
      // wide table on a narrow viewport is otherwise an unreachable
      // scrollable region for keyboard-only users (WCAG 2.1.1).
      tabIndex={0}
      role="region"
      aria-label="Table"
      className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <table className="w-full border-collapse text-left font-sans text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-line bg-paper-flat font-condensed text-[11px] uppercase tracking-[0.06em] text-muted" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className="px-4 py-2.5 font-semibold" {...props} />,
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-t border-line px-4 py-2.5 align-top text-ink-soft" {...props} />
  ),
};
