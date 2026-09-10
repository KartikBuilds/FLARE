export interface ResearchPillar {
  name: string;
  status: string;
  tone: "success" | "warning" | "neutral";
  description: string;
}

export const RESEARCH_PILLARS: ResearchPillar[] = [
  {
    name: "Static Analysis",
    status: "Implemented",
    tone: "success",
    description: "Slither-driven extraction of contracts, storage, calls and control flow into a normalized IR.",
  },
  {
    name: "Graph Models",
    status: "Implemented",
    tone: "success",
    description: "A NetworkX dependency and fund-flow graph built from the IR, visualized with React Flow.",
  },
  {
    name: "Formal Methods",
    status: "Partial",
    tone: "warning",
    description:
      "Local Foundry/Anvil execution validates specific findings; this is targeted validation, not full formal verification of arbitrary properties.",
  },
  {
    name: "AI-Assisted Reasoning",
    status: "Optional, explanation-only",
    tone: "neutral",
    description:
      "When enabled, an AI provider may explain deterministic findings or summarize architecture — it never creates a finding on its own, and the core pipeline runs fully with it disabled.",
  },
];
