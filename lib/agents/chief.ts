import type { AgentOutputMap } from "@/types/investigation";
import { runLocalChief } from "@/lib/ai/local-provider";

export async function synthesizeChiefReport(context: string, outputs: AgentOutputMap) {
  return runLocalChief(context, outputs);
}
