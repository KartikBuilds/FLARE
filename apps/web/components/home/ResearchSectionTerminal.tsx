import { RESEARCH_PILLARS } from "@/lib/research-pillars";

export function ResearchSectionTerminal() {
  const statusMap: Record<string, string> = {
    Implemented: "terminal-green",
    Partial: "terminal-amber",
    "Optional, explanation-only": "terminal-cyan",
  };

  return (
    <section className="terminal-shell bg-terminal-elevated py-20 md:py-32 border-t border-terminal-line">
      <div className="container-flare max-w-5xl mx-auto">
        <div className="space-y-8">
          {/* Command */}
          <div className="terminal-muted font-mono text-xs uppercase tracking-widest">
            $ open research/index
          </div>

          {/* Title */}
          <h2 className="font-mono text-2xl terminal-white font-bold">
            RESEARCH_FOUNDATIONS
          </h2>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RESEARCH_PILLARS.map((pillar, idx) => {
              const statusColor = statusMap[pillar.status] || "terminal-muted";
              return (
                <div
                  key={idx}
                  className="terminal-panel p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="terminal-white font-mono font-bold text-sm uppercase">
                        {pillar.name}
                      </div>
                      <p className="font-mono text-xs terminal-text mt-1">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-mono text-xs font-bold ${statusColor} uppercase`}
                  >
                    status: {pillar.status}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="terminal-muted font-mono text-xs p-3 border border-terminal-line">
            RESEARCH_PILLARS: {RESEARCH_PILLARS.length}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResearchSectionTerminal;
