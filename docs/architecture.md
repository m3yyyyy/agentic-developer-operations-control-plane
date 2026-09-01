# Architecture decision record

## Context

Developer agents combine untrusted model output with tools that may have powerful side effects. A useful control plane must make agent intent visible, limit the number of reasoning/tool steps, evaluate capabilities through policy, pause sensitive actions, and retain evidence.

## Decision

RelayOps separates deterministic orchestration from optional model reasoning.

1. The domain state machine is the source of truth for run status.
2. The public dashboard talks only to an Express control-plane API.
3. The AI adapter receives a model through dependency injection; the default app never requires a provider key.
4. The MCP server exposes read-only context through stdio.
5. Sensitive capabilities are represented in the policy catalog but are either approval-gated simulations or unregistered blocks.
6. Server-sent events provide simple one-way live updates without adding a message broker to the reference implementation.
7. OpenTelemetry API spans create a vendor-neutral instrumentation seam.

## Invariants

- Unknown tools are denied.
- A run can be decided only once and only while `awaiting-approval`.
- Rejecting a proposal prevents validation and review.
- Approving a proposal completes simulation stages but performs no external mutation.
- Public UI data is synthetic and contains no credentials.
- The AI loop is capped at six steps.

## Why deterministic by default

A model-backed demo would require a provider account, cost controls, secret handling, and a stable deployment key. The deterministic state machine makes the project reproducible for reviewers while the `ToolLoopAgent` adapter still demonstrates the official integration boundary.

## Scaling path

A production implementation would replace the in-memory store with PostgreSQL, publish events through a durable queue, run agents in isolated workers, use signed and expiring approvals, apply tenant-scoped authorization, connect an external policy decision point, and export traces through an OpenTelemetry SDK and collector.

