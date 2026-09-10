import { z } from "zod";

/** The five FLARE fund-lock taxonomy categories. Stable ids — referenced by
 * incidents, detectors, and benchmark fixtures alike. */
export const TAXONOMY_CATEGORY_IDS = [
  "library-dependencies",
  "withdrawal-failures",
  "missing-recovery",
  "state-transitions",
  "transfer-logic",
] as const;

export const TaxonomyCategoryId = z.enum(TAXONOMY_CATEGORY_IDS);
export type TaxonomyCategoryId = z.infer<typeof TaxonomyCategoryId>;

export interface TaxonomyCategoryMeta {
  id: TaxonomyCategoryId;
  index: string;
  name: string;
  shortDescription: string;
  detail: string;
  /** Example detector-facing signals FLARE looks for in this category. */
  signals: string[];
}

export const TAXONOMY_CATEGORIES: TaxonomyCategoryMeta[] = [
  {
    id: "library-dependencies",
    index: "01",
    name: "Library Dependencies",
    shortDescription: "When external components become unavailable.",
    detail:
      "A protocol delegates critical logic (often via delegatecall) to an external or shared library contract. If that library can be destroyed, upgraded away, or was never designed with a replacement path, every contract depending on it can be bricked at once — including the funds held inside them.",
    signals: [
      "delegatecall to a mutable or destructible address",
      "no fallback logic path if the library reverts",
      "single point-of-failure dependency with no migration",
    ],
  },
  {
    id: "withdrawal-failures",
    index: "02",
    name: "Withdrawal Failures",
    shortDescription: "When legitimate withdrawals become impossible.",
    detail:
      "The deposit path works, but the withdrawal path does not: a bug, an unreachable code branch, an incompatible low-level call, or an authorization check that can never be satisfied prevents legitimate holders from exiting, even though the protocol never intended to trap them.",
    signals: [
      "withdrawal function with an unsatisfiable require()",
      "code path only reachable from an unreachable state",
      "access control that excludes the legitimate owner",
    ],
  },
  {
    id: "missing-recovery",
    index: "03",
    name: "Missing Recovery",
    shortDescription: "When no emergency or alternative exit exists.",
    detail:
      "There is no rescue, migration, or emergency-withdrawal mechanism for assets that end up in an unexpected state — including assets the protocol was never designed to hold. When the primary path breaks, there is nothing to fall back on.",
    signals: [
      "no rescue/sweep function for unsupported tokens",
      "pause mechanism that disables recovery, not just operation",
      "no migration path when the primary exit is deprecated",
    ],
  },
  {
    id: "state-transitions",
    index: "04",
    name: "State Transitions",
    shortDescription: "When protocol states can permanently block access.",
    detail:
      "A one-way state change — a finalized round, a terminal phase, a paused-forever switch — can leave the protocol in a configuration where redemption is disabled and nothing can move it back, even though assets remain inside.",
    signals: [
      "terminal enum state reachable with non-zero balance",
      "one-way transition with no inverse function",
      "irreversible configuration freeze (e.g. renounced admin)",
    ],
  },
  {
    id: "transfer-logic",
    index: "05",
    name: "Transfer Logic",
    shortDescription: "When assets are incorrectly handled or misdirected.",
    detail:
      "Unchecked transfer return values, assumptions about standard ERC-20 behavior that don't hold for every token, or a transfer method incompatible with the deployment chain's execution model can mean a value moves nowhere, or moves somewhere unrecoverable.",
    signals: [
      "unchecked return value from transfer/transferFrom",
      "fixed-gas-stipend transfer on a chain that doesn't support it",
      "asset accepted by one function but excluded from the exit path",
    ],
  },
];

export function getTaxonomyCategory(id: TaxonomyCategoryId): TaxonomyCategoryMeta {
  const found = TAXONOMY_CATEGORIES.find((category) => category.id === id);
  if (!found) throw new Error(`Unknown taxonomy category id: ${id}`);
  return found;
}
