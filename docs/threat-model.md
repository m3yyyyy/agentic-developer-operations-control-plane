# Threat model

## Assets

- repository contents and write access;
- CI/CD and cloud credentials;
- human approval decisions;
- agent prompts, tool inputs, and evidence;
- audit history and trace correlation.

## Trust boundaries

| Boundary | Current demo control | Production requirement |
| --- | --- | --- |
| Browser → API | Schema validation and same-origin deployment | Authentication, authorization, CSRF protection, rate limits |
| Model → tools | Allowlist, step cap, approval policy | Signed approvals, input provenance, tool identity, replay prevention |
| Agent → repository | Synthetic catalog and virtual worktree URI | Ephemeral sandbox, scoped Git token, branch rules, egress restrictions |
| Process → data | In-memory records | Durable encrypted database, tenant isolation, retention policy |
| Telemetry → backend | OpenTelemetry API seam | SDK exporter, collector authentication, sensitive-data filtering |

## Key threats and mitigations

### Prompt injection requests a dangerous tool

The tool is unavailable unless registered. Unknown tool IDs fail closed. The public demo registers no shell or Git mutation capability.

### A client forges an approval

The demo validates state and request shape on the server but has no authentication, so it must not control real side effects. A production version must authenticate the reviewer and cryptographically bind the decision to the exact tool name, call ID, input, run, tenant, and expiry.

### Approval is replayed

A run leaves `awaiting-approval` after the first decision, and later decisions return a conflict. Production should also use a one-time nonce in a durable transaction.

### Agent loops indefinitely

The optional AI adapter uses `isStepCount(6)`. Production should additionally enforce time, token, cost, and tool-call budgets.

### A simulated boundary is mistaken for enforcement

The dashboard, API health response, README, and result evidence label the mode as `safe-simulation`. Approval never claims that a real change was applied.

