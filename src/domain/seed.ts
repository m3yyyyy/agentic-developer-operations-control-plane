import type { AgentRun, AuditEvent } from './types.js';

const now = new Date();

function minutesAgo(minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

export const seededRuns: AgentRun[] = [
  {
    id: 'run-042',
    repositoryId: 'repo-checkout-api',
    title: 'Stabilize payment retry integration test',
    objective: 'Identify the nondeterministic fixture and propose the smallest safe correction.',
    status: 'awaiting-approval',
    risk: 'medium',
    createdAt: minutesAgo(12),
    updatedAt: minutesAgo(5),
    requestedBy: 'Platform Engineering',
    worktree: 'sim://worktrees/run-042',
    proposedChange: 'Reset the retry clock in beforeEach and replace the shared payment fixture with a per-test factory.',
    validationPlan: ['Typecheck affected package', 'Run payment retry test 20 times', 'Run checkout API integration suite'],
    stages: [
      { id: 'context', label: 'Collect context', owner: 'Scout agent', status: 'complete', detail: 'Repository and CI snapshots loaded.' },
      { id: 'diagnosis', label: 'Diagnose failure', owner: 'Triage agent', status: 'complete', detail: 'Shared clock state identified as the likely trigger.' },
      { id: 'proposal', label: 'Draft change', owner: 'Patch agent', status: 'complete', detail: 'A simulated two-file patch is ready for review.' },
      { id: 'approval', label: 'Human approval', owner: 'On-call reviewer', status: 'active', detail: 'Waiting for an explicit approve or reject decision.' },
      { id: 'validation', label: 'Validate proposal', owner: 'Test agent', status: 'pending', detail: 'Validation remains paused.' },
      { id: 'review', label: 'Review evidence', owner: 'Review agent', status: 'pending', detail: 'No final recommendation yet.' },
    ],
  },
  {
    id: 'run-041',
    repositoryId: 'repo-platform-console',
    title: 'Review keyboard navigation regression',
    objective: 'Restore focus behavior in the command palette without changing the public API.',
    status: 'completed',
    risk: 'low',
    createdAt: minutesAgo(74),
    updatedAt: minutesAgo(46),
    requestedBy: 'Developer Experience',
    worktree: 'sim://worktrees/run-041',
    proposedChange: 'Return focus to the invoking button after the dialog closes.',
    validationPlan: ['Keyboard-only interaction check', 'Accessibility test suite', 'Component typecheck'],
    decision: {
      outcome: 'approved',
      reviewer: 'A. Rahman',
      reason: 'Scoped change with complete accessibility evidence.',
      decidedAt: minutesAgo(51),
    },
    stages: [
      { id: 'context', label: 'Collect context', owner: 'Scout agent', status: 'complete', detail: 'Component contract loaded.' },
      { id: 'diagnosis', label: 'Diagnose failure', owner: 'Triage agent', status: 'complete', detail: 'Missing focus restoration confirmed.' },
      { id: 'proposal', label: 'Draft change', owner: 'Patch agent', status: 'complete', detail: 'Simulated one-file patch drafted.' },
      { id: 'approval', label: 'Human approval', owner: 'A. Rahman', status: 'complete', detail: 'Proposal approved.' },
      { id: 'validation', label: 'Validate proposal', owner: 'Test agent', status: 'complete', detail: 'All simulated checks passed.' },
      { id: 'review', label: 'Review evidence', owner: 'Review agent', status: 'complete', detail: 'Evidence package accepted.' },
    ],
  },
  {
    id: 'run-040',
    repositoryId: 'repo-edge-gateway',
    title: 'Rotate production signing key',
    objective: 'Replace a production credential from an autonomous workflow.',
    status: 'blocked',
    risk: 'high',
    createdAt: minutesAgo(103),
    updatedAt: minutesAgo(102),
    requestedBy: 'Automated request',
    worktree: 'none',
    proposedChange: 'No proposal created.',
    validationPlan: [],
    stages: [
      { id: 'context', label: 'Collect context', owner: 'Policy engine', status: 'blocked', detail: 'Secrets and production mutations are outside the demo boundary.' },
      { id: 'diagnosis', label: 'Diagnose failure', owner: 'Triage agent', status: 'blocked', detail: 'Execution stopped before context access.' },
      { id: 'proposal', label: 'Draft change', owner: 'Patch agent', status: 'blocked', detail: 'No patch permitted.' },
      { id: 'approval', label: 'Human approval', owner: 'Security owner', status: 'blocked', detail: 'This action cannot be enabled by approval.' },
      { id: 'validation', label: 'Validate proposal', owner: 'Test agent', status: 'blocked', detail: 'No validation applicable.' },
      { id: 'review', label: 'Review evidence', owner: 'Review agent', status: 'blocked', detail: 'Policy block is the final result.' },
    ],
  },
];

export const seededEvents: AuditEvent[] = [
  { id: 'evt-105', runId: 'run-042', kind: 'approval.requested', actor: 'Policy engine', message: 'Human approval requested for propose_patch.', timestamp: minutesAgo(5) },
  { id: 'evt-104', runId: 'run-042', kind: 'stage.completed', actor: 'Patch agent', message: 'Simulated patch and validation plan prepared.', timestamp: minutesAgo(6) },
  { id: 'evt-103', runId: 'run-041', kind: 'approval.decided', actor: 'A. Rahman', message: 'Proposal approved after evidence review.', timestamp: minutesAgo(51) },
  { id: 'evt-102', runId: 'run-041', kind: 'stage.completed', actor: 'Review agent', message: 'Simulation completed with all checks passing.', timestamp: minutesAgo(46) },
  { id: 'evt-101', runId: 'run-040', kind: 'policy.blocked', actor: 'Policy engine', message: 'Production credential mutation denied by policy.', timestamp: minutesAgo(102) },
];

