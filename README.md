# BlackBox AI

BlackBox AI is an AI-powered incident investigation platform built with Next.js, React, TypeScript, Tailwind CSS, shadcn-style UI primitives, and Framer Motion.

It is designed to feel like a digital team of forensic experts, not a chatbot. Users provide an incident narrative or PDF, then BlackBox AI launches six specialist investigators in parallel. Once every investigator completes, a Chief Investigation Officer synthesizes the findings into a structured, exportable investigation report.

## Core Concept

BlackBox AI transforms raw incident context into a coordinated investigation workflow:

1. Upload or paste an incident.
2. Extract and normalize the case context.
3. Launch six independent AI investigators.
4. Track each investigator as it runs and completes independently.
5. Synthesize all agent outputs through the Chief Investigation Officer.
6. Review, copy, print, or export the final report.

## Features

- Premium dark-mode SaaS interface
- Responsive landing page with glassmorphism and motion
- Incident text input
- PDF upload and text extraction
- Demo Mode with sample incidents
- Six concurrent investigation agents
- Independent agent loading and completion states
- Elapsed-time tracking for each agent
- Automatic Chief Investigation Officer synthesis
- Structured report sections
- Confidence meter
- Timeline visualization
- Priority matrix
- Copy report to clipboard
- Print or save as PDF
- Export Markdown
- Export JSON
- Provider-agnostic AI adapter
- Session-only state
- No authentication
- No database
- Vercel-ready architecture

## Investigation Agents

BlackBox AI runs six specialist investigators:

| Agent | Purpose | Output |
| --- | --- | --- |
| Evidence Investigator | Extracts verified facts, disputed claims, and missing evidence | JSON |
| Timeline Investigator | Builds a chronological sequence of events | JSON |
| Root Cause Investigator | Determines why the incident occurred | JSON |
| Impact Investigator | Assesses people, financial, legal, operational, and reputation impact | JSON |
| Recovery Investigator | Produces immediate, 24-hour, 7-day, and 30-day response plans | JSON |
| Future Risk Investigator | Predicts likely future outcomes, risk level, probability, and mitigation | JSON |

After all six complete, the Chief Investigation Officer generates:

- Executive Summary
- Confidence Score
- Timeline
- Evidence Summary
- Root Cause
- Impact Analysis
- Recovery Plan
- Future Risks
- Priority Matrix
- Recommendations

## Sample Incidents

Demo Mode includes five sample cases:

- Hospital ransomware
- Investment fraud
- Data breach
- Lost laptop
- Supply chain failure

These are defined in:

```txt
lib/samples.ts
```

## Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn-style reusable UI primitives
- Framer Motion
- Lucide React icons

### Backend

- Next.js Route Handlers
- PDF extraction through `pdf-parse`
- Provider-agnostic AI service layer

### Deployment

- Vercel-compatible
- No database required
- No authentication required

## Project Structure

```txt
app/
  api/
    extract/
      route.ts
    investigate/
      [agent]/
        route.ts
    synthesize/
      route.ts
  globals.css
  layout.tsx
  page.tsx

components/
  ui/
    button.tsx
    progress.tsx
  blackbox-app.tsx

hooks/
  use-investigation.ts

lib/
  agents/
    chief.ts
    definitions.ts
  ai/
    index.ts
    local-provider.ts
  samples.ts
  utils.ts

types/
  investigation.ts

utils/
  export.ts
```

## AI Architecture

The frontend never talks directly to a provider-specific AI SDK. All agent generation flows through one provider-neutral function:

```ts
generateAI({
  agent,
  systemPrompt,
  userContext
});
```

Location:

```txt
lib/ai/index.ts
```

The current implementation uses a deterministic local provider in:

```txt
lib/ai/local-provider.ts
```

This makes the app fully runnable without API keys. To connect a real AI provider later, replace or extend the implementation behind `generateAI()` while keeping the UI, hooks, and API route contracts unchanged.

## API Routes

### Extract Incident Context

```txt
POST /api/extract
```

Accepts either text or a PDF file through `FormData`.

Returns:

```json
{
  "title": "Custom incident",
  "context": "Extracted incident text...",
  "source": "text"
}
```

### Run Investigation Agent

```txt
POST /api/investigate/[agent]
```

Supported agent IDs:

```txt
evidence
timeline
rootCause
impact
recovery
futureRisk
```

Request:

```json
{
  "context": "Incident narrative..."
}
```

Response:

```json
{
  "agentId": "evidence",
  "status": "completed",
  "elapsedMs": 2756,
  "output": {}
}
```

### Synthesize Final Report

```txt
POST /api/synthesize
```

Request:

```json
{
  "context": "Incident narrative...",
  "outputs": {}
}
```

Response:

```json
{
  "status": "completed",
  "elapsedMs": 2200,
  "report": {}
}
```

## Main UI Flow

The core app experience lives in:

```txt
components/blackbox-app.tsx
```

It includes:

- Navbar
- Hero section
- Upload/input panel
- Demo Mode selector
- Agent showcase
- Investigation dashboard
- Agent status cards
- Chief Investigation Officer card
- Interactive report
- Export actions
- Toast notifications
- FAQ
- Footer

## Investigation State

The investigation workflow is managed by:

```txt
hooks/use-investigation.ts
```

This hook handles:

- Current incident state
- Agent status state
- Parallel agent execution
- Independent completion updates
- Chief synthesis trigger
- Report state
- Progress calculation
- Reset/new case flow

## Export Options

Report export helpers live in:

```txt
utils/export.ts
```

Supported actions:

- Copy Markdown report to clipboard
- Print or save as PDF using the browser print dialog
- Download Markdown
- Download JSON

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Quality Checks

Run lint:

```bash
npm run lint
```

Run TypeScript checks:

```bash
npm run typecheck
```

Run production build:

```bash
npm run build
```

## Deployment

The app is ready for Vercel deployment.

Recommended steps:

1. Push the project to a Git repository.
2. Import the repository into Vercel.
3. Use the default Next.js build settings.
4. Deploy.

No database or authentication setup is required.

## Environment Variables

The current local provider does not require environment variables.

If you connect a hosted AI provider later, add provider keys through environment variables and keep provider-specific code inside the AI adapter layer.

Example:

```txt
AI_PROVIDER=openai
OPENAI_API_KEY=...
```

## Production Notes

- The app stores investigation state only in the browser session.
- Agent output is structured as TypeScript-backed JSON.
- API routes are modular and can be moved behind queues or background jobs later.
- The local AI provider is deterministic and designed for demo/development use.
- For real-world production investigations, connect a secure model provider and add persistence, authentication, audit logs, access controls, and retention policies.

## Verification

The project has been verified with:

```bash
npm run lint
npm run typecheck
npm run build
```

The local app runs at:

```txt
http://localhost:3000
```

## License

Private project.
