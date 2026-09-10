import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Annotation } from "@flare/ui";
import { OrbitDiagram } from "@flare/ui/illustrations";
import { getDocSource } from "@/lib/docs";
import { MdxArticle } from "@/components/docs/MdxArticle";
import { DocsShell } from "@/components/docs/DocsShell";
import { DocsHero } from "@/components/docs/DocsHero";
import { DocsPrevNext } from "@/components/docs/DocsPrevNext";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Research, taxonomy, methodology and real-world case studies for FLARE.",
};

export default function DocsIndexPage() {
  const doc = getDocSource("overview")!;

  return (
    <>
      <DocsHero />
      <DocsShell>
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Overview</h2>
          <p className="mt-2 max-w-2xl font-sans text-base text-ink-soft">{doc.frontmatter.description}</p>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem] lg:items-start">
            <OrbitDiagram className="h-52 w-full text-ink-soft" />
            <ul className="space-y-1.5 self-center font-handwritten text-2xl text-ink-soft">
              {["Assets", "Protocols", "States", "Dependencies", "Exits", "Recovery"].map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <MdxArticle id="doc-article" content={doc.content} />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-[var(--radius-card)] border border-line bg-paper-flat p-6">
            <Annotation className="max-w-xs text-2xl">Same mistakes shouldn&apos;t repeat.</Annotation>
            <ButtonLink href="/docs/methodology">Read full documentation</ButtonLink>
          </div>

          <DocsPrevNext slug="overview" />

          <p className="mt-6 font-sans text-xs text-muted">
            This overview is also available at{" "}
            <Link href="/docs/overview" className="underline decoration-line underline-offset-2 hover:decoration-ink">
              /docs/overview
            </Link>{" "}
            without the hero, for direct linking.
          </p>
        </div>
      </DocsShell>
    </>
  );
}
