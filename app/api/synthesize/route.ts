import { NextResponse } from "next/server";
import type { AgentOutputMap } from "@/types/investigation";
import { synthesizeChiefReport } from "@/lib/agents/chief";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const started = Date.now();

  try {
    const body = (await request.json()) as {
      context?: string;
      outputs?: AgentOutputMap;
    };

    if (!body.context?.trim() || !body.outputs) {
      return NextResponse.json({ error: "Context and agent outputs are required." }, { status: 400 });
    }

    const report = await synthesizeChiefReport(body.context, body.outputs);
    const minimumDuration = 2200;
    const remaining = minimumDuration - (Date.now() - started);

    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    return NextResponse.json({
      status: "completed",
      elapsedMs: Date.now() - started,
      report
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chief synthesis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
