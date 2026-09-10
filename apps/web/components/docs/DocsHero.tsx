import { BookStack } from "@flare/ui/illustrations";

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
        <BookStack className="h-44 w-full text-ink-soft sm:h-56" />
      </div>
    </section>
  );
}
