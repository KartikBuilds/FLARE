import type { TaxonomyCategoryId } from "@flare/schemas";

export type DetectorSeverity = "critical" | "high" | "medium" | "low";
export type DetectorStatus = "implemented" | "planned";

export interface DetectorSpec {
  /** Stable id. services/analyzer's Python registry must use this exact id
   * for its implementation — this file is the spec both sides implement
   * against, not a generated mirror (there is nothing to mirror yet). */
  id: string;
  version: string;
  name: string;
  taxonomy: TaxonomyCategoryId;
  secondaryTaxonomy?: TaxonomyCategoryId[];
  defaultSeverity: DetectorSeverity;
  status: DetectorStatus;
  summary: string;
  evidenceRequirement: string;
  relatedIncidents?: string[];
}

/**
 * The FLARE detector registry spec. Ten detectors — two per taxonomy
 * category — chosen deliberately over a larger, shallower set: every entry
 * here must ship with deterministic logic, exact source evidence, a
 * vulnerable fixture, a corrected counterpart, a safe negative control, and
 * a false-positive test (see docs/DETECTOR_SPECIFICATION.md). `status`
 * tracks whether services/analyzer actually implements it yet.
 */
export const DETECTOR_REGISTRY: DetectorSpec[] = [
  {
    id: "FLARE-LIB-001",
    version: "1.0.0",
    name: "Unprotected delegatecall to a mutable address",
    taxonomy: "library-dependencies",
    defaultSeverity: "critical",
    status: "implemented",
    summary:
      "A function performs delegatecall to an address read from mutable storage, with no access control on who can change that address and no check that it points at a fixed, audited library.",
    evidenceRequirement:
      "Source location of the delegatecall, the storage variable it targets, and confirmation that the variable lacks an owner-only/immutable setter guard.",
    relatedIncidents: ["parity-multisig-2017"],
  },
  {
    id: "FLARE-LIB-002",
    version: "1.0.0",
    name: "Destructible library dependency with no replacement path",
    taxonomy: "library-dependencies",
    defaultSeverity: "critical",
    status: "implemented",
    summary:
      "A contract's core logic lives in a separately deployed library-style contract that (a) contains a reachable selfdestruct and (b) has no migration function allowing dependents to repoint at a new implementation.",
    evidenceRequirement:
      "Call graph edge from a dependent contract to the library, a reachable selfdestruct/delegatecall-suicide path in the library, and absence of a migration/upgrade function in the dependent.",
    relatedIncidents: ["parity-multisig-2017"],
  },
  {
    id: "FLARE-WD-001",
    version: "1.0.0",
    name: "Withdrawal function with an unsatisfiable condition",
    taxonomy: "withdrawal-failures",
    defaultSeverity: "high",
    status: "implemented",
    summary:
      "A withdrawal/redeem function contains a require()/revert condition that symbolic or reachability analysis shows can never be true given every state the contract's own functions can produce.",
    evidenceRequirement:
      "The specific requirement expression, the state variables it depends on, and a reachability argument (or Foundry counterexample search) showing no sequence of public calls satisfies it.",
  },
  {
    id: "FLARE-WD-002",
    version: "1.0.0",
    name: "Unreachable withdrawal branch",
    taxonomy: "withdrawal-failures",
    defaultSeverity: "high",
    status: "implemented",
    summary:
      "Withdrawal logic is guarded by a state (enum value, boolean flag) that no function in the contract ever sets to the required value — the branch exists in source but is dead code for every deployer/user.",
    evidenceRequirement:
      "The guarding state variable, its required value for the withdrawal branch, and an exhaustive scan of all state-mutating functions showing none set it there.",
  },
  {
    id: "FLARE-REC-001",
    version: "1.0.0",
    name: "No rescue path for unsupported received assets",
    taxonomy: "missing-recovery",
    defaultSeverity: "medium",
    status: "implemented",
    summary:
      "The contract can end up holding an ERC-20 token it was not designed to manage (no allowlist enforced on transfer-in) but exposes no owner-only sweep/rescue function to recover it.",
    evidenceRequirement:
      "Confirmation the contract has no allowlist restricting which tokens can be transferred to it, and absence of any function that can move an arbitrary ERC-20 balance out.",
    relatedIncidents: ["gemholic-zksync-2023"],
  },
  {
    id: "FLARE-REC-002",
    version: "1.0.0",
    name: "Pause mechanism disables recovery, not just operation",
    taxonomy: "missing-recovery",
    defaultSeverity: "high",
    status: "implemented",
    summary:
      "A `whenNotPaused`-style modifier is applied to the contract's own emergency-withdraw/rescue function, so pausing the contract — often intended to protect users during an incident — also removes the only escape hatch.",
    evidenceRequirement:
      "The modifier list on the identified emergency/rescue function, showing the same pause flag gates both normal operations and the recovery path, with no separate always-available exit.",
  },
  {
    id: "FLARE-STATE-001",
    version: "1.0.0",
    name: "Terminal state reachable with non-zero assets",
    taxonomy: "state-transitions",
    defaultSeverity: "critical",
    status: "implemented",
    summary:
      "A state machine has a terminal value (no outgoing transitions) that is reachable from the initial state, and no function callable while in that terminal state can move the contract's asset balance to zero.",
    evidenceRequirement:
      "The state machine's transition graph extracted from modifiers/require checks, the terminal node, and confirmation no callable function transfers assets out while in it.",
    relatedIncidents: ["lido-stsol-2024"],
  },
  {
    id: "FLARE-STATE-002",
    version: "1.0.0",
    name: "One-way transition disables a previously available redemption",
    taxonomy: "state-transitions",
    defaultSeverity: "high",
    status: "implemented",
    summary:
      "A function that was callable (and could redeem assets) in state A becomes permanently uncallable after an irreversible transition to state B, with no equivalent function available in B.",
    evidenceRequirement:
      "The redemption function's state guard, the transition function that moves state A -> B with no inverse, and confirmation no state-B-accessible function offers equivalent redemption.",
    relatedIncidents: ["lido-stsol-2024"],
  },
  {
    id: "FLARE-XFER-001",
    version: "1.0.0",
    name: "Unchecked return value from transfer/transferFrom",
    taxonomy: "transfer-logic",
    defaultSeverity: "high",
    status: "implemented",
    summary:
      "The contract calls an ERC-20 transfer/transferFrom and does not check (or require) a truthy return value, so a non-reverting token that returns false on failure lets the contract believe a transfer succeeded when it did not.",
    evidenceRequirement:
      "The call site, confirmation the boolean return value is discarded (not passed to require/assert), and that the token type is not restricted to a known-safe implementation.",
  },
  {
    id: "FLARE-XFER-002",
    version: "1.0.0",
    name: "Fixed-gas-stipend transfer incompatible with the deployment chain",
    taxonomy: "transfer-logic",
    defaultSeverity: "high",
    status: "implemented",
    summary:
      "The contract moves value using Solidity's .transfer()/.send() (a fixed ~2300 gas stipend) with no fallback path, on a chain or through a proxy where that stipend is insufficient for the recipient's logic to complete.",
    evidenceRequirement:
      "The .transfer()/.send() call site, confirmation there is no call()-based fallback, and (for chain-specific findings) the target chain's documented incompatibility with the fixed stipend.",
    relatedIncidents: ["gemholic-zksync-2023"],
  },
];

export function getDetector(id: string): DetectorSpec | undefined {
  return DETECTOR_REGISTRY.find((d) => d.id === id);
}

export function getDetectorsByTaxonomy(taxonomy: TaxonomyCategoryId): DetectorSpec[] {
  return DETECTOR_REGISTRY.filter((d) => d.taxonomy === taxonomy);
}
