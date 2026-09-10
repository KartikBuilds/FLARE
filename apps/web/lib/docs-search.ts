import { getAllDocSources, stripMdxSyntax } from "./docs";
import { getDocNavItem } from "./docs-nav";

export interface DocSearchEntry {
  slug: string;
  title: string;
  description: string;
  text: string;
}

/** Precomputed, serializable search corpus — built server-side, indexed client-side. */
export function buildDocSearchIndex(): DocSearchEntry[] {
  return getAllDocSources().map((doc) => ({
    slug: doc.slug,
    title: doc.frontmatter.title || getDocNavItem(doc.slug)?.label || doc.slug,
    description: doc.frontmatter.description,
    text: stripMdxSyntax(doc.content).slice(0, 4000),
  }));
}
