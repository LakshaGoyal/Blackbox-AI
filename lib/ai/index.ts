import type { AgentDefinition } from "@/types/investigation";
import { runLocalAgent } from "@/lib/ai/local-provider";

export type GenerateAIInput = {
  agent: AgentDefinition;
  systemPrompt: string;
  userContext: string;
};

export async function generateAI({ agent, userContext }: GenerateAIInput) {
  return runLocalAgent(agent.id, userContext);
}
