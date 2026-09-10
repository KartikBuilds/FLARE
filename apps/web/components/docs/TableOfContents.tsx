"use client";

import { useEffect, useState } from "react";
import { cn } from "@flare/ui";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Builds its own TOC from the rendered article's h2/h3 elements — no need
 * to thread heading data through the MDX compile step separately. */
export function TableOfContents({ articleId }: { articleId: string }) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;
    const headings = Array.from(article.querySelectorAll("h2[id], h3[id]"));

    // Reading the rendered article's headings is a read from an external
    // system (the DOM), not state derived from props — but it can only
    // happen after paint, so the resulting setEntries is deferred to the
    // next frame rather than called synchronously inside the effect body.
    const frame = requestAnimationFrame(() => {
      setEntries(
        headings.map((h) => ({
          id: h.id,
          text: h.textContent?.replace(/#$/, "").trim() ?? "",
          level: h.tagName === "H2" ? 2 : 3,
        })),
      );
    });

    const observer = new IntersectionObserver(
      (obs) => {
        const visible = obs.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [articleId]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">On this page</p>
      <ul className="mt-3 space-y-2 border-l border-line">
        {entries.map((entry) => (
          <li key={entry.id} style={{ paddingLeft: entry.level === 3 ? "1.75rem" : "1rem" }}>
            <a
              href={`#${entry.id}`}
              className={cn(
                "-ml-px block border-l pl-3 py-0.5 transition-colors",
                activeId === entry.id ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
