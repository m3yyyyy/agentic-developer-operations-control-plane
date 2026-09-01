export type RunStatus =
  | 'planning'
  | 'awaiting-approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'blocked';

export type StageStatus = 'pending' | 'active' | 'complete' | 'blocked';

export type ToolAccess = 'read-only' | 'approval-required' | 'blocked';

export interface RepositorySnapshot {
  id: string;
  name: string;
  language: string;
  defaultBranch: string;
  health: 'healthy' | 'attention';
  openPullRequests: number;
  checksPassing: number;
  checksTotal: number;
  lastActivity: string;
  riskSignal: string;
}

export interface ToolPolicy {
  id: string;
  label: string;
  access: ToolAccess;
  scope: string;
  reason: string;
}

export interface RunStage {
  id: 'context' | 'diagnosis' | 'proposal' | 'approval' | 'validation' | 'review';
  label: string;
  owner: string;
  status: StageStatus;
  detail: string;
}

export interface AgentRun {
  id: string;
  repositoryId: string;
  title: string;
  objective: string;
  status: RunStatus;
  risk: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
  worktree: string;
  proposedChange: string;
  validationPlan: string[];
  stages: RunStage[];
  decision?: {
    outcome: 'approved' | 'rejected';
    reviewer: string;
    reason: string;
    decidedAt: string;
  };
}

export interface AuditEvent {
  id: string;
  runId: string | null;
  kind: 'run.created' | 'stage.completed' | 'approval.requested' | 'approval.decided' | 'policy.blocked';
  actor: string;
  message: string;
  timestamp: string;
}

export interface ControlPlaneSnapshot {
  generatedAt: string;
  mode: 'safe-simulation';
  repositories: RepositorySnapshot[];
  tools: ToolPolicy[];
  runs: AgentRun[];
  events: AuditEvent[];
  metrics: {
    activeRuns: number;
    awaitingApproval: number;
    policyBlocks: number;
    successfulSimulations: number;
  };
}

