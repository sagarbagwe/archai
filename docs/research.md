# ArchAI project research

_Last reviewed: 2026-09-15_

## Executive recommendation

Build ArchAI as a two-app monorepo:

```text
Browser
├── Next.js App Router frontend
├── Zustand in-memory application state
└── versioned localStorage persistence
        │
        │ REST + Server-Sent Events
        ▼
Spring Boot modular monolith (stateless)
        │
        ▼
Google Gemini API
```

ArchAI itself must have no authentication, database, Redis, or Kafka. Those technologies may only appear inside generated system-design outputs.

## Current stack choices

- **Frontend:** current stable Next.js with App Router, React, TypeScript, Tailwind CSS, shadcn/ui, `@xyflow/react`, Lucide, Zod, Zustand.
- **Backend:** Java 21, current stable Spring Boot, Spring MVC, Bean Validation, Jackson, Resilience4j, Bucket4j, Maven.
- **AI SDK:** Google's GA `google-genai` Java SDK behind an `LLMProvider` interface.
- **Testing:** Vitest + Testing Library, Playwright, JUnit 5 + Mockito, Spring MockMvc/WireMock-style HTTP stubs.
- **Infrastructure:** separate Dockerfiles, Docker Compose with only frontend/backend services, GitHub Actions.

Java 21 is compatible with the current Spring Boot baseline. Pin exact dependency versions when scaffolding and update through Dependabot rather than using floating versions.

## Important findings

### 1. localStorage is appropriate, but it is a hard product constraint

Next.js requires browser-only APIs such as `localStorage` to live behind Client Component boundaries. Hydration must start from a deterministic empty/loading state and rehydrate after mount.

Web Storage is string-only and browsers commonly limit it to roughly 5 MiB for localStorage per origin. Writes can throw `QuotaExceededError`, and access can throw security-related errors. Therefore:

- Centralize access in `StorageService`; never call `localStorage` throughout UI components.
- Use versioned keys (`archai:v1:*`) and schema validation on every read/import.
- Catch read, parse, quota, and write errors.
- Fall back to an in-memory adapter for the active tab.
- Keep generated designs compact; avoid storing binary exports, images, or long chat transcripts.
- Show storage usage and a clear warning when persistence is unavailable.
- Use atomic-style writes: serialize/validate first, then replace the stored collection.

Sources:
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

### 2. React Flow supports the required persistence and export workflow

React Flow can serialize nodes, edges, and viewport with `toObject()`, and its official examples demonstrate restoration after refresh. Its image-export example uses DOM-to-image techniques.

Recommendations:

- Keep a domain-level `ArchitectureGraph` separate from React Flow's UI-specific node state.
- Persist semantic node data plus positions and viewport.
- Validate unique node IDs and all edge references before render or import.
- Use controlled nodes/edges and create a version only after an accepted significant change—not on every drag event.
- Export PNG/SVG in the browser; store no exported binary in localStorage.

Sources:
- https://reactflow.dev/examples/interaction/save-and-restore
- https://reactflow.dev/examples/misc/download-image

### 3. Gemini structured output should be enforced at the provider boundary

Gemini supports JSON Schema structured output and streaming. Streaming chunks are partial JSON and must be concatenated before parsing. Google's documentation still recommends application-level validation because syntactically valid output can be semantically invalid, and only a subset of JSON Schema is supported.

Recommended response pipeline:

1. Provide a compact stage-specific schema.
2. Request `application/json` structured output.
3. Concatenate all streamed chunks server-side.
4. Parse with Jackson into stage DTOs.
5. Bean-validate DTOs.
6. Run domain validation (IDs, edge references, ranges, invariants).
7. Attempt one deterministic repair for harmless formatting issues.
8. Retry once with validation errors summarized.
9. Return a sanitized typed error if still invalid.

Do not stream unvalidated architecture JSON into React Flow. Stream trustworthy stage/status events, then emit a validated final stage payload.

Sources:
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/gemini-api/docs/libraries
- https://ai.google.dev/gemini-api/docs/models

### 4. Use real SSE stage events

Spring MVC supports browser SSE using `SseEmitter`. The server should emit events only when an actual pipeline transition occurs:

- `generation.started`
- `stage.started`
- `stage.completed`
- `stage.failed`
- `generation.completed`
- `generation.failed`
- heartbeat comments/events

The frontend should never mark a step complete based on timers. The Servlet API does not reliably notify immediately when a browser disconnects, so send periodic heartbeats and connect emitter timeout/completion callbacks to cancellation where possible.

Source:
- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-async.html

### 5. Split deterministic and generative responsibilities

The Java backend—not the LLM—owns arithmetic:

```text
dailyRequests = DAU × requestsPerUser
averageRps = dailyRequests / 86,400
peakRps = averageRps × peakMultiplier
readRps = peakRps × readRatio
writeRps = peakRps × writeRatio
storagePerDay = writesPerDay × averageRecordBytes × replicationFactor
storagePerYear = storagePerDay × retentionDays (or 365)
bandwidth = peakRps × averagePayloadBytes
cacheSize = workingSetBytes × targetCacheCoverage
```

Use `BigDecimal` where rounding matters, explicit units, safe bounds, and return both numeric values and display formulas. Gemini may propose assumptions, but the estimator recalculates results deterministically.

### 6. Multi-stage generation should be a DAG, not nine unrelated calls

Recommended pipeline:

1. **Requirements** — model call.
2. **Estimation** — deterministic Java calculation using validated inputs and model-proposed assumptions.
3. **Architecture** — model call consuming requirements + estimation.
4. Run **Database**, **API**, **Reliability**, and **Security** stages in parallel where dependencies allow.
5. **Trade-offs** — model call consuming chosen architecture and specialist outputs.
6. **Synthesis/validation** — combine typed stage outputs in Java; use a final model call only for narrative gaps, not for copying all data into a new untrusted object.

This reduces latency, cost, and failure amplification compared with nine strictly sequential calls.

### 7. Model and cost strategy

Use configuration, not hard-coded model names. Default to a specific stable Flash model that supports structured output, and expose only supported backend-configured choices in Settings. Avoid aliases that can change unexpectedly.

Controls:

- maximum user-input length and normalized prompt budget;
- stage-specific output token limits;
- per-IP rate limiting (best effort; document proxy-header trust);
- bounded retries with jittered exponential backoff for retryable 429/5xx responses;
- request and whole-generation timeouts;
- cancellation token propagated through the orchestrator;
- bounded in-memory cache keyed by normalized request + prompt/schema/model version;
- token and duration telemetry returned to the UI when available.

Gemini responses expose usage metadata for input, output, thought, cached, tool-use, and total tokens. A 429 is `RESOURCE_EXHAUSTED`; retries should wait and reduce expensive request frequency rather than retrying aggressively.

Sources:
- https://ai.google.dev/gemini-api/docs/tokens
- https://ai.google.dev/gemini-api/docs/rate-limits

## Backend module boundaries

```text
com.archai
├── design/          orchestration, generation, modification, chat
├── estimation/      deterministic calculations and assumptions
├── architecture/    graph validation and change-set application
├── ai/              LLMProvider, GeminiProvider, prompts, schemas
├── interview/       interview state passed in each request
├── simulation/      deterministic impact graph + AI explanation
├── export/          Markdown and SQL generation
├── security/        input policy, prompt-injection heuristics, rate limits
├── config/          CORS, HTTP client, model settings
└── shared/          errors, validation, telemetry
```

Keep controllers thin. There must be no repository package and no server-side design persistence.

## API adjustments

Use JSON REST for short operations and SSE for generation:

```text
POST /api/design/generations          -> 202 + generation request ID (ephemeral)
GET  /api/design/generations/{id}/events -> text/event-stream
DELETE /api/design/generations/{id}   -> cancellation
POST /api/estimation/calculate
POST /api/design/modify               -> proposed change set only
POST /api/design/changes/apply        -> validates applied client-supplied result
POST /api/design/chat
POST /api/design/failure-simulation
POST /api/interview/start
POST /api/interview/evaluate
POST /api/export/markdown
POST /api/export/sql
```

An ephemeral generation registry is allowed only while a request is active and must be bounded/expired; it is not persistence.

## Prompt-injection boundary

Treat system-design descriptions and existing design text as untrusted data:

- Put fixed instructions and user data in separate message/content parts.
- Delimit user data and explicitly label it as data, not instructions.
- Never place secrets, environment values, or raw server configuration in prompts.
- Allowlist expected output fields through JSON Schema.
- Reject requests seeking secrets, system prompts, command execution, or unrelated data access.
- Do not claim heuristic detection is a complete security boundary.
- Sanitize errors and logs; never log the API key or full sensitive prompt payloads.

## State and versioning model

Recommended keys:

```text
archai:v1:designs
archai:v1:versions
archai:v1:interviews
archai:v1:settings
archai:v1:drafts
archai:v1:recent
```

Each stored envelope should include `schemaVersion`, `updatedAt`, and `data`. A design contains domain data; versions contain snapshots plus change metadata. Keep a bounded number of versions per design and offer export before pruning.

Use Zustand for active state because the application has cross-route editing, autosave, command palette actions, and diagram state. Keep persistence in a separate adapter rather than using a store plugin as the only storage abstraction.

## Failure and traffic simulators

Use a hybrid approach:

- Deterministically traverse graph edges from the failed node to identify direct and downstream impact.
- Apply explicit resilience metadata (replicas, fallback, circuit breaker, queue buffering) to classify severity.
- Calculate traffic pressure from estimated capacity and scaling limits.
- Ask Gemini to explain impact, recovery, user experience, and improvements using the computed facts.
- Clearly label assumptions where node capacity is unknown.

This prevents visually impressive but inconsistent simulations.

## Testing priorities

1. Capacity formulas, units, rounding, and overflow boundaries.
2. AI schema and semantic validators, including broken edge references.
3. Storage corruption, unavailable storage, quota failure, schema migration.
4. Proposed architecture changes cannot mutate the design before confirmation.
5. SSE stage ordering, failure propagation, timeout, and cancellation.
6. Refresh persistence and import/export E2E flow.
7. Prompt-injection and oversized-input test cases.
8. Docker Compose smoke test without any database service.

## Key risks

| Risk | Mitigation |
|---|---|
| Nine model stages are slow/expensive | DAG execution, deterministic synthesis, caching, compact contexts |
| Large schema rejected by Gemini | Small per-stage schemas, semantic validation in Java |
| localStorage quota/corruption | bounded history, versioned envelopes, validation, fallback adapter |
| Hydration mismatch | client-only rehydration gate |
| Diagram JSON is valid but unsafe/inconsistent | domain validator before render/import/apply |
| Fake progress | backend-emitted stage events only |
| Modification destroys design | typed proposed diff + explicit confirmation + version snapshot |
| API key leakage | backend-only environment variable, secret scanning, sanitized logs |

## Scope recommendation

The prompt describes a large product. For a credible portfolio build, complete a vertical slice before broadening:

- create design;
- deterministic estimation;
- staged Gemini generation with validation;
- interactive React Flow architecture;
- contextual assistant;
- proposed modification + confirmation + versioning;
- refresh persistence;
- failure and 10× traffic simulations;
- JSON/Markdown/SQL export;
- one interview flow;
- tests, Docker, CI, and polished README.

Add secondary tabs and extra examples only after this path is reliable.
