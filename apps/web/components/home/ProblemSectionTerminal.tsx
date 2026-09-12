import { getIncidents } from "@/lib/incidents";
import { type Incident } from "@flare/schemas";

export function ProblemSectionTerminal() {
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

  return (
    <section className="terminal-shell bg-terminal-bg py-20 md:py-32 border-t border-terminal-line">
      <div className="container-flare max-w-5xl mx-auto">
        <div className="space-y-8">
          {/* Command */}
          <div className="terminal-muted font-mono text-xs uppercase tracking-widest">
            $ cat research/problem.txt
          </div>

          {/* Problem Description */}
          <div className="space-y-4">
            <h2 className="font-mono text-2xl terminal-white font-bold">
              THE_FUND_LOCK_PROBLEM
            </h2>
            <p className="font-mono text-sm terminal-text leading-relaxed max-w-3xl">
              Smart contract systems can accept assets into a vault but fail to provide
              a legitimate path to withdraw them. This can occur through:
            </p>
            <ul className="space-y-2 font-mono text-sm terminal-text ml-4">
              <li>
                •{" "}
                <span className="terminal-amber">Library Dependencies</span> — External
                code whose behavior cannot be guaranteed
              </li>
              <li>
                •{" "}
                <span className="terminal-amber">Withdrawal Failures</span> — No
                reachable function that returns assets
              </li>
              <li>
                •{" "}
                <span className="terminal-amber">Missing Recovery</span> — No fallback
                or emergency exit mechanism
              </li>
              <li>
                •{" "}
                <span className="terminal-amber">Dangerous State Transitions</span> —
                Transitions that block legitimate exits
              </li>
              <li>
                •{" "}
                <span className="terminal-amber">Transfer Logic Failures</span> —
                Incorrect token transfer implementations
              </li>
            </ul>
          </div>

          {/* Incidents Table */}
          <div className="space-y-4 mt-8">
            <div className="terminal-muted font-mono text-xs uppercase">
              VERIFIED_INCIDENTS: {incidents.length}
            </div>
            <div className="terminal-panel p-4 font-mono text-xs overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="terminal-box-bottom">
                    <th className="text-left py-2 terminal-white">INCIDENT</th>
                    <th className="text-left py-2 terminal-white">YEAR</th>
                    <th className="text-left py-2 terminal-white">CHAIN</th>
                    <th className="text-right py-2 terminal-white">AMOUNT</th>
                    <th className="text-left py-2 terminal-white">TYPE</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.slice(0, 5).map((incident: Incident, idx: number) => (
                    <tr
                      key={incident.id}
                      className={
                        idx < Math.min(incidents.length, 5) - 1
                          ? "terminal-box-bottom"
                          : ""
                      }
                    >
                      <td className="py-2 terminal-text">{incident.name}</td>
                      <td className="terminal-muted">{incident.year}</td>
                      <td className="terminal-muted">{incident.ecosystem}</td>
                      <td className="text-right terminal-red font-bold">
                        ${((incident.amount.valueUsd ?? 0) / 1e6).toFixed(1)}M
                      </td>
                      <td className="terminal-amber text-xs uppercase">
                        {incident.taxonomy?.[0] || "UNKNOWN"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSectionTerminal;
