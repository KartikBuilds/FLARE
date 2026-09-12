import Link from "next/link";
import { FlareMark } from "@flare/ui/illustrations";

const columns = [
  {
    heading: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/app", label: "Open App" },
      { href: "/docs/taxonomy", label: "Taxonomy" },
      { href: "/docs/case-studies", label: "Case Studies" },
    ],
  },
  {
    heading: "Documentation",
    links: [
      { href: "/docs/overview", label: "Overview" },
      { href: "/docs/methodology", label: "Methodology" },
      { href: "/docs/risk-methodology", label: "Risk Methodology" },
      { href: "/docs/limitations", label: "Limitations" },
    ],
  },
  {
    heading: "Research",
    links: [
      { href: "/docs/objectives", label: "Research Objectives" },
      { href: "/docs/architecture", label: "Architecture" },
      { href: "/docs/benchmark", label: "Benchmark Plan" },
      { href: "/docs/references", label: "References" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-charcoal-line bg-charcoal text-paper">
      <div className="container-flare py-14 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <FlareMark size={26} />
              <span className="font-display text-lg font-bold tracking-tight">FLARE</span>
            </Link>
            <p className="mt-6 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              TRACE THE EXIT.
            </p>
            <p className="mt-4 font-condensed text-[12px] uppercase tracking-[0.1em] text-paper/70">
              Open protocols. Safer ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.heading}>
                <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.12em] text-paper/65">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-condensed text-[13px] uppercase tracking-[0.06em] text-paper/75 transition-colors hover:text-highlight"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-charcoal-line pt-6 text-[12px] text-paper/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FLARE Research. Findings are advisory, not a guarantee of asset safety.</p>
          <a
            href="https://github.com/KartikBuilds/FLARE"
            target="_blank"
            rel="noreferrer noopener"
            className="font-condensed uppercase tracking-[0.08em] text-paper/60 transition-colors hover:text-highlight"
          >
            Repository ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
