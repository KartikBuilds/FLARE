export interface PipelineStage {
  index: string;
  id: string;
  title: string;
  summary: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    index: "01",
    id: "intake",
    title: "Intake",
    summary:
      "Source files, a ZIP, a GitHub URL, or a verified address are safely validated and extracted into an isolated workspace — path-traversal and size checks run before anything else touches the input.",
  },
  {
    index: "02",
    id: "understanding",
    title: "Understanding",
    summary:
      "The compiler version is detected and the project is compiled with solc-select; Slither runs against the compiled artifacts to produce contract, function and storage-layout metadata.",
  },
  {
    index: "03",
    id: "asset-discovery",
    title: "Asset Discovery",
    summary:
      "Every function that can receive value — payable entry points, ERC-20 transferFrom pulls, token mints — is identified as a place assets enter the system.",
  },
  {
    index: "04",
    id: "state-model",
    title: "State Model",
    summary:
      "Storage variables, modifiers and enums that gate behavior are extracted into a state model, so FLARE can reason about which states are reachable and which are terminal.",
  },
  {
    index: "05",
    id: "dependencies",
    title: "Dependencies",
    summary:
      "Library links, delegatecalls, and external contract calls are resolved into a dependency graph — this is where library-dependency risk becomes visible.",
  },
  {
    index: "06",
    id: "exit-recovery",
    title: "Exit & Recovery",
    summary:
      "Withdrawal, redemption, migration and emergency-recovery functions are identified and checked for whether they are actually reachable given the state model.",
  },
  {
    index: "07",
    id: "detectors",
    title: "Detectors",
    summary:
      "The versioned FLARE detector registry runs against the normalized IR. Every detector requires deterministic evidence — a source location and a triggering condition — to fire.",
  },
  {
    index: "08",
    id: "validation",
    title: "Validation",
    summary:
      "Where possible, findings are checked against a local, offline Foundry/Anvil environment — never a public network — to reduce false positives with executable evidence.",
  },
  {
    index: "09",
    id: "risk",
    title: "Risk",
    summary:
      "A transparent, documented formula combines severity, confidence, exposure, reachability, recovery availability and analysis coverage into the FLARE score — never an unexplained AI probability.",
  },
];
