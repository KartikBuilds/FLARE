import { getIncidents } from "@/lib/incidents";
import { type Incident } from "@flare/schemas";

export function CaseStudiesSectionTerminal() {
  const incidents = getIncidents();

  const verificationStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return "terminal-green";
      case "disputed":
        return "terminal-amber";
      default:
        return "terminal-cyan";
    }
  };

  const totalUsd = incidents.reduce(
    (sum: number, i: Incident) => sum + (i.amount.valueUsd ?? 0),
    0
  );

  return (
    <section className="terminal-shell bg-terminal-bg py-20 md:py-32 border-t border-terminal-line">
      <div className="container-flare max-w-5xl mx-auto">
        <div className="space-y-8">
          {/* Command */}
          <div className="terminal-muted font-mono text-xs uppercase tracking-widest">
            $ flare incidents --all
          </div>

          {/* Title */}
          <h2 className="font-mono text-2xl terminal-white font-bold">
            INCIDENT_LEDGER
          </h2>

          {/* Incidents Table */}
          <div className="terminal-panel p-4">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="terminal-box-bottom">
                  <th className="text-left py-2 terminal-white">INCIDENT</th>
                  <th className="text-left py-2 terminal-white">YEAR</th>
                  <th className="text-left py-2 terminal-white">CHAIN</th>
                  <th className="text-right py-2 terminal-white">USD_VALUE</th>
                  <th className="text-left py-2 terminal-white">TAXONOMY</th>
                  <th className="text-left py-2 terminal-white">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident: Incident, idx: number) => (
                  <tr
                    key={incident.id}
                    className={
                      idx < incidents.length - 1 ? "terminal-box-bottom" : ""
                    }
                  >
                    <td className="py-2 terminal-text">{incident.name}</td>
                    <td className="terminal-muted">{incident.year}</td>
                    <td className="terminal-muted">{incident.ecosystem}</td>
                    <td className="text-right terminal-red font-bold">
                      ${((incident.amount.valueUsd ?? 0) / 1e6).toFixed(1)}M
                    </td>
                    <td className="terminal-amber uppercase text-xs">
                      {incident.taxonomy?.[0] || "---"}
                    </td>
                    <td>
                      <span
                        className={`font-bold uppercase text-xs ${verificationStatusColor(
                          incident.amountVerificationStatus
                        )}`}
                      >
                        {incident.amountVerificationStatus || "UNKNOWN"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="terminal-panel p-3 text-center">
              <div className="terminal-green font-mono font-bold text-lg">
                {incidents.length}
              </div>
              <div className="terminal-muted font-mono text-xs uppercase mt-1">
                Total Incidents
              </div>
            </div>
            <div className="terminal-panel p-3 text-center">
              <div className="terminal-red font-mono font-bold text-lg">
                ${(totalUsd / 1e9).toFixed(1)}B
              </div>
              <div className="terminal-muted font-mono text-xs uppercase mt-1">
                Total Value Locked
              </div>
            </div>
            <div className="terminal-panel p-3 text-center">
              <div className="terminal-cyan font-mono font-bold text-lg">
                {Math.min(incidents.length, 5)}
              </div>
              <div className="terminal-muted font-mono text-xs uppercase mt-1">
                Displayed Cases
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CaseStudiesSectionTerminal;
