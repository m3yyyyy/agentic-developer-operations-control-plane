import { toolPolicies } from './catalog.js';
import type { ToolAccess } from './types.js';

export interface PolicyDecision {
  allowed: boolean;
  access: ToolAccess;
  requiresApproval: boolean;
  reason: string;
}

export function evaluateToolAccess(toolId: string): PolicyDecision {
  const policy = toolPolicies.find((candidate) => candidate.id === toolId);

  if (!policy) {
    return {
      allowed: false,
      access: 'blocked',
      requiresApproval: false,
      reason: 'Unknown tools fail closed.',
    };
  }

  return {
    allowed: policy.access !== 'blocked',
    access: policy.access,
    requiresApproval: policy.access === 'approval-required',
    reason: policy.reason,
  };
}

