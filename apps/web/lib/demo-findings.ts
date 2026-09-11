import type { Finding } from "@flare/schemas";
import type { FundFlowGraph } from "@flare/graph";

/**
 * A hand-built, realistic demo findings + graph set for the "VaultLine"
 * demo analysis — illustrates what the Findings and Asset Flow tabs look
 * like with real content, without needing a live analyzer run. Every
 * field here uses the same shapes and detector ids the real registry
 * (services/analyzer/app/detectors) produces.
 */
export const VAULTLINE_FINDINGS: Finding[] = [
  {
    id: "FLARE-WD-002:VaultLine.withdraw:0",
    detectorId: "FLARE-WD-002",
    detectorVersion: "1.0.0",
    title: "Unreachable withdrawal branch",
    taxonomy: "withdrawal-failures",
    severity: "critical",
    confidence: 0.75,
    reachability: "public",
    file: "contracts/VaultLine.sol",
    lineStart: 41,
    lineEnd: 46,
    codeExcerpt: `function withdraw(uint256 amount) external {\n    require(unlocked, "locked");\n    balances[msg.sender] -= amount;\n    payable(msg.sender).transfer(amount);\n}`,
    explanation:
      "'withdraw' requires 'unlocked' to be true, but no function in VaultLine ever sets 'unlocked = true'.",
    triggeringCondition: 'require(bool,string)(unlocked,locked)',
    assetLockConsequence:
      "This withdrawal path is dead code — it can never execute because 'unlocked' has no path to becoming true.",
    remediation:
      "Add a function (with appropriate access control) that sets 'unlocked = true' under the intended condition.",
    relatedIncidentIds: [],
    validated: true,
    falsePositiveSuppressed: false,
  },
  {
    id: "FLARE-XFER-001:VaultLine.sweepRewards:0",
    detectorId: "FLARE-XFER-001",
    detectorVersion: "1.0.0",
    title: "Unchecked return value from transfer/transferFrom",
    taxonomy: "transfer-logic",
    severity: "high",
    confidence: 0.7,
    reachability: "privileged",
    file: "contracts/VaultLine.sol",
    lineStart: 52,
    lineEnd: 54,
    codeExcerpt: `function sweepRewards(IERC20 token, address to, uint256 amount) external onlyOwner {\n    token.transfer(to, amount);\n}`,
    explanation: "'sweepRewards' calls token.transfer(to, amount) without checking its boolean return value.",
    triggeringCondition: "token.transfer(to,amount)",
    assetLockConsequence:
      "A token that returns false instead of reverting on failure would silently fail here — VaultLine's accounting would proceed as if the transfer succeeded.",
    remediation: "Wrap the call in require(...), or use a safe-transfer helper such as OpenZeppelin's SafeERC20.",
    relatedIncidentIds: [],
    validated: false,
    falsePositiveSuppressed: false,
  },
  {
    id: "FLARE-REC-001:VaultLine.deposit:0",
    detectorId: "FLARE-REC-001",
    detectorVersion: "1.0.0",
    title: "No rescue path for unsupported received assets",
    taxonomy: "missing-recovery",
    severity: "medium",
    confidence: 0.65,
    reachability: "public",
    file: "contracts/VaultLine.sol",
    lineStart: 30,
    lineEnd: 33,
    codeExcerpt: `function deposit() external payable {\n    balances[msg.sender] += msg.value;\n}`,
    explanation: "VaultLine can receive assets via 'deposit' but defines no rescue/sweep/recover function anywhere.",
    triggeringCondition: "'deposit' accepts value with no matching rescue-style function in VaultLine.",
    assetLockConsequence:
      "Any asset that ends up in this contract outside its expected accounting has no path back out.",
    remediation:
      "Add an access-controlled rescue/sweep function that can move an arbitrary ERC-20 balance (or stray ETH) out of the contract.",
    relatedIncidentIds: [],
    validated: false,
    falsePositiveSuppressed: false,
  },
];

export const VAULTLINE_GRAPH: FundFlowGraph = {
  nodes: [
    {
      id: "VaultLine.constructor",
      contract: "VaultLine",
      function: "constructor",
      role: "constructor",
      file: "contracts/VaultLine.sol",
      lineStart: 20,
      lineEnd: 24,
      stateRequirements: [],
      accessRequirements: [],
      findingIds: [],
    },
    {
      id: "VaultLine.deposit",
      contract: "VaultLine",
      function: "deposit",
      role: "entry",
      file: "contracts/VaultLine.sol",
      lineStart: 30,
      lineEnd: 33,
      stateRequirements: [],
      accessRequirements: [],
      findingIds: ["FLARE-REC-001:VaultLine.deposit:0"],
    },
    {
      id: "VaultLine.withdraw",
      contract: "VaultLine",
      function: "withdraw",
      role: "blocked",
      file: "contracts/VaultLine.sol",
      lineStart: 41,
      lineEnd: 46,
      stateRequirements: ["unlocked"],
      accessRequirements: [],
      findingIds: ["FLARE-WD-002:VaultLine.withdraw:0"],
    },
    {
      id: "VaultLine.sweepRewards",
      contract: "VaultLine",
      function: "sweepRewards",
      role: "exit",
      file: "contracts/VaultLine.sol",
      lineStart: 52,
      lineEnd: 54,
      stateRequirements: [],
      accessRequirements: ["onlyOwner"],
      findingIds: ["FLARE-XFER-001:VaultLine.sweepRewards:0"],
    },
  ],
  edges: [
    {
      id: "VaultLine.constructor->VaultLine.deposit",
      source: "VaultLine.constructor",
      target: "VaultLine.deposit",
      kind: "internal",
      blocked: false,
    },
    {
      id: "VaultLine.deposit->VaultLine.withdraw",
      source: "VaultLine.deposit",
      target: "VaultLine.withdraw",
      kind: "internal",
      blocked: true,
    },
    {
      id: "VaultLine.deposit->VaultLine.sweepRewards",
      source: "VaultLine.deposit",
      target: "VaultLine.sweepRewards",
      kind: "internal",
      blocked: false,
    },
  ],
};
