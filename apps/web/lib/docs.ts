import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { DOCS_NAV } from "./docs-nav";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export interface DocFrontmatter {
  title: string;
  description: string;
}

export interface DocSource {
  slug: string;
  frontmatter: DocFrontmatter;
  content: string;
}

let sourceCache: Map<string, DocSource> | null = null;

function loadAll(): Map<string, DocSource> {
  if (sourceCache) return sourceCache;
  const map = new Map<string, DocSource>();
  for (const item of DOCS_NAV) {
    const filePath = path.join(CONTENT_DIR, `${item.slug}.mdx`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    map.set(item.slug, {
      slug: item.slug,
      frontmatter: { title: data.title ?? item.label, description: data.description ?? "" },
      content,
    });
  }
  sourceCache = map;
  return map;
}

export function getDocSource(slug: string): DocSource | undefined {
  return loadAll().get(slug);
}

export function getAllDocSources(): DocSource[] {
  return DOCS_NAV.map((item) => loadAll().get(item.slug)!).filter(Boolean);
}

/** Strips common MDX/Markdown syntax down to plain, searchable prose. */
export function stripMdxSyntax(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
