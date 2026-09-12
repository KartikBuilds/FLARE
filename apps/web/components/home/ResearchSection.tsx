import Link from "next/link";
import { SectionLabel, Badge } from "@flare/ui";
import { BookStack } from "@flare/ui/illustrations";
import { RESEARCH_PILLARS as pillars } from "@/lib/research-pillars";
import { HandNote, Parallax, Reveal, RevealGroup, RevealItem, TextReveal } from "@/components/motion";

export function ResearchSection() {
  return (
    <section className="border-t border-line py-20 md:py-28">
      <div className="container-flare grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <Reveal>
            <SectionLabel index="04" label="Research" />
          </Reveal>
          <TextReveal
            as="h2"
            lines={["Towards a safer", "on-chain future."]}
            className="mt-6 max-w-lg font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md font-sans text-base text-ink-soft">
              A research-driven approach combining static analysis, graph models, targeted formal
              validation and — optionally — AI-assisted reasoning.
            </p>
            <Link
              href="/docs/methodology"
              className="mt-6 inline-flex items-center gap-2 font-condensed text-[13px] font-medium uppercase tracking-[0.08em] text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              Our research →
            </Link>
          </Reveal>

          <RevealGroup as="dl" stagger={0.08} delayChildren={0.12} className="mt-10 grid gap-5 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <RevealItem key={pillar.name} className="border-l-2 border-line pl-4">
                <dt className="flex flex-wrap items-center gap-2 font-condensed text-[12px] font-semibold uppercase tracking-[0.06em]">
                  {pillar.name}
                  <Badge tone={pillar.tone}>{pillar.status}</Badge>
                </dt>
                <dd className="mt-1.5 font-sans text-[13px] leading-snug text-muted">
                  {pillar.description}
                </dd>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div className="flex flex-col items-center gap-6 lg:items-end">
          <Parallax distance={30} className="w-full">
            <BookStack className="h-40 w-full max-w-md text-ink-soft sm:h-52 lg:ml-auto" />
          </Parallax>
          <HandNote className="text-right text-2xl" delay={0.2}>
            research today.
            <br />
            safer protocols tomorrow.
          </HandNote>
        </div>
      </div>
    </section>
  );
}
