import type { AgentDefinition, AgentId } from "@/types/investigation";

export const agentDefinitions: AgentDefinition[] = [
  {
    id: "evidence",
    name: "Evidence Investigator",
    shortName: "Evidence",
    role: "Extracts verified facts and separates them from assumptions.",
    accent: "text-teal-300",
    estimatedSeconds: 5,
    systemPrompt:
      "Extract only verified facts from the incident. Separate disputed claims and missing evidence. Return strict JSON."
  },
  {
    id: "timeline",
    name: "Timeline Investigator",
    shortName: "Timeline",
    role: "Builds the incident chronology from explicit and inferred sequence markers.",
    accent: "text-sky-300",
    estimatedSeconds: 7,
    systemPrompt:
      "Build chronological incident events with confidence values. Return strict JSON with events."
  },
  {
    id: "rootCause",
    name: "Root Cause Investigator",
    shortName: "Root Cause",
    role: "Finds the system failures that allowed the incident to happen.",
    accent: "text-amber-300",
    estimatedSeconds: 9,
    systemPrompt:
      "Determine why the incident occurred, including primary cause, contributing factors, and failed controls. Return strict JSON."
  },
  {
    id: "impact",
    name: "Impact Investigator",
    shortName: "Impact",
    role: "Evaluates people, financial, legal, operational, and reputation exposure.",
    accent: "text-rose-300",
    estimatedSeconds: 6,
    systemPrompt:
      "Analyze people, financial, legal, operational, and reputation impact. Return strict JSON."
  },
  {
    id: "recovery",
    name: "Recovery Investigator",
    shortName: "Recovery",
    role: "Turns findings into an immediate, 24-hour, 7-day, and 30-day response plan.",
    accent: "text-emerald-300",
    estimatedSeconds: 8,
    systemPrompt:
      "Generate immediate actions, 24-hour plan, 7-day plan, and 30-day plan. Return strict JSON."
  },
  {
    id: "futureRisk",
    name: "Future Risk Investigator",
    shortName: "Future Risk",
    role: "Predicts likely outcomes, probability, and mitigation paths.",
    accent: "text-violet-300",
    estimatedSeconds: 10,
    systemPrompt:
      "Predict likely future outcomes, risk level, probability, and mitigation. Return strict JSON."
  }
];

export function getAgentDefinition(agentId: AgentId) {
  const definition = agentDefinitions.find((agent) => agent.id === agentId);

  if (!definition) {
    throw new Error(`Unknown agent: ${agentId}`);
  }

  return definition;
}
