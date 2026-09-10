"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { Search } from "lucide-react";
import { cn } from "@flare/ui";
import type { DocSearchEntry } from "@/lib/docs-search";

interface Result {
  slug: string;
  title: string;
  description: string;
}

export function DocsSearch({ index, className }: { index: DocSearchEntry[]; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const mini = useMemo(() => {
    const m = new MiniSearch<DocSearchEntry>({
      idField: "slug",
      fields: ["title", "description", "text"],
      storeFields: ["title", "description"],
      searchOptions: { boost: { title: 3, description: 2 }, prefix: true, fuzzy: 0.2 },
    });
    m.addAll(index);
    return m;
  }, [index]);

  const results: Result[] = useMemo(() => {
    if (query.trim().length < 2) return [];
    return mini.search(query).slice(0, 6).map((r) => ({
      slug: String(r.id),
      title: r.title as string,
      description: r.description as string,
    }));
  }, [mini, query]);

  function go(slug: string) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(`/docs/${slug}`);
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-paper-flat px-3.5 py-2.5">
        <Search aria-hidden="true" className="size-4 text-muted" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="docs-search-listbox"
          aria-autocomplete="list"
          value={query}
          placeholder="Search documentation…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={(e) => {
            if (!results.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(results[activeIndex]!.slug);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id="docs-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-lg"
        >
          {results.map((result, i) => (
            <li key={result.slug} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(result.slug)}
                className={cn(
                  "block w-full px-4 py-2.5 text-left transition-colors",
                  i === activeIndex ? "bg-ink text-paper" : "hover:bg-line-soft",
                )}
              >
                <p className="font-condensed text-[12px] font-semibold uppercase tracking-[0.05em]">{result.title}</p>
                {result.description && (
                  <p className={cn("mt-0.5 truncate text-xs", i === activeIndex ? "text-paper/70" : "text-muted")}>
                    {result.description}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
