"use client";

import * as React from "react";
import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { cn } from "@flare/ui";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  id?: string;
}

function makeHeading(Tag: "h2" | "h3" | "h4", sizeClass: string) {
  const Heading = ({ id, className, children, ...props }: HeadingProps) => {
    const [copied, setCopied] = useState(false);

    async function copyLink() {
      if (!id) return;
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // Clipboard access can be denied by the browser; the anchor href still works.
      }
    }

    return (
      <Tag id={id} className={cn("group scroll-mt-28 font-display font-bold tracking-tight", sizeClass, className)} {...props}>
        <a href={id ? `#${id}` : undefined} className="no-underline">
          {children}
        </a>
        {id && (
          <button
            type="button"
            onClick={copyLink}
            aria-label={copied ? "Link copied" : "Copy link to this section"}
            className="ml-2 inline-flex align-middle opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          >
            {copied ? (
              <Check className="size-4 text-success" aria-hidden="true" />
            ) : (
              <LinkIcon className="size-4 text-muted hover:text-ink" aria-hidden="true" />
            )}
          </button>
        )}
      </Tag>
    );
  };
  Heading.displayName = `MdxHeading${Tag.toUpperCase()}`;
  return Heading;
}

export const MdxH2 = makeHeading("h2", "mt-14 text-3xl sm:text-4xl");
export const MdxH3 = makeHeading("h3", "mt-10 text-2xl sm:text-3xl");
export const MdxH4 = makeHeading("h4", "mt-8 text-xl");
