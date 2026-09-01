import type { RepositorySnapshot, ToolPolicy } from './types.js';

export const repositories: RepositorySnapshot[] = [
  {
    id: 'repo-checkout-api',
    name: 'checkout-api',
    language: 'TypeScript',
    defaultBranch: 'main',
    health: 'attention',
    openPullRequests: 4,
    checksPassing: 7,
    checksTotal: 8,
    lastActivity: '4 minutes ago',
    riskSignal: 'Flaky integration test on payment retry path',
  },
  {
    id: 'repo-edge-gateway',
    name: 'edge-gateway',
    language: 'Rust',
    defaultBranch: 'main',
    health: 'healthy',
    openPullRequests: 2,
    checksPassing: 12,
    checksTotal: 12,
    lastActivity: '18 minutes ago',
    riskSignal: 'No active risk signals',
  },
  {
    id: 'repo-platform-console',
    name: 'platform-console',
    language: 'React',
    defaultBranch: 'main',
    health: 'attention',
    openPullRequests: 7,
    checksPassing: 9,
    checksTotal: 10,
    lastActivity: '31 minutes ago',
    riskSignal: 'Accessibility regression in navigation dialog',
  },
];

export const toolPolicies: ToolPolicy[] = [
  {
    id: 'inspect_repository',
    label: 'Inspect repository snapshot',
    access: 'read-only',
    scope: 'Synthetic metadata only',
    reason: 'No filesystem or credential access.',
  },
  {
    id: 'read_ci_status',
    label: 'Read CI status',
    access: 'read-only',
    scope: 'Stored demo checks',
    reason: 'Returns pre-generated validation evidence.',
  },
  {
    id: 'search_runbooks',
    label: 'Search runbook library',
    access: 'read-only',
    scope: 'Curated local guidance',
    reason: 'No external network requests.',
  },
  {
    id: 'propose_patch',
    label: 'Propose simulated patch',
    access: 'approval-required',
    scope: 'Isolated virtual worktree',
    reason: 'A human must approve before validation can continue.',
  },
  {
    id: 'execute_shell',
    label: 'Execute arbitrary shell',
    access: 'blocked',
    scope: 'Unavailable',
    reason: 'Uncontrolled command execution is not registered.',
  },
  {
    id: 'push_branch',
    label: 'Push branch',
    access: 'blocked',
    scope: 'Unavailable',
    reason: 'The public demo never mutates a real repository.',
  },
];

export const runbooks = [
  {
    id: 'rb-ci-flake',
    title: 'Intermittent CI failure triage',
    summary: 'Compare recent failures, isolate shared setup, then rerun the narrowest deterministic check.',
  },
  {
    id: 'rb-accessibility',
    title: 'Keyboard navigation regression',
    summary: 'Verify focus order, escape behavior, focus return, and accessible dialog naming.',
  },
  {
    id: 'rb-dependency',
    title: 'Dependency upgrade review',
    summary: 'Check release notes, lockfile delta, runtime compatibility, and rollback readiness.',
  },
];

