import { describe, expect, it } from "vitest";
import { getAllDocSources, getDocSource } from "@/lib/docs";
import { DOCS_NAV, getAdjacentDocs } from "@/lib/docs-nav";
import { buildDocSearchIndex } from "@/lib/docs-search";
import { DETECTOR_REGISTRY } from "@flare/rules";

describe("docs content", () => {
  it("has a source file for every item in DOCS_NAV, with a title and description", () => {
    const sources = getAllDocSources();
    expect(sources.length).toBe(DOCS_NAV.length);
    for (const source of sources) {
      expect(source.frontmatter.title).toBeTruthy();
      expect(source.frontmatter.description).toBeTruthy();
      expect(source.content.trim().length).toBeGreaterThan(100);
    }
  });

  it("returns undefined for an unknown slug rather than throwing", () => {
    expect(getDocSource("does-not-exist")).toBeUndefined();
  });
});

describe("getAdjacentDocs", () => {
  it("has no previous doc for the first nav item and no next doc for the last", () => {
    const first = DOCS_NAV[0]!;
    const last = DOCS_NAV[DOCS_NAV.length - 1]!;
    expect(getAdjacentDocs(first.slug).prev).toBeUndefined();
    expect(getAdjacentDocs(last.slug).next).toBeUndefined();
  });

  it("returns the correct neighbors for a middle item", () => {
    const { prev, next } = getAdjacentDocs("methodology");
    expect(prev?.slug).toBe("objectives");
    expect(next?.slug).toBe("case-studies");
  });
});

describe("buildDocSearchIndex", () => {
  it("produces one searchable entry per doc with non-empty text", () => {
    const index = buildDocSearchIndex();
    expect(index.length).toBe(DOCS_NAV.length);
    for (const entry of index) {
      expect(entry.text.length).toBeGreaterThan(0);
    }
  });
});

describe("detector registry spec", () => {
  it("has exactly two detectors per taxonomy category, ten total", () => {
    expect(DETECTOR_REGISTRY.length).toBe(10);
    const counts = new Map<string, number>();
    for (const d of DETECTOR_REGISTRY) counts.set(d.taxonomy, (counts.get(d.taxonomy) ?? 0) + 1);
    for (const count of counts.values()) expect(count).toBe(2);
  });

  it("has unique detector ids", () => {
    const ids = DETECTOR_REGISTRY.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
