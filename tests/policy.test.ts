import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateToolAccess } from '../src/domain/policy.js';

test('read-only tools are allowed without approval', () => {
  assert.deepEqual(evaluateToolAccess('inspect_repository'), {
    allowed: true,
    access: 'read-only',
    requiresApproval: false,
    reason: 'No filesystem or credential access.',
  });
});

test('sensitive simulated tools require approval', () => {
  const decision = evaluateToolAccess('propose_patch');
  assert.equal(decision.allowed, true);
  assert.equal(decision.requiresApproval, true);
  assert.equal(decision.access, 'approval-required');
});

test('blocked and unknown tools fail closed', () => {
  assert.equal(evaluateToolAccess('execute_shell').allowed, false);
  assert.deepEqual(evaluateToolAccess('unregistered_tool'), {
    allowed: false,
    access: 'blocked',
    requiresApproval: false,
    reason: 'Unknown tools fail closed.',
  });
});

