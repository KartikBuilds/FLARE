import { describe, expect, it } from "vitest";
import { getIncidents, getIncident, getVerifiedLockedTotalUsd } from "@/lib/incidents";
import { formatUsdCompact } from "@/lib/format";

describe("getIncidents", () => {
  it("loads and validates every incident JSON file", () => {
    const incidents = getIncidents();
    expect(incidents.length).toBe(5);
    for (const incident of incidents) {
      expect(incident.id).toBeTruthy();
      expect(incident.primarySources).toBeInstanceOf(Array);
      expect(incident.taxonomy.length).toBeGreaterThan(0);
    }
  });

  it("sorts incidents newest-year-first", () => {
    const incidents = getIncidents();
    const years = incidents.map((i) => i.year);
    expect([...years]).toEqual([...years].sort((a, b) => b - a));
  });

  it("flags the unverified Perfect Finance entry instead of inventing details", () => {
    const incident = getIncident("perfect-finance-2023-unverified");
    expect(incident).toBeDefined();
    expect(incident?.amountVerificationStatus).toBe("unverified");
    expect(incident?.amount.valueUsd).toBeNull();
  });
});

describe("getVerifiedLockedTotalUsd", () => {
  it("only sums verified locked-principal amounts (Parity + Lido stSOL + Gemholic)", () => {
    const total = getVerifiedLockedTotalUsd();
    // 150,000,000 + 24,000,000 + 1,700,000 — ezETH (liquidation-impact) and
    // the unverified entry must never contribute to this figure.
    expect(total).toBe(175_700_000);
  });
});

describe("formatUsdCompact", () => {
  it("formats millions and billions without a trailing .0", () => {
    expect(formatUsdCompact(150_000_000)).toBe("$150M");
    expect(formatUsdCompact(1_000_000_000)).toBe("$1B");
    expect(formatUsdCompact(1_700_000)).toBe("$1.7M");
  });
});
