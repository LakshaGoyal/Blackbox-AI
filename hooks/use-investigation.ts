"use client";

import { useMemo, useState } from "react";
import type {
  AgentId,
  AgentOutputMap,
  AgentResult,
  AgentStatus,
  ChiefReport,
  IncidentInput
} from "@/types/investigation";
import { agentDefinitions } from "@/lib/agents/definitions";

type AgentRuntime = {
  status: AgentStatus;
  elapsedMs: number;
  output?: AgentOutputMap[AgentId];
  error?: string;
};

type ChiefState = {
  status: "idle" | "running" | "completed" | "failed";
  elapsedMs: number;
  report?: ChiefReport;
  error?: string;
};

const initialAgents = Object.fromEntries(
  agentDefinitions.map((agent) => [agent.id, { status: "queued", elapsedMs: 0 }])
) as Record<AgentId, AgentRuntime>;

export function useInvestigation() {
  const [incident, setIncident] = useState<IncidentInput | null>(null);
  const [agents, setAgents] = useState<Record<AgentId, AgentRuntime>>(initialAgents);
  const [chief, setChief] = useState<ChiefState>({ status: "idle", elapsedMs: 0 });
  const [isRunning, setIsRunning] = useState(false);

  const completedCount = useMemo(
    () => Object.values(agents).filter((agent) => agent.status === "completed").length,
    [agents]
  );
  const progress = Math.round(((completedCount + (chief.status === "completed" ? 1 : 0)) / 7) * 100);

  async function start(input: IncidentInput) {
    setIncident(input);
    setAgents(initialAgents);
    setChief({ status: "idle", elapsedMs: 0 });
    setIsRunning(true);

    const entries = await Promise.all(
      agentDefinitions.map(async (definition) => {
        setAgents((current) => ({
          ...current,
          [definition.id]: { ...current[definition.id], status: "running" }
        }));

        try {
          const response = await fetch(`/api/investigate/${definition.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context: input.context })
          });
          const result = (await response.json()) as AgentResult;

          if (!response.ok || result.status === "failed") {
            throw new Error(result.error ?? "Agent failed.");
          }

          setAgents((current) => ({
            ...current,
            [definition.id]: {
              status: "completed",
              elapsedMs: result.elapsedMs,
              output: result.output
            }
          }));

          return [definition.id, result.output] as const;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Agent failed.";
          setAgents((current) => ({
            ...current,
            [definition.id]: {
              status: "failed",
              elapsedMs: 0,
              error: message
            }
          }));
          throw error;
        }
      })
    );

    const outputs = Object.fromEntries(entries) as AgentOutputMap;
    setChief({ status: "running", elapsedMs: 0 });

    try {
      const response = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: input.context, outputs })
      });
      const result = (await response.json()) as {
        status: "completed";
        elapsedMs: number;
        report: ChiefReport;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Chief synthesis failed.");
      }

      setChief({ status: "completed", elapsedMs: result.elapsedMs, report: result.report });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chief synthesis failed.";
      setChief({ status: "failed", elapsedMs: 0, error: message });
    } finally {
      setIsRunning(false);
    }
  }

  function reset() {
    setIncident(null);
    setAgents(initialAgents);
    setChief({ status: "idle", elapsedMs: 0 });
    setIsRunning(false);
  }

  return {
    incident,
    agents,
    chief,
    isRunning,
    completedCount,
    progress,
    start,
    reset
  };
}
