import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { trace } from '@opentelemetry/api';
import { repositories, toolPolicies } from './catalog.js';
import { seededEvents, seededRuns } from './seed.js';
import type { AgentRun, AuditEvent, ControlPlaneSnapshot, RunStage } from './types.js';

const tracer = trace.getTracer('relayops-control-plane');

function clone<T>(value: T): T {
  return structuredClone(value);
}

function nextStages(): RunStage[] {
  return [
    { id: 'context', label: 'Collect context', owner: 'Scout agent', status: 'complete', detail: 'Synthetic repository and CI snapshots loaded.' },
    { id: 'diagnosis', label: 'Diagnose failure', owner: 'Triage agent', status: 'complete', detail: 'A bounded diagnostic hypothesis was created.' },
    { id: 'proposal', label: 'Draft change', owner: 'Patch agent', status: 'complete', detail: 'A simulated patch proposal is ready.' },
    { id: 'approval', label: 'Human approval', owner: 'On-call reviewer', status: 'active', detail: 'Waiting for an explicit decision.' },
    { id: 'validation', label: 'Validate proposal', owner: 'Test agent', status: 'pending', detail: 'Validation is paused until approval.' },
    { id: 'review', label: 'Review evidence', owner: 'Review agent', status: 'pending', detail: 'Final review has not started.' },
  ];
}

export class ControlPlaneStore {
  private readonly runs = clone(seededRuns);
  private readonly events = clone(seededEvents);
  private readonly emitter = new EventEmitter();

  snapshot(): ControlPlaneSnapshot {
    const policyBlocks = this.events.filter((event) => event.kind === 'policy.blocked').length;

    return {
      generatedAt: new Date().toISOString(),
      mode: 'safe-simulation',
      repositories: clone(repositories),
      tools: clone(toolPolicies),
      runs: clone(this.runs),
      events: clone(this.events.slice(0, 30)),
      metrics: {
        activeRuns: this.runs.filter((run) => ['planning', 'awaiting-approval', 'approved'].includes(run.status)).length,
        awaitingApproval: this.runs.filter((run) => run.status === 'awaiting-approval').length,
        policyBlocks,
        successfulSimulations: this.runs.filter((run) => run.status === 'completed').length,
      },
    };
  }

  getRun(runId: string): AgentRun | undefined {
    const run = this.runs.find((candidate) => candidate.id === runId);
    return run ? clone(run) : undefined;
  }

  createRun(input: { repositoryId: string; objective: string; requestedBy: string }): AgentRun {
    return tracer.startActiveSpan('control-plane.create-run', (span) => {
      try {
        const repository = repositories.find((candidate) => candidate.id === input.repositoryId);
        if (!repository) {
          throw new Error('Repository is not available in the simulation catalog.');
        }

        const createdAt = new Date().toISOString();
        const shortId = randomUUID().slice(0, 8);
        const run: AgentRun = {
          id: `run-${shortId}`,
          repositoryId: repository.id,
          title: `Investigate ${repository.name}`,
          objective: input.objective,
          status: 'awaiting-approval',
          risk: repository.health === 'attention' ? 'medium' : 'low',
          createdAt,
          updatedAt: createdAt,
          requestedBy: input.requestedBy,
          worktree: `sim://worktrees/${shortId}`,
          proposedChange: `Create a minimal simulated correction for: ${repository.riskSignal}.`,
          validationPlan: ['Typecheck affected scope', 'Run targeted tests', 'Review the evidence summary'],
          stages: nextStages(),
        };

        this.runs.unshift(run);
        this.record({ runId: run.id, kind: 'run.created', actor: input.requestedBy, message: `Run created for ${repository.name}.` });
        this.record({ runId: run.id, kind: 'approval.requested', actor: 'Policy engine', message: 'Human approval requested for propose_patch.' });
        span.setAttribute('run.id', run.id);
        span.setAttribute('repository.id', repository.id);
        return clone(run);
      } finally {
        span.end();
      }
    });
  }

  decideRun(runId: string, input: { outcome: 'approved' | 'rejected'; reviewer: string; reason: string }): AgentRun {
    return tracer.startActiveSpan('control-plane.decide-run', (span) => {
      try {
        const run = this.runs.find((candidate) => candidate.id === runId);
        if (!run) {
          throw new Error('Run not found.');
        }
        if (run.status !== 'awaiting-approval') {
          throw new Error('Only runs awaiting approval can receive a decision.');
        }

        const decidedAt = new Date().toISOString();
        run.decision = { ...input, decidedAt };
        run.updatedAt = decidedAt;
        const approvalStage = run.stages.find((stage) => stage.id === 'approval');
        if (approvalStage) {
          approvalStage.status = 'complete';
          approvalStage.owner = input.reviewer;
          approvalStage.detail = input.outcome === 'approved' ? 'Proposal approved for simulated validation.' : 'Proposal rejected; no changes were applied.';
        }

        if (input.outcome === 'approved') {
          run.status = 'completed';
          for (const stage of run.stages.filter((candidate) => ['validation', 'review'].includes(candidate.id))) {
            stage.status = 'complete';
            stage.detail = stage.id === 'validation'
              ? 'All simulated validation checks passed.'
              : 'Evidence reviewed; the run changed no external systems.';
          }
        } else {
          run.status = 'rejected';
          for (const stage of run.stages.filter((candidate) => ['validation', 'review'].includes(candidate.id))) {
            stage.status = 'blocked';
            stage.detail = 'Skipped after the human rejection.';
          }
        }

        this.record({
          runId: run.id,
          kind: 'approval.decided',
          actor: input.reviewer,
          message: `Proposal ${input.outcome}: ${input.reason}`,
        });
        span.setAttribute('run.id', run.id);
        span.setAttribute('decision.outcome', input.outcome);
        return clone(run);
      } finally {
        span.end();
      }
    });
  }

  subscribe(listener: (event: AuditEvent) => void): () => void {
    this.emitter.on('audit', listener);
    return () => this.emitter.off('audit', listener);
  }

  private record(input: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const event: AuditEvent = {
      ...input,
      id: `evt-${randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.unshift(event);
    this.emitter.emit('audit', clone(event));
  }
}

export const controlPlaneStore = new ControlPlaneStore();

