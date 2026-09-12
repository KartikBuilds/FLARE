"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "../lib/cn";

type Variant = "solid" | "outline" | "ghost";
type Tone = "ink" | "paper";
type ArrowStyle = "right" | "up-right" | "none";

interface SharedProps {
  variant?: Variant;
  tone?: Tone;
  arrow?: ArrowStyle;
  className?: string;
  children: React.ReactNode;
}

/* `sketch-control` gives the button the uneven elliptical corners of a box
   drawn by hand; `active:translate-y-px` gives it the small give of a pen
   pressing into paper. */
const base =
  "sketch-control group inline-flex items-center justify-center gap-2 " +
  "px-5 py-3 font-condensed text-[13px] font-medium uppercase tracking-[0.08em] " +
  "transition-[background-color,border-color,color,transform] duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px " +
  "disabled:pointer-events-none disabled:opacity-40 motion-reduce:active:translate-y-0";

const variants: Record<Variant, Record<Tone, string>> = {
  solid: {
    ink: "bg-ink text-paper hover:bg-ink-deep",
    paper: "bg-paper text-ink hover:bg-paper-dim",
  },
  outline: {
    ink: "border-[1.5px] border-ink/35 text-ink hover:border-ink hover:bg-ink/5 bg-transparent",
    paper: "border-[1.5px] border-paper/40 text-paper hover:border-paper hover:bg-paper/10 bg-transparent",
  },
  ghost: {
    ink: "text-ink hover:bg-ink/5",
    paper: "text-paper hover:bg-paper/10",
  },
};

function ArrowIcon({ style }: { style: ArrowStyle }) {
  if (style === "none") return null;
  const Icon = style === "up-right" ? ArrowUpRight : ArrowRight;
  return (
    <Icon
      aria-hidden="true"
      className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0 motion-reduce:group-hover:translate-x-0"
      strokeWidth={2}
    />
  );
}

interface ButtonProps
  extends SharedProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", tone = "ink", arrow = "right", className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(base, variants[variant][tone], className)} {...props}>
      <span>{children}</span>
      <ArrowIcon style={arrow} />
    </button>
  );
});

interface ButtonLinkProps extends SharedProps {
  href: string;
  external?: boolean;
}

export function ButtonLink({
  href,
  external,
  variant = "solid",
  tone = "ink",
  arrow = "right",
  className,
  children,
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant][tone], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
        <span>{children}</span>
        <ArrowIcon style={arrow === "right" ? "up-right" : arrow} />
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      <span>{children}</span>
      <ArrowIcon style={arrow} />
    </Link>
  );
}
