import { useState, type FormEvent, type ReactNode } from 'react';
import type { AgentRun, AuditEvent, ControlPlaneSnapshot, RepositorySnapshot, ToolPolicy } from '../domain/types';
import { ActivityIcon, ArrowIcon, CheckIcon, GitBranchIcon, LayersIcon, LockIcon, PlusIcon, RadioIcon, ShieldIcon, XIcon } from './icons';

export function Brand() {
  return (
    <div className="brand" aria-label="RelayOps home">
      <span className="brand-mark" aria-hidden="true"><span/><span/><span/></span>
      <span>Relay<span>Ops</span></span>
    </div>
  );
}

export function StatusPill({ status }: { status: AgentRun['status'] }) {
  return <span className={`status-pill status-${status}`}>{status.replace('-', ' ')}</span>;
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: ReactNode }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value.toString().padStart(2, '0')}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
}

export function Metrics({ snapshot }: { snapshot: ControlPlaneSnapshot }) {
  return (
    <div className="metrics-grid">
      <MetricCard label="Active runs" value={snapshot.metrics.activeRuns} detail="bounded workflows" icon={<ActivityIcon />} />
      <MetricCard label="Awaiting approval" value={snapshot.metrics.awaitingApproval} detail="human decisions" icon={<LockIcon />} />
      <MetricCard label="Policy blocks" value={snapshot.metrics.policyBlocks} detail="fail-closed events" icon={<ShieldIcon />} />
      <MetricCard label="Completed" value={snapshot.metrics.successfulSimulations} detail="safe simulations" icon={<CheckIcon />} />
    </div>
  );
}

export function RunQueue({ runs, selectedRunId, onSelect }: { runs: AgentRun[]; selectedRunId: string; onSelect: (id: string) => void }) {
  return (
    <section className="panel queue-panel" aria-labelledby="run-queue-title">
      <div className="panel-heading">
        <div><p className="eyebrow">Orchestration</p><h2 id="run-queue-title">Agent run queue</h2></div>
        <span className="live-indicator"><i /> Live</span>
      </div>
      <div className="run-list">
        {runs.map((run) => (
          <button key={run.id} type="button" className={`run-row ${selectedRunId === run.id ? 'selected' : ''}`} onClick={() => onSelect(run.id)}>
            <span className="run-icon"><GitBranchIcon /></span>
            <span className="run-copy">
              <span className="run-topline"><strong>{run.title}</strong><StatusPill status={run.status} /></span>
              <span>{run.id} · {run.requestedBy}</span>
            </span>
            <ArrowIcon className="row-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function RunDetail({ run, repository }: { run: AgentRun; repository?: RepositorySnapshot }) {
  return (
    <section className="panel detail-panel" aria-labelledby="run-detail-title">
      <div className="panel-heading detail-heading">
        <div>
          <p className="eyebrow">Selected run · {run.id}</p>
          <h2 id="run-detail-title">{run.title}</h2>
        </div>
        <StatusPill status={run.status} />
      </div>
      <div className="run-context">
        <div><span>Repository</span><strong>{repository?.name ?? run.repositoryId}</strong></div>
        <div><span>Risk</span><strong className={`risk-${run.risk}`}>{run.risk}</strong></div>
        <div><span>Isolation</span><strong>{run.worktree}</strong></div>
      </div>
      <p className="objective">{run.objective}</p>
      <div className="timeline" aria-label="Run stages">
        {run.stages.map((stage, index) => (
          <div className={`timeline-step stage-${stage.status}`} key={stage.id}>
            <div className="timeline-rail"><span>{stage.status === 'complete' ? <CheckIcon /> : index + 1}</span><i /></div>
            <div><p>{stage.owner}</p><h3>{stage.label}</h3><span>{stage.detail}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ApprovalPanel({ run, busy, onDecision }: {
  run: AgentRun;
  busy: boolean;
  onDecision: (outcome: 'approved' | 'rejected', reviewer: string, reason: string) => Promise<void>;
}) {
  const [reviewer, setReviewer] = useState('Portfolio reviewer');
  const [reason, setReason] = useState('Scoped simulation with a clear validation plan.');

  async function submit(outcome: 'approved' | 'rejected') {
    await onDecision(outcome, reviewer, reason);
  }

  if (run.status !== 'awaiting-approval') {
    return (
      <section className="panel decision-panel" aria-labelledby="decision-title">
        <div className="decision-result">
          {run.status === 'completed' ? <CheckIcon /> : <XIcon />}
          <div><p className="eyebrow">Decision recorded</p><h2 id="decision-title">{run.decision?.outcome ?? run.status}</h2><span>{run.decision?.reason ?? 'No human decision was required.'}</span></div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel decision-panel attention" aria-labelledby="decision-title">
      <div className="panel-heading">
        <div><p className="eyebrow">Human checkpoint</p><h2 id="decision-title">Review proposed change</h2></div>
        <LockIcon />
      </div>
      <div className="proposal-box"><span>Simulated proposal</span><p>{run.proposedChange}</p></div>
      <div className="validation-list"><span>Validation after approval</span>{run.validationPlan.map((item) => <p key={item}><CheckIcon />{item}</p>)}</div>
      <label>Reviewer<input value={reviewer} onChange={(event) => setReviewer(event.target.value)} /></label>
      <label>Decision reason<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <div className="decision-actions">
        <button className="button secondary" type="button" disabled={busy} onClick={() => void submit('rejected')}><XIcon /> Reject</button>
        <button className="button primary" type="button" disabled={busy} onClick={() => void submit('approved')}><CheckIcon /> Approve simulation</button>
      </div>
      <p className="safety-note"><ShieldIcon /> Approval continues a simulation only. No repository is changed.</p>
    </section>
  );
}

export function NewRunForm({ repositories, busy, onCreate }: {
  repositories: RepositorySnapshot[];
  busy: boolean;
  onCreate: (input: { repositoryId: string; objective: string; requestedBy: string }) => Promise<void>;
}) {
  const [repositoryId, setRepositoryId] = useState(repositories[0]?.id ?? '');
  const [objective, setObjective] = useState('Investigate the current risk signal and propose the smallest safe correction.');

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onCreate({ repositoryId, objective, requestedBy: 'Dashboard operator' });
  }

  return (
    <section className="panel create-panel" aria-labelledby="new-run-title">
      <div className="panel-heading">
        <div><p className="eyebrow">New simulation</p><h2 id="new-run-title">Launch a bounded run</h2></div>
        <PlusIcon />
      </div>
      <form onSubmit={(event) => void submit(event)}>
        <label>Repository<select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)}>{repositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.name}</option>)}</select></label>
        <label>Objective<textarea rows={4} minLength={12} maxLength={240} value={objective} onChange={(event) => setObjective(event.target.value)} /></label>
        <button className="button primary full" disabled={busy} type="submit"><ActivityIcon /> Create safe run</button>
      </form>
    </section>
  );
}

function AccessBadge({ access }: { access: ToolPolicy['access'] }) {
  return <span className={`access-badge access-${access}`}>{access.replace('-', ' ')}</span>;
}

export function PolicyMatrix({ tools }: { tools: ToolPolicy[] }) {
  return (
    <section className="panel wide-panel" id="policies" aria-labelledby="policy-title">
      <div className="panel-heading">
        <div><p className="eyebrow">Policy as code</p><h2 id="policy-title">Tool access matrix</h2></div>
        <ShieldIcon />
      </div>
      <div className="tool-table" role="table" aria-label="Tool access policy">
        <div className="tool-table-head" role="row"><span>Capability</span><span>Access</span><span>Boundary</span><span>Policy reason</span></div>
        {tools.map((toolPolicy) => (
          <div className="tool-table-row" role="row" key={toolPolicy.id}>
            <div><code>{toolPolicy.id}</code><strong>{toolPolicy.label}</strong></div>
            <AccessBadge access={toolPolicy.access} />
            <span>{toolPolicy.scope}</span>
            <span>{toolPolicy.reason}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RepositoryGrid({ repositories }: { repositories: RepositorySnapshot[] }) {
  return (
    <section className="wide-section" id="repositories" aria-labelledby="repositories-title">
      <div className="section-heading"><div><p className="eyebrow">Simulation catalog</p><h2 id="repositories-title">Repository fleet</h2></div><span>Read-only synthetic data</span></div>
      <div className="repository-grid">
        {repositories.map((repository) => (
          <article className="repository-card" key={repository.id}>
            <div className="repository-top"><span className="repo-symbol"><LayersIcon /></span><span className={`health-dot health-${repository.health}`}>{repository.health}</span></div>
            <h3>{repository.name}</h3><p>{repository.riskSignal}</p>
            <div className="repository-meta"><span>{repository.language}</span><span>{repository.defaultBranch}</span><span>{repository.checksPassing}/{repository.checksTotal} checks</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AuditFeed({ events }: { events: AuditEvent[] }) {
  return (
    <section className="panel feed-panel" id="audit" aria-labelledby="audit-title">
      <div className="panel-heading"><div><p className="eyebrow">Immutable evidence</p><h2 id="audit-title">Audit stream</h2></div><RadioIcon /></div>
      <div className="event-list">
        {events.map((event) => (
          <article key={event.id}><span className={`event-dot event-${event.kind.replace('.', '-')}`} /><div><p><strong>{event.actor}</strong><time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></p><span>{event.message}</span><code>{event.runId ?? 'control-plane'}</code></div></article>
        ))}
      </div>
    </section>
  );
}

export function ArchitectureCard() {
  return (
    <section className="panel architecture-panel" id="architecture" aria-labelledby="architecture-title">
      <div className="panel-heading"><div><p className="eyebrow">Implementation</p><h2 id="architecture-title">Built for controlled autonomy</h2></div><LayersIcon /></div>
      <div className="architecture-flow">
        <div><span>01</span><strong>Observe</strong><p>Read-only repository, CI, and runbook context.</p></div>
        <i />
        <div><span>02</span><strong>Propose</strong><p>Bounded planning in a virtual worktree.</p></div>
        <i />
        <div><span>03</span><strong>Authorize</strong><p>A human decides before sensitive tools continue.</p></div>
        <i />
        <div><span>04</span><strong>Evidence</strong><p>Every decision becomes an auditable event.</p></div>
      </div>
      <div className="architecture-tags"><span>AI SDK ToolLoopAgent</span><span>Model Context Protocol</span><span>OpenTelemetry API</span><span>Server-sent events</span><span>TypeScript</span></div>
    </section>
  );
}

