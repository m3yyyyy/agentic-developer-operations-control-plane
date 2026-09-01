# Security policy

## Supported version

The latest commit on `main` is supported.

## Safe-demo boundary

RelayOps ships with synthetic repositories and an in-memory event store. It does not execute shell commands, read local checkouts, use production credentials, or push branches. Unknown tools fail closed. The `propose_patch` capability returns a simulation artifact and requires an explicit human decision.

Do not connect this demo to production systems without adding authentication, durable server-side approval records, tenant isolation, scoped credentials, network egress controls, sandboxing, rate limits, and an external policy decision point.

## Reporting a vulnerability

Please open a private GitHub security advisory for the repository instead of a public issue. Include the affected component, reproduction steps, impact, and any suggested mitigation.

