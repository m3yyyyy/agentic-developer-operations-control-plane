import assert from 'node:assert/strict';
import test from 'node:test';
import { ControlPlaneStore } from '../src/domain/store.js';

test('new runs stop at the human approval checkpoint', () => {
  const store = new ControlPlaneStore();
  const run = store.createRun({
    repositoryId: 'repo-checkout-api',
    objective: 'Investigate the flaky payment check with bounded evidence.',
    requestedBy: 'Test operator',
  });

  assert.equal(run.status, 'awaiting-approval');
  assert.equal(run.stages.find((stage) => stage.id === 'approval')?.status, 'active');
  assert.equal(run.stages.find((stage) => stage.id === 'validation')?.status, 'pending');
  assert.match(run.worktree, /^sim:\/\/worktrees\//);
});

test('approval completes validation without applying an external change', () => {
  const store = new ControlPlaneStore();
  const run = store.createRun({
    repositoryId: 'repo-platform-console',
    objective: 'Propose an accessible focus restoration correction.',
    requestedBy: 'Test operator',
  });
  const completed = store.decideRun(run.id, {
    outcome: 'approved',
    reviewer: 'Security reviewer',
    reason: 'The proposal is scoped and remains a simulation.',
  });

  assert.equal(completed.status, 'completed');
  assert.equal(completed.decision?.outcome, 'approved');
  assert.equal(completed.stages.find((stage) => stage.id === 'review')?.status, 'complete');
  assert.match(completed.worktree, /^sim:/);
});

test('rejection stops validation and cannot be replayed', () => {
  const store = new ControlPlaneStore();
  const run = store.createRun({
    repositoryId: 'repo-edge-gateway',
    objective: 'Review the repository health using read-only evidence.',
    requestedBy: 'Test operator',
  });
  const rejected = store.decideRun(run.id, {
    outcome: 'rejected',
    reviewer: 'Security reviewer',
    reason: 'Additional evidence is required before continuing.',
  });

  assert.equal(rejected.status, 'rejected');
  assert.equal(rejected.stages.find((stage) => stage.id === 'validation')?.status, 'blocked');
  assert.throws(
    () => store.decideRun(run.id, { outcome: 'approved', reviewer: 'Reviewer', reason: 'Try again later.' }),
    /awaiting approval/,
  );
});

test('audit subscribers receive newly created events', () => {
  const store = new ControlPlaneStore();
  const observed: string[] = [];
  const unsubscribe = store.subscribe((event) => observed.push(event.kind));

  store.createRun({
    repositoryId: 'repo-checkout-api',
    objective: 'Create an auditable safe simulation for the active risk.',
    requestedBy: 'Test operator',
  });
  unsubscribe();

  assert.deepEqual(observed, ['run.created', 'approval.requested']);
});

