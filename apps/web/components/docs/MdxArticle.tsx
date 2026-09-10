import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "./mdx-components";

// Heading ids come from rehype-slug; the link-wrap + copy-link button is
// handled by our own h2/h3/h4 components (Heading.tsx) instead of
// rehype-autolink-headings, which would otherwise nest a second <a> inside
// the one our component already renders.
export function MdxArticle({ id, content }: { id: string; content: string }) {
  return (
    <article id={id}>
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </article>
  );
}
