# ArchAI — AI System Design Generator

**Design scalable systems with AI.**

ArchAI is a working full-stack portfolio application for generating, understanding, modifying, and practicing production system designs. It combines a Next.js developer workspace with a stateless Java 21/Spring Boot API and Google Gemini structured output.

> ArchAI does not require a database or user account. Designs, versions, interview sessions, and preferences are persisted locally in the browser.

## Features

- Multi-stage Gemini generation with validated structured JSON
- Deterministic Java capacity estimates with visible formulas
- Interactive React Flow architecture diagrams
- Component editing, connections, minimap, zoom, fit, and local save
- Context-aware design assistant and safe change proposals
- Failure-impact and traffic-spike simulations
- Local design dashboard, search, duplicate, delete, and JSON export
- Version snapshots and restore-ready storage model
- Markdown and SQL export APIs
- System design interview mode with scoring and follow-up questions
- Example-system library and local application settings
- Prompt-injection heuristics, Bean Validation, CORS, and sanitized errors
- Docker Compose and GitHub Actions CI

## Architecture

```text
Browser
├── Next.js 16 + React 19 + TypeScript + Tailwind CSS
├── React Flow interactive architecture workspace
├── Zustand-ready in-memory application state
└── versioned localStorage persistence
        │
        │ REST + Server-Sent Events
        ▼
Java 21 + Spring Boot modular monolith (stateless)
        │
        ▼
Google Gemini API (backend only)
```

ArchAI itself uses no authentication, PostgreSQL, Redis, Kafka, or other external storage. Those technologies may appear in generated designs because they belong to the system being designed—not to ArchAI.

## Repository

```text
frontend/   Next.js application and browser persistence
backend/    Spring Boot API, Gemini provider, estimation, simulation, export
browser     localStorage only (no server-side persistence)
docs/       research and implementation plan
```

## Local setup

### Prerequisites

- Node.js 24+
- Java 21+
- Maven 3.9+
- A Gemini API key

### Environment

```bash
cp .env.example .env
# Set GEMINI_API_KEY in .env
```

Never commit `.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
GEMINI_API_KEY=your_key_here mvn spring-boot:run
```

Open http://localhost:3000.

## Docker

```bash
docker compose up --build
```

Compose starts only `frontend` and `backend`. It intentionally does not start a database, Redis, or Kafka.

## Tests

```bash
cd frontend && npm run lint && npm test && npm run build
cd backend && mvn verify
```

## Core API

- `POST /api/design/generate/stream` — validated generation with real SSE stages
- `POST /api/estimation/calculate` — deterministic capacity calculation
- `POST /api/design/chat` — contextual design review
- `POST /api/design/modify` — reviewable change proposal; never auto-applies
- `POST /api/design/failure-simulation` — graph-based downstream impact
- `POST /api/design/traffic-simulation` — 1×–100× pressure analysis
- `POST /api/interview/start`
- `POST /api/interview/evaluate`
- `POST /api/export/markdown`
- `POST /api/export/sql`

## Local storage schema

- `archai:v1:designs`
- `archai:v1:versions`
- `archai:v1:interviews`
- `archai:v1:settings`
- `archai:v1:recent`

Every value uses a versioned envelope and Zod validation. Corrupt or unavailable storage falls back safely to active-tab memory.

## Security notes

The Gemini key is read only by Spring Boot. User descriptions and design state are treated as untrusted data, separated from model instructions, bounded by request validation, and constrained by structured-output schemas. Errors are sanitized before reaching the browser.

This is a no-auth portfolio application. Do not deploy it as a shared public service without adding deployment-level abuse controls and a trusted rate limiter.

## Demo flow

1. Open ArchAI and create **Global Payment Processing Platform**.
2. Generate requirements, deterministic estimates, and architecture.
3. Edit the React Flow diagram and save it locally.
4. Ask why Kafka or a database was selected.
5. Simulate a database failure and a 10× traffic spike.
6. Propose “Add Redis caching,” review the impact, then save a version before applying.
7. Refresh the browser and verify the design remains.
8. Export JSON, Markdown, or SQL.
9. Practice the same system in Interview Mode.

## Future improvements

- Multi-user collaboration and cloud persistence
- RAG over architecture documentation
- Additional LLM providers behind `LLMProvider`
- Real-time collaborative diagram editing
- Deployment-specific edge rate limiting and observability
