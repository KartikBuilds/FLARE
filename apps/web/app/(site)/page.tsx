import type { Metadata } from "next";
import { ButtonLink, SectionLabel } from "@flare/ui";

export const metadata: Metadata = {
  title: "FLARE — Can the assets get back out?",
};

export default function HomePage() {
  return (
    <div className="bg-grain">
      <section className="container-flare relative z-10 pt-16 pb-24 md:pt-24 md:pb-32">
        <SectionLabel index="FLARE" label="Fund-Lock Assessment & Risk Evaluation" />
        <h1 className="mt-6 max-w-4xl font-display text-6xl font-bold leading-[0.95] tracking-tight text-balance sm:text-7xl md:text-8xl">
          Can the assets get back out?
        </h1>
        <p className="mt-6 max-w-xl font-sans text-lg text-ink-soft">
          FLARE traces the states, dependencies, withdrawal paths and recovery mechanisms that can
          leave protocol assets permanently inaccessible.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <ButtonLink href="/app">Open App</ButtonLink>
          <ButtonLink href="/docs" variant="outline" arrow="up-right">
            Read the research
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
