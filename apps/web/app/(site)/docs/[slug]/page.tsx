import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionLabel } from "@flare/ui";
import { getDocSource } from "@/lib/docs";
import { DOCS_NAV } from "@/lib/docs-nav";
import { MdxArticle } from "@/components/docs/MdxArticle";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { DocsPrevNext } from "@/components/docs/DocsPrevNext";
import { DocsShell } from "@/components/docs/DocsShell";

// taxonomy, case-studies and detectors have dedicated data-driven routes
// (app/(site)/docs/taxonomy, /case-studies, /detectors) that take precedence
// over this dynamic route — excluded here to avoid generating an unreachable
// static path for them.
const CUSTOM_ROUTE_SLUGS = new Set(["taxonomy", "case-studies", "detectors"]);

type PageParams = Promise<{ slug: string }>;

export function generateStaticParams() {
  return DOCS_NAV.filter((item) => !CUSTOM_ROUTE_SLUGS.has(item.slug)).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocSource(slug);
  if (!doc) return {};
  return { title: doc.frontmatter.title, description: doc.frontmatter.description };
}

export default async function DocPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const doc = getDocSource(slug);
  if (!doc) notFound();

  const navItem = DOCS_NAV.find((item) => item.slug === slug);

  return (
    <DocsShell>
      <div className="grid gap-10 xl:grid-cols-[1fr_14rem] xl:gap-14">
        <div>
          <SectionLabel
            index={String(DOCS_NAV.findIndex((i) => i.slug === slug) + 1).padStart(2, "0")}
            label="Documentation"
          />
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {navItem?.label ?? doc.frontmatter.title}
          </h1>
          {doc.frontmatter.description && (
            <p className="mt-3 max-w-2xl font-sans text-base text-ink-soft">{doc.frontmatter.description}</p>
          )}

          <div className="mt-10">
            <MdxArticle id="doc-article" content={doc.content} />
          </div>

          <DocsPrevNext slug={slug} />
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents articleId="doc-article" />
          </div>
        </aside>
      </div>
    </DocsShell>
  );
}
