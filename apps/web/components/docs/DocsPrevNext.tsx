import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAdjacentDocs } from "@/lib/docs-nav";

export function DocsPrevNext({ slug }: { slug: string }) {
  const { prev, next } = getAdjacentDocs(slug);
  if (!prev && !next) return null;

  return (
    <div className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex flex-col rounded-[var(--radius-card)] border border-line p-4 transition-colors hover:border-ink"
        >
          <span className="flex items-center gap-1.5 font-condensed text-[11px] uppercase tracking-[0.08em] text-muted">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Previous
          </span>
          <span className="mt-1 font-sans text-sm font-medium text-ink">{prev.label}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex flex-col items-end rounded-[var(--radius-card)] border border-line p-4 text-right transition-colors hover:border-ink"
        >
          <span className="flex items-center gap-1.5 font-condensed text-[11px] uppercase tracking-[0.08em] text-muted">
            Next
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="mt-1 font-sans text-sm font-medium text-ink">{next.label}</span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
