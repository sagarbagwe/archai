# ArchAI implementation plan

## Milestone 0 — Repository foundation

- Monorepo folders: `frontend/`, `backend/`, `docs/`.
- Root `.gitignore`, `.editorconfig`, `.env.example`, Compose file, Makefile or task scripts.
- Architecture decision records for no-auth/no-database, storage, AI provider, and streaming.
- CI skeleton for frontend and backend.

**Exit:** both applications build and health checks run locally and in CI.

## Milestone 1 — Domain contracts and deterministic estimation

- Define shared JSON contracts and examples.
- Implement Java request DTO validation and standard error envelope.
- Implement capacity estimator with formulas and unit tests.
- Implement frontend new-design form and estimation preview.
- Implement versioned `StorageService` with in-memory fallback and corruption tests.

**Exit:** a design draft survives refresh and estimation is fully deterministic.

## Milestone 2 — Gemini vertical slice

- Add `LLMProvider` and `GeminiProvider`.
- Add provider configuration through `GEMINI_API_KEY` only.
- Implement requirements, architecture, and specialist stage schemas.
- Add parse, Bean Validation, domain validation, repair, bounded retry, timeout, and sanitized errors.
- Add SSE stage events and cancellation.

**Exit:** the payment demo generates a validated design and UI progress reflects real backend stages.

## Milestone 3 — Design workspace

- Overview, requirements, estimation, and architecture tabs.
- Controlled React Flow graph with custom typed nodes, minimap, controls, fit view, add/delete/connect/edit.
- Node details panel and contextual AI question action.
- Autosave with debouncing and storage-failure feedback.

**Exit:** users can inspect and manually edit a generated architecture, refresh, and continue.

## Milestone 4 — Safe AI modifications and versions

- Typed architecture change-set contract.
- Before/after/impact confirmation UI.
- Validate and apply only after confirmation.
- Snapshot significant changes to bounded version history.
- Compare and restore versions.

**Exit:** “Add Redis caching” produces a reviewable proposal and Version 2 only after Apply.

## Milestone 5 — Simulators and deep design tabs

- Deterministic graph impact traversal for failures.
- Traffic multiplier calculations and bottleneck heuristics.
- Gemini explanations grounded in computed results.
- API, database/ER, caching, messaging, reliability, security, observability, and trade-off views.

**Exit:** PostgreSQL failure and 10× traffic demo paths produce consistent, explainable results.

## Milestone 6 — Interview and export

- Stateless interview endpoints; client stores transcript/history.
- Scored rubric and follow-up questions.
- Validated JSON import/export.
- Markdown and SQL export through backend.
- PNG/SVG architecture export in browser.

**Exit:** the core interview flow and all required non-PDF exports work.

## Milestone 7 — Hardening and portfolio polish

- Rate limits, request size limits, CORS, secure headers, injection heuristics.
- Error/empty/loading states and accessibility pass.
- Keyboard shortcuts and command palette.
- Responsive desktop/tablet/mobile behavior.
- Unit, component, integration, and Playwright E2E coverage.
- Docker Compose verification and complete README.

**Exit:** the 22-step verification checklist passes and a clean clone runs with documented commands.

## First implementation issue-sized tasks

1. Scaffold Next.js frontend and Spring Boot backend.
2. Add health endpoints and Docker Compose.
3. Define `DesignRequest`, `SystemDesign`, `ArchitectureNode`, and `ArchitectureEdge` contracts.
4. Implement `CapacityEstimator` and tests.
5. Implement `StorageService` with migration/fallback tests.
6. Build new-design form and local draft persistence.
7. Implement `LLMProvider` and Gemini structured-output spike.
8. Implement architecture semantic validator.
9. Implement staged SSE orchestration.
10. Render validated architecture in React Flow.
