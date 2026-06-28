"use client";

import { ChangeEvent, FormEvent, ReactNode, RefObject, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  Check,
  Clipboard,
  FileJson,
  FileText,
  Loader2,
  Printer,
  Radar,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap
} from "lucide-react";
import { agentDefinitions } from "@/lib/agents/definitions";
import { sampleIncidents } from "@/lib/samples";
import { cn, formatElapsed } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useInvestigation } from "@/hooks/use-investigation";
import type { AgentId, AgentOutputMap, ChiefReport, IncidentInput, RiskLevel } from "@/types/investigation";
import { downloadText, reportToJson, reportToMarkdown } from "@/utils/export";

type Toast = {
  id: number;
  message: string;
};

const reveal = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function BlackBoxApp() {
  const investigation = useInvestigation();
  const [text, setText] = useState("");
  const [demoMode, setDemoMode] = useState(true);
  const [selectedSample, setSelectedSample] = useState(sampleIncidents[0].title);
  const [isExtracting, setIsExtracting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  const selectedIncident = useMemo(
    () => sampleIncidents.find((incident) => incident.title === selectedSample) ?? sampleIncidents[0],
    [selectedSample]
  );

  function toast(message: string) {
    const id = Date.now();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 2800);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (demoMode) {
      await investigation.start({ ...selectedIncident, demoMode: true });
      dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!text.trim()) {
      toast("Add incident text or upload a PDF first.");
      return;
    }

    await investigation.start({
      title: "Custom incident",
      context: text.trim(),
      source: "text",
      demoMode: false
    });
    dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setDemoMode(false);
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as Pick<IncidentInput, "title" | "context" | "source"> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not read PDF.");
      }

      setText(result.context);
      toast(`Extracted context from ${result.title}.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not read PDF.");
    } finally {
      setIsExtracting(false);
      event.target.value = "";
    }
  }

  const agentOutputs = useMemo(() => {
    const entries = Object.entries(investigation.agents)
      .filter(([, value]) => value.output)
      .map(([key, value]) => [key, value.output]);

    return Object.fromEntries(entries) as Partial<AgentOutputMap>;
  }, [investigation.agents]);

  return (
    <main className="noise min-h-screen overflow-hidden">
      <Navbar onStart={() => document.getElementById("intake")?.scrollIntoView({ behavior: "smooth" })} />
      <Hero />
      <section id="intake" className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1fr_0.9fr] md:px-8">
        <UploadPanel
          text={text}
          demoMode={demoMode}
          selectedSample={selectedSample}
          isExtracting={isExtracting}
          onTextChange={setText}
          onDemoModeChange={setDemoMode}
          onSampleChange={setSelectedSample}
          onFile={handleFile}
          onSubmit={handleSubmit}
          isRunning={investigation.isRunning}
        />
        <AgentShowcase />
      </section>
      <Dashboard
        refElement={dashboardRef}
        agents={investigation.agents}
        progress={investigation.progress}
        completedCount={investigation.completedCount}
        chief={investigation.chief}
      />
      {investigation.chief.report ? (
        <Report
          report={investigation.chief.report}
          outputs={agentOutputs as AgentOutputMap}
          onToast={toast}
          onReset={investigation.reset}
        />
      ) : null}
      <HowItWorks />
      <Footer />
      <ToastStack toasts={toasts} />
    </main>
  );
}

function Navbar({ onStart }: { onStart: () => void }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Radar className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold tracking-normal">BlackBox AI</span>
        </div>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a className="hover:text-white" href="#how">
            How it works
          </a>
          <a className="hover:text-white" href="#agents">
            Agents
          </a>
          <a className="hover:text-white" href="#report">
            Report
          </a>
        </div>
        <Button onClick={onStart} size="sm">
          <Zap className="h-4 w-4" />
          Start Investigation
        </Button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-8">
      <motion.div {...reveal} className="flex flex-col justify-center">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-teal-200">
          <Sparkles className="h-4 w-4" />
          AI incident command, structured from first signal to final report
        </div>
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-white md:text-7xl">
          The AI that investigates any incident like a team of experts.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Upload an incident. Watch six AI investigators analyze it simultaneously. Receive a board-ready
          investigation report with evidence, timeline, impact, recovery, and future risk.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="#intake">
              Start Investigation
              <ArrowDown className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#agents">View investigators</a>
          </Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass flex min-h-[520px] flex-col justify-between rounded-lg p-5"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Live Investigation Room</p>
            <h2 className="text-xl font-semibold">Six independent tracks</h2>
          </div>
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div className="grid gap-3 py-5">
          {agentDefinitions.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-md border border-white/10 bg-white/[0.055] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={cn("font-medium", agent.accent)}>{agent.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{agent.role}</p>
                </div>
                <div className="h-2 w-20 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ x: ["-100%", "120%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.12 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-md bg-black/30 p-4 text-sm text-muted-foreground">
          Chief Investigation Officer activates only after every specialist returns structured JSON.
        </div>
      </motion.div>
    </section>
  );
}

function UploadPanel(props: {
  text: string;
  demoMode: boolean;
  selectedSample: string;
  isExtracting: boolean;
  isRunning: boolean;
  onTextChange: (value: string) => void;
  onDemoModeChange: (value: boolean) => void;
  onSampleChange: (value: string) => void;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.form {...reveal} onSubmit={props.onSubmit} className="glass rounded-lg p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-primary">Incident input</p>
          <h2 className="mt-2 text-3xl font-semibold">Give BlackBox the case file.</h2>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={props.demoMode}
            onChange={(event) => props.onDemoModeChange(event.target.checked)}
            className="h-4 w-4 accent-teal-400"
          />
          Demo Mode
        </label>
      </div>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-muted-foreground">Sample incidents</span>
          <select
            value={props.selectedSample}
            onChange={(event) => props.onSampleChange(event.target.value)}
            disabled={!props.demoMode}
            className="h-11 rounded-md border border-white/10 bg-black/30 px-3 text-sm outline-none ring-primary transition focus:ring-2 disabled:opacity-50"
          >
            {sampleIncidents.map((incident) => (
              <option key={incident.title}>{incident.title}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-muted-foreground">Incident narrative</span>
          <textarea
            value={props.text}
            onChange={(event) => {
              props.onDemoModeChange(false);
              props.onTextChange(event.target.value);
            }}
            placeholder="Paste the incident narrative, executive escalation, hotline complaint, outage summary, or preliminary evidence..."
            className="min-h-52 resize-y rounded-md border border-white/10 bg-black/30 p-4 text-sm leading-6 outline-none ring-primary transition placeholder:text-muted-foreground/70 focus:ring-2"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-medium transition hover:bg-white/10">
            {props.isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload PDF
            <input type="file" accept="application/pdf" onChange={props.onFile} className="sr-only" />
          </label>
          <Button type="submit" size="lg" disabled={props.isRunning || props.isExtracting} className="flex-1">
            {props.isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Start Investigation
          </Button>
        </div>
      </div>
    </motion.form>
  );
}

function AgentShowcase() {
  return (
    <section id="agents" className="grid content-start gap-4">
      {agentDefinitions.map((agent) => (
        <div key={agent.id} className="glass rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10">
              <Radar className={cn("h-4 w-4", agent.accent)} />
            </div>
            <div>
              <h3 className="font-semibold">{agent.name}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{agent.role}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function Dashboard({
  refElement,
  agents,
  progress,
  completedCount,
  chief
}: {
  refElement: RefObject<HTMLDivElement | null>;
  agents: Record<AgentId, { status: string; elapsedMs: number; error?: string }>;
  progress: number;
  completedCount: number;
  chief: { status: string; elapsedMs: number; report?: ChiefReport; error?: string };
}) {
  return (
    <section ref={refElement} className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-primary">Investigation dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold">Digital forensic team</h2>
        </div>
        <div className="min-w-72">
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>{completedCount}/6 agents complete</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agentDefinitions.map((definition) => (
          <AgentCard key={definition.id} definition={definition} runtime={agents[definition.id]} />
        ))}
      </div>
      <div className="mt-4">
        <ChiefCard chief={chief} />
      </div>
    </section>
  );
}

function AgentCard({
  definition,
  runtime
}: {
  definition: (typeof agentDefinitions)[number];
  runtime: { status: string; elapsedMs: number; error?: string };
}) {
  const completed = runtime.status === "completed";
  const running = runtime.status === "running";
  const failed = runtime.status === "failed";

  return (
    <motion.article layout className="glass min-h-44 rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={cn("font-semibold", definition.accent)}>{definition.name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{definition.role}</p>
        </div>
        <StatusIcon completed={completed} running={running} failed={failed} />
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="capitalize text-muted-foreground">{runtime.status}</span>
        <span>{formatElapsed(runtime.elapsedMs)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={cn("h-full rounded-full", failed ? "bg-destructive" : "bg-primary")}
          animate={{
            width: completed ? "100%" : running ? ["20%", "74%", "42%"] : "8%"
          }}
          transition={{ duration: running ? 1.6 : 0.4, repeat: running ? Infinity : 0 }}
        />
      </div>
      {runtime.error ? <p className="mt-3 text-sm text-destructive">{runtime.error}</p> : null}
    </motion.article>
  );
}

function StatusIcon({ completed, running, failed }: { completed: boolean; running: boolean; failed: boolean }) {
  if (failed) return <AlertTriangle className="h-5 w-5 text-destructive" />;
  if (completed) return <Check className="h-5 w-5 text-emerald-300" />;
  if (running) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  return <div className="h-3 w-3 rounded-full bg-white/20" />;
}

function ChiefCard({
  chief
}: {
  chief: { status: string; elapsedMs: number; report?: ChiefReport; error?: string };
}) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-accent text-accent-foreground">
            {chief.status === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold">Chief Investigation Officer</h3>
            <p className="text-sm text-muted-foreground">Synthesizes specialist JSON into the final report.</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="capitalize">{chief.status}</span>
          <span className="mx-2">/</span>
          <span>{formatElapsed(chief.elapsedMs)}</span>
        </div>
      </div>
      {chief.error ? <p className="mt-3 text-sm text-destructive">{chief.error}</p> : null}
    </div>
  );
}

function Report({
  report,
  outputs,
  onToast,
  onReset
}: {
  report: ChiefReport;
  outputs: AgentOutputMap;
  onToast: (message: string) => void;
  onReset: () => void;
}) {
  async function copyReport() {
    await navigator.clipboard.writeText(reportToMarkdown(report));
    onToast("Report copied as Markdown.");
  }

  return (
    <section id="report" className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-primary">Interactive investigation report</p>
          <h2 className="mt-2 text-3xl font-semibold">Board-ready findings</h2>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="outline" onClick={copyReport}>
            <Clipboard className="h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print / PDF
          </Button>
          <Button variant="outline" onClick={() => downloadText("blackbox-report.md", reportToMarkdown(report), "text/markdown")}>
            <FileText className="h-4 w-4" />
            Markdown
          </Button>
          <Button variant="outline" onClick={() => downloadText("blackbox-report.json", reportToJson(report, outputs), "application/json")}>
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
          <Button variant="secondary" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_0.45fr]">
        <ReportSection title="Executive Summary">
          <p className="leading-7 text-muted-foreground">{report.executiveSummary}</p>
        </ReportSection>
        <ConfidenceMeter score={report.confidenceScore} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ReportSection title="Timeline">
          <div className="grid gap-3">
            {report.timeline.map((event) => (
              <div key={`${event.time}-${event.event}`} className="border-l border-primary/40 pl-4">
                <p className="text-sm text-primary">{event.time}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.event}</p>
              </div>
            ))}
          </div>
        </ReportSection>
        <ReportSection title="Evidence Summary">
          <BulletList items={report.evidenceSummary} />
        </ReportSection>
        <ReportSection title="Root Cause">
          <p className="leading-7 text-muted-foreground">{report.rootCause}</p>
        </ReportSection>
        <ImpactPanel impact={report.impact} />
        <RecoveryPanel report={report} />
        <FutureRiskPanel report={report} />
      </div>
      <PriorityMatrix report={report} />
      <ReportSection title="Recommendations" className="mt-4">
        <BulletList items={report.recommendations} />
      </ReportSection>
    </section>
  );
}

function ReportSection({
  title,
  children,
  className
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-lg p-5", className)}>
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function ConfidenceMeter({ score }: { score: number }) {
  return (
    <ReportSection title="Confidence">
      <div className="flex items-end gap-3">
        <span className="text-6xl font-semibold text-white">{score}</span>
        <span className="pb-2 text-muted-foreground">%</span>
      </div>
      <Progress value={score} className="mt-5" />
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Confidence reflects source richness, timeline clarity, and root cause signal strength.
      </p>
    </ReportSection>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ImpactPanel({ impact }: { impact: ChiefReport["impact"] }) {
  const groups = [
    ["People", impact.people],
    ["Financial", impact.financial],
    ["Legal", impact.legal],
    ["Operational", impact.operational],
    ["Reputation", impact.reputation]
  ] as const;

  return (
    <ReportSection title={`Impact / ${impact.severity}`}>
      <div className="grid gap-3">
        {groups.map(([title, items]) => (
          <div key={title}>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{items.join(" ")}</p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function RecoveryPanel({ report }: { report: ChiefReport }) {
  const groups = [
    ["Immediate", report.recoveryPlan.immediate],
    ["24 hours", report.recoveryPlan.twentyFourHour],
    ["7 days", report.recoveryPlan.sevenDay],
    ["30 days", report.recoveryPlan.thirtyDay]
  ] as const;

  return (
    <ReportSection title="Recovery Plan">
      <div className="grid gap-4">
        {groups.map(([title, items]) => (
          <div key={title}>
            <p className="mb-2 text-sm font-medium text-white">{title}</p>
            <BulletList items={items} />
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function FutureRiskPanel({ report }: { report: ChiefReport }) {
  return (
    <ReportSection title="Future Risks">
      <div className="grid gap-3">
        {report.futureRisks.map((risk) => (
          <div key={risk.risk} className="rounded-md border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{risk.risk}</p>
              <RiskBadge level={risk.level} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {risk.probability}% probability. {risk.mitigation}
            </p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function PriorityMatrix({ report }: { report: ChiefReport }) {
  return (
    <ReportSection title="Priority Matrix" className="mt-4">
      <div className="grid gap-3 md:grid-cols-2">
        {report.priorityMatrix.map((item) => (
          <div key={item.priority} className="rounded-md border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium">{item.priority}</h4>
              <RiskBadge level={item.urgency} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.owner}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.nextAction}</p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const color = {
    Low: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    Moderate: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    High: "border-rose-300/30 bg-rose-300/10 text-rose-200",
    Critical: "border-red-300/30 bg-red-300/10 text-red-200"
  }[level];

  return <span className={cn("rounded-md border px-2 py-1 text-xs font-medium", color)}>{level}</span>;
}

function HowItWorks() {
  const steps = ["Upload incident", "Extract context", "Launch investigators", "Synthesize report"];

  return (
    <section id="how" className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-6">
        <p className="text-sm text-primary">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold">From raw incident to decision-ready truth.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step} className="glass rounded-lg p-5">
            <span className="text-sm text-primary">0{index + 1}</span>
            <h3 className="mt-4 font-semibold">{step}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {index === 0 && "Paste text, upload a PDF, or use a sample case."}
              {index === 1 && "BlackBox normalizes the case into a shared evidence context."}
              {index === 2 && "Six specialist agents analyze separate investigation tracks."}
              {index === 3 && "The chief officer consolidates everything into structured JSON and a polished report."}
            </p>
          </div>
        ))}
      </div>
      <Faq />
    </section>
  );
}

function Faq() {
  const items = [
    ["Is this a chatbot?", "No. The interface is an investigation workflow with specialist agents and structured outputs."],
    ["Does it store data?", "No database is used. State lives in the browser session and API request lifecycle."],
    ["Can I export reports?", "Yes. Copy, print to PDF, download Markdown, or download structured JSON."],
    ["Can another AI provider be connected?", "Yes. The app calls a central provider-agnostic generateAI function."]
  ];

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {items.map(([question, answer]) => (
        <div key={question} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h3 className="font-semibold">{question}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
      <p>BlackBox AI</p>
      <p>Incident investigation platform for structured, evidence-led response.</p>
    </footer>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="no-print fixed bottom-4 right-4 z-50 grid gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="rounded-md border border-white/10 bg-background/90 px-4 py-3 text-sm shadow-panel backdrop-blur"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
