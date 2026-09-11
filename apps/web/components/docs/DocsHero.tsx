import { BookStack } from "@flare/ui/illustrations";

// This hero's own stack of sections, not the research pillars used
// elsewhere — reads RESEARCH / TAXONOMY / CASE STUDIES / METHODOLOGY,
// matching what /docs actually contains rather than reusing the home
// page's research-pillar labels on a differently-themed shelf.
const DOCS_BOOKS = [
  { label: "METHODOLOGY", rot: 1 },
  { label: "CASE STUDIES", rot: -0.6 },
  { label: "TAXONOMY", rot: 0.8 },
  { label: "RESEARCH", rot: -1.2 },
];

export function DocsHero() {
  return (
    <section className="border-b border-line py-16 md:py-24">
      <div className="container-flare grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-condensed text-[12px] uppercase tracking-[0.14em] text-muted">/ Docs</p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl md:text-7xl">
            Knowledge for a safer ecosystem.
          </h1>
          <p className="mt-5 max-w-md font-sans text-base text-ink-soft">
            Research, taxonomy, methodology and real-world case studies — all in one place.
          </p>
        </div>
        <BookStack books={DOCS_BOOKS} className="h-56 w-full text-ink-soft sm:h-72 lg:h-80" />
      </div>
    </section>
  );
}
