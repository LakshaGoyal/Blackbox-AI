import type { AgentOutputMap, ChiefReport } from "@/types/investigation";

export function reportToMarkdown(report: ChiefReport) {
  const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

  return `# BlackBox AI Investigation Report

## Executive Summary
${report.executiveSummary}

**Confidence:** ${report.confidenceScore}%

## Timeline
${report.timeline.map((event) => `- **${event.time}:** ${event.event} (${event.confidence}%)`).join("\n")}

## Evidence Summary
${list(report.evidenceSummary)}

## Root Cause
${report.rootCause}

## Impact
- People: ${report.impact.people.join("; ")}
- Financial: ${report.impact.financial.join("; ")}
- Legal: ${report.impact.legal.join("; ")}
- Operational: ${report.impact.operational.join("; ")}
- Reputation: ${report.impact.reputation.join("; ")}

## Recovery Plan
### Immediate
${list(report.recoveryPlan.immediate)}

### 24 Hours
${list(report.recoveryPlan.twentyFourHour)}

### 7 Days
${list(report.recoveryPlan.sevenDay)}

### 30 Days
${list(report.recoveryPlan.thirtyDay)}

## Future Risks
${report.futureRisks.map((risk) => `- **${risk.risk}:** ${risk.level}, ${risk.probability}% probability. Mitigation: ${risk.mitigation}`).join("\n")}

## Priority Matrix
${report.priorityMatrix.map((item) => `- **${item.priority}:** ${item.urgency} | ${item.owner} | ${item.nextAction}`).join("\n")}

## Recommendations
${list(report.recommendations)}
`;
}

export function downloadText(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function reportToJson(report: ChiefReport, outputs: AgentOutputMap) {
  return JSON.stringify({ report, agentOutputs: outputs }, null, 2);
}
