import fs from "node:fs";
import path from "node:path";
import { Incident, type Incident as IncidentT } from "@flare/schemas";

const INCIDENTS_DIR = path.join(process.cwd(), "..", "..", "research", "incidents");

let cache: IncidentT[] | null = null;

/**
 * Loads and validates every incident in research/incidents/*.json. This is
 * the *only* place case-study figures enter the app — nothing is hard-coded
 * in a component. Server-only (reads the filesystem at build/request time).
 */
export function getIncidents(): IncidentT[] {
  if (cache) return cache;

  const files = fs.readdirSync(INCIDENTS_DIR).filter((f) => f.endsWith(".json"));
  const incidents = files.map((file) => {
    const raw = fs.readFileSync(path.join(INCIDENTS_DIR, file), "utf-8");
    const parsed = Incident.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Invalid incident data in ${file}: ${parsed.error.message}`);
    }
    return parsed.data;
  });

  incidents.sort((a, b) => b.year - a.year);
  cache = incidents;
  return incidents;
}

export function getIncident(id: string): IncidentT | undefined {
  return getIncidents().find((incident) => incident.id === id);
}

/**
 * Sum of only the incidents whose amount genuinely represents locked
 * principal with a verified figure — liquidation-impact, post-recovery
 * allegations, and unverified entries are deliberately excluded so this
 * number never overstates what FLARE can actually back with a source.
 */
export function getVerifiedLockedTotalUsd(): number {
  return getIncidents()
    .filter(
      (incident) =>
        incident.amount.category === "locked-principal" &&
        incident.amountVerificationStatus === "verified" &&
        incident.amount.valueUsd !== null,
    )
    .reduce((sum, incident) => sum + (incident.amount.valueUsd ?? 0), 0);
}
