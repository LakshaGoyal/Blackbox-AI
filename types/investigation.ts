export type AgentId =
  | "evidence"
  | "timeline"
  | "rootCause"
  | "impact"
  | "recovery"
  | "futureRisk";

export type AgentStatus = "queued" | "running" | "completed" | "failed";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type IncidentInput = {
  title: string;
  context: string;
  source: "text" | "pdf" | "sample";
  demoMode: boolean;
};

export type AgentDefinition = {
  id: AgentId;
  name: string;
  shortName: string;
  role: string;
  accent: string;
  systemPrompt: string;
  estimatedSeconds: number;
};

export type EvidenceOutput = {
  verifiedFacts: string[];
  disputedClaims: string[];
  missingEvidence: string[];
  sourceReliability: number;
};

export type TimelineOutput = {
  events: Array<{
    time: string;
    event: string;
    confidence: number;
  }>;
};

export type RootCauseOutput = {
  primaryCause: string;
  contributingFactors: string[];
  controlFailures: string[];
  confidence: number;
};

export type ImpactOutput = {
  people: string[];
  financial: string[];
  legal: string[];
  operational: string[];
  reputation: string[];
  severity: RiskLevel;
};

export type RecoveryOutput = {
  immediate: string[];
  twentyFourHour: string[];
  sevenDay: string[];
  thirtyDay: string[];
};

export type FutureRiskOutput = {
  outcomes: Array<{
    risk: string;
    level: RiskLevel;
    probability: number;
    mitigation: string;
  }>;
};

export type AgentOutputMap = {
  evidence: EvidenceOutput;
  timeline: TimelineOutput;
  rootCause: RootCauseOutput;
  impact: ImpactOutput;
  recovery: RecoveryOutput;
  futureRisk: FutureRiskOutput;
};

export type AgentResult<T extends AgentId = AgentId> = {
  agentId: T;
  status: AgentStatus;
  elapsedMs: number;
  output?: AgentOutputMap[T];
  error?: string;
};

export type ChiefReport = {
  executiveSummary: string;
  confidenceScore: number;
  timeline: TimelineOutput["events"];
  evidenceSummary: string[];
  rootCause: string;
  impact: ImpactOutput;
  recoveryPlan: RecoveryOutput;
  futureRisks: FutureRiskOutput["outcomes"];
  priorityMatrix: Array<{
    priority: string;
    urgency: RiskLevel;
    owner: string;
    nextAction: string;
  }>;
  recommendations: string[];
};
