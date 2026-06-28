import { NextResponse } from "next/server";
import type { AgentId } from "@/types/investigation";
import { generateAI } from "@/lib/ai";
import { agentDefinitions, getAgentDefinition } from "@/lib/agents/definitions";

export const runtime = "nodejs";

const validAgentIds = new Set(agentDefinitions.map((agent) => agent.id));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request, { params }: { params: Promise<{ agent: string }> }) {
  const started = Date.now();

  try {
    const { agent } = await params;

    if (!validAgentIds.has(agent as AgentId)) {
      return NextResponse.json({ error: "Unknown investigation agent." }, { status: 404 });
    }

    const body = (await request.json()) as { context?: string };
    const context = body.context?.trim();

    if (!context) {
      return NextResponse.json({ error: "Incident context is required." }, { status: 400 });
    }

    const definition = getAgentDefinition(agent as AgentId);
    const minimumDuration = definition.estimatedSeconds * 550;
    const output = await generateAI({
      agent: definition,
      systemPrompt: definition.systemPrompt,
      userContext: context
    });
    const remaining = minimumDuration - (Date.now() - started);

    if (remaining > 0) {
      await delay(remaining);
    }

    return NextResponse.json({
      agentId: definition.id,
      status: "completed",
      elapsedMs: Date.now() - started,
      output
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent investigation failed.";
    return NextResponse.json(
      {
        status: "failed",
        elapsedMs: Date.now() - started,
        error: message
      },
      { status: 500 }
    );
  }
}
