import { PIPELINE_STAGES } from "@/lib/pipeline";

export function PipelineSectionTerminal() {
  return (
    <section className="terminal-shell bg-terminal-elevated py-20 md:py-32 border-t border-terminal-line">
      <div className="container-flare max-w-5xl mx-auto">
        <div className="space-y-8">
          {/* Command */}
          <div className="terminal-muted font-mono text-xs uppercase tracking-widest">
            $ flare inspect --pipeline
          </div>

          {/* Title */}
          <h2 className="font-mono text-2xl terminal-white font-bold">
            THE_ANALYSIS_PIPELINE
          </h2>

          {/* Pipeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PIPELINE_STAGES.map((step) => (
              <div
                key={step.id}
                className="terminal-panel p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="terminal-green font-bold font-mono">
                    [{step.index}]
                  </span>
                  <span className="terminal-white font-mono font-bold uppercase text-sm">
                    {step.title}
                  </span>
                </div>
                <p className="font-mono text-xs terminal-text leading-relaxed">
                  {step.summary}
                </p>
                <div className="pt-2 border-t border-terminal-line">
                  <div className="terminal-muted font-mono text-xs">
                    STATUS: <span className="terminal-green">ACTIVE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Process Flow */}
          <div className="p-4 terminal-panel font-mono text-xs terminal-green overflow-x-auto">
            <pre className="whitespace-pre">
{`INTAKE → UNDERSTANDING → ASSET_DISCOVERY
   ↓           ↓              ↓
STATE_MODEL → DEPENDENCIES → EXIT_RECOVERY
   ↓           ↓              ↓
DETECTORS → VALIDATION → RISK_CALCULATION`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PipelineSectionTerminal;
