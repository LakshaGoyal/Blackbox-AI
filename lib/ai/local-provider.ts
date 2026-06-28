import type {
  AgentId,
  AgentOutputMap,
  ChiefReport,
  FutureRiskOutput,
  ImpactOutput,
  RecoveryOutput,
  RiskLevel,
  TimelineOutput
} from "@/types/investigation";
import { clamp } from "@/lib/utils";

const timePattern =
  /\b(?:\d{1,2}:\d{2}|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|March|April|May|June|July|August|September|October|November|December|\d+\s*(?:hours?|days?|weeks?|months?)|within\s+\d+\s*(?:hours?|days?))\b/gi;

function sentences(context: string) {
  return context
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function pick(context: string, terms: string[], fallback: string) {
  const found = sentences(context).filter((sentence) =>
    terms.some((term) => sentence.toLowerCase().includes(term))
  );

  return found.length > 0 ? found.slice(0, 5) : [fallback];
}

function riskLevel(context: string): RiskLevel {
  const text = context.toLowerCase();
  const severe = ["ransom", "breach", "fraud", "diverted", "exposed", "lawsuit", "regulator"];
  const moderate = ["lost", "missed", "delayed", "intermittent", "postponed"];

  if (severe.some((term) => text.includes(term))) return "High";
  if (moderate.some((term) => text.includes(term))) return "Moderate";
  return "Low";
}

function evidence(context: string): AgentOutputMap["evidence"] {
  const all = sentences(context);

  return {
    verifiedFacts: all.slice(0, 8),
    disputedClaims: pick(context, ["claims", "reported", "initial", "appears"], "No disputed claims were explicit in the incident narrative."),
    missingEvidence: [
      "Primary source logs and chain-of-custody records should be preserved.",
      "Named owners, timestamps, and decision records should be validated.",
      "Financial, legal, or operational estimates need documented calculation sources."
    ],
    sourceReliability: clamp(72 + Math.min(all.length, 8) * 2, 70, 88)
  };
}

function timeline(context: string): TimelineOutput {
  const all = sentences(context);
  const matches = context.match(timePattern) ?? [];

  return {
    events: all.slice(0, 7).map((event, index) => ({
      time: matches[index] ?? (index === 0 ? "Initial detection" : `Sequence ${index + 1}`),
      event,
      confidence: clamp(82 - index * 4, 58, 88)
    }))
  };
}

function rootCause(context: string): AgentOutputMap["rootCause"] {
  const lower = context.toLowerCase();
  const primaryCause = lower.includes("mfa")
    ? "Identity control failure: remote access was possible without strong multi-factor enforcement."
    : lower.includes("misconfigured")
      ? "Configuration governance failure: a production data store was exposed without effective review."
      : lower.includes("alternate supplier")
        ? "Resilience planning failure: supplier concentration risk was known but not operationally mitigated."
        : "Control execution failure: a known risk was allowed to progress without timely verification and escalation.";

  return {
    primaryCause,
    contributingFactors: pick(context, ["skipped", "without", "missing", "rushed", "never", "pending"], "The narrative indicates incomplete controls and delayed escalation."),
    controlFailures: [
      "Preventive controls did not block the initiating condition.",
      "Review and approval checkpoints were ineffective or bypassed.",
      "Monitoring surfaced the issue after material exposure had already developed."
    ],
    confidence: 78
  };
}

function impact(context: string): ImpactOutput {
  return {
    people: pick(context, ["staff", "client", "customer", "patient", "user", "prospect"], "Affected people groups are not fully enumerated."),
    financial: pick(context, ["$", "btc", "cost", "inventory", "expedited", "transfer"], "Financial exposure requires quantification from finance and operations."),
    legal: pick(context, ["data", "forged", "authorization", "regulator", "privacy", "exposed"], "Legal duties should be reviewed against jurisdiction and contractual obligations."),
    operational: pick(context, ["access", "diverted", "postponed", "production", "shipments", "offline"], "Operational continuity was impaired and needs owner-level assessment."),
    reputation: pick(context, ["customer", "client", "hospital", "strategic", "public"], "Reputation risk depends on notification, customer impact, and media visibility."),
    severity: riskLevel(context)
  };
}

function recovery(context: string): RecoveryOutput {
  const securityIncident = /ransom|breach|vpn|laptop|exposed|encrypted/i.test(context);

  return {
    immediate: securityIncident
      ? ["Preserve logs and evidence.", "Contain affected access paths.", "Activate incident command and legal review."]
      : ["Stabilize customer commitments.", "Create a single source of operational truth.", "Assign owners for each blocked path."],
    twentyFourHour: [
      "Validate scope and impact with primary evidence.",
      "Brief executives with confirmed facts, assumptions, and open questions.",
      "Prepare stakeholder communications with legal and operational owners."
    ],
    sevenDay: [
      "Complete root cause validation.",
      "Close the highest-risk control gaps.",
      "Document recovery metrics and customer-facing commitments."
    ],
    thirtyDay: [
      "Run a post-incident review with accountable owners.",
      "Add monitoring and escalation thresholds.",
      "Test the revised control environment under realistic conditions."
    ]
  };
}

function futureRisk(context: string): FutureRiskOutput {
  const level = riskLevel(context);

  return {
    outcomes: [
      {
        risk: "Scope expansion as additional evidence is reviewed.",
        level,
        probability: level === "High" ? 68 : 42,
        mitigation: "Freeze evidence, reconcile logs, and keep a living scope register."
      },
      {
        risk: "Stakeholder trust erosion if communication lags behind facts.",
        level: level === "Low" ? "Moderate" : level,
        probability: 55,
        mitigation: "Issue concise updates that distinguish confirmed facts from active hypotheses."
      },
      {
        risk: "Repeat incident due to incomplete control remediation.",
        level: "High",
        probability: 49,
        mitigation: "Assign named owners and verify closure through testing, not attestation alone."
      }
    ]
  };
}

export async function runLocalAgent<T extends AgentId>(agentId: T, context: string): Promise<AgentOutputMap[T]> {
  const output = {
    evidence: evidence(context),
    timeline: timeline(context),
    rootCause: rootCause(context),
    impact: impact(context),
    recovery: recovery(context),
    futureRisk: futureRisk(context)
  } satisfies AgentOutputMap;

  return output[agentId];
}

export async function runLocalChief(context: string, outputs: AgentOutputMap): Promise<ChiefReport> {
  const impactOutput = outputs.impact;
  const recoveryOutput = outputs.recovery;
  const futureRiskOutput = outputs.futureRisk;
  const confidenceScore = Math.round(
    (outputs.evidence.sourceReliability + outputs.rootCause.confidence + 76) / 3
  );

  return {
    executiveSummary: `BlackBox AI investigated the incident as a coordinated forensic team. The strongest current finding is: ${outputs.rootCause.primaryCause} The evidence supports a ${impactOutput.severity.toLowerCase()} incident classification with immediate containment, stakeholder communication, and verified remediation required.`,
    confidenceScore,
    timeline: outputs.timeline.events,
    evidenceSummary: outputs.evidence.verifiedFacts.slice(0, 6),
    rootCause: outputs.rootCause.primaryCause,
    impact: impactOutput,
    recoveryPlan: recoveryOutput,
    futureRisks: futureRiskOutput.outcomes,
    priorityMatrix: [
      {
        priority: "Contain exposure",
        urgency: impactOutput.severity,
        owner: "Incident Commander",
        nextAction: recoveryOutput.immediate[0]
      },
      {
        priority: "Validate scope",
        urgency: "High",
        owner: "Evidence Lead",
        nextAction: "Reconcile logs, records, and owner attestations."
      },
      {
        priority: "Remediate failed controls",
        urgency: "High",
        owner: "Control Owner",
        nextAction: outputs.rootCause.controlFailures[0]
      },
      {
        priority: "Stakeholder communications",
        urgency: "Moderate",
        owner: "Legal and Communications",
        nextAction: "Prepare fact-based notifications and executive updates."
      }
    ],
    recommendations: [
      "Keep the investigation evidence-led and update conclusions only when new facts are verified.",
      "Separate containment work from root cause validation so recovery does not erase evidence.",
      "Use the priority matrix as the daily operating agenda until all high-risk items close.",
      "Run a post-incident review within 30 days and test the remediated controls."
    ]
  };
}
