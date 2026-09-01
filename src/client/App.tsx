import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ControlPlaneSnapshot } from '../domain/types';
import { createRun, decideRun, fetchControlPlane } from './api';
import { ActivityIcon, GridIcon, ShieldIcon } from './icons';
import { ApprovalPanel, ArchitectureCard, AuditFeed, Brand, Metrics, NewRunForm, PolicyMatrix, RepositoryGrid, RunDetail, RunQueue } from './components';

export function App() {
  const [snapshot, setSnapshot] = useState<ControlPlaneSnapshot | null>(null);
  const [selectedRunId, setSelectedRunId] = useState('run-042');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async () => {
    try {
      const nextSnapshot = await fetchControlPlane();
      setSnapshot(nextSnapshot);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the control plane.');
    }
  }, []);

  useEffect(() => {
    void loadSnapshot();
    const events = new EventSource('/api/events');
    events.addEventListener('audit', () => void loadSnapshot());
    events.onerror = () => setError('Live event stream disconnected. Reconnecting…');
    return () => events.close();
  }, [loadSnapshot]);

  const selectedRun = useMemo(
    () => snapshot?.runs.find((run) => run.id === selectedRunId) ?? snapshot?.runs[0],
    [selectedRunId, snapshot],
  );
  const selectedRepository = snapshot?.repositories.find((repository) => repository.id === selectedRun?.repositoryId);

  async function handleCreate(input: { repositoryId: string; objective: string; requestedBy: string }) {
    setBusy(true);
    setError(null);
    try {
      const run = await createRun(input);
      setSelectedRunId(run.id);
      await loadSnapshot();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create the run.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDecision(outcome: 'approved' | 'rejected', reviewer: string, reason: string) {
    if (!selectedRun) return;
    setBusy(true);
    setError(null);
    try {
      await decideRun(selectedRun.id, { outcome, reviewer, reason });
      await loadSnapshot();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not record the decision.');
    } finally {
      setBusy(false);
    }
  }

  if (!snapshot) {
    return <main className="loading-screen"><Brand /><div className="loading-bar"><span /></div><p>{error ?? 'Starting the safe simulation…'}</p></main>;
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Brand />
        <nav aria-label="Primary navigation"><a href="#overview"><GridIcon /> Overview</a><a href="#policies"><ShieldIcon /> Policies</a><a href="#audit"><ActivityIcon /> Audit</a></nav>
        <div className="header-status"><span><i /> System nominal</span><small>Safe simulation</small></div>
      </header>

      <main id="main-content">
        <section className="hero" id="overview">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Developer automation · governed</p>
            <h1>Agents coordinate.<br/><em>Humans authorize.</em></h1>
            <p>RelayOps demonstrates how autonomous developer workflows can inspect, plan, request approval, and produce evidence—without giving a public demo uncontrolled access.</p>
            <div className="hero-badges"><span><ShieldIcon /> Fail-closed policy</span><span><ActivityIcon /> Live run telemetry</span></div>
          </div>
          <div className="hero-visual" aria-label="Agent workflow illustration">
            <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
            <div className="core-node"><span className="brand-mark"><span/><span/><span/></span><strong>CONTROL<br/>PLANE</strong></div>
            <span className="agent-node agent-one">Scout</span><span className="agent-node agent-two">Patch</span><span className="agent-node agent-three">Review</span>
          </div>
        </section>

        <Metrics snapshot={snapshot} />
        {error && <div className="error-banner" role="alert">{error}</div>}

        <div className="workspace-grid">
          <RunQueue runs={snapshot.runs} selectedRunId={selectedRun?.id ?? ''} onSelect={setSelectedRunId} />
          {selectedRun && <RunDetail run={selectedRun} repository={selectedRepository} />}
          <div className="action-column">
            {selectedRun && <ApprovalPanel run={selectedRun} busy={busy} onDecision={handleDecision} />}
            <NewRunForm repositories={snapshot.repositories} busy={busy} onCreate={handleCreate} />
          </div>
        </div>

        <PolicyMatrix tools={snapshot.tools} />
        <RepositoryGrid repositories={snapshot.repositories} />
        <div className="bottom-grid"><AuditFeed events={snapshot.events} /><ArchitectureCard /></div>
      </main>

      <footer><Brand /><p>Production architecture patterns, safe simulation data.</p><span>RelayOps · Project 7</span></footer>
    </div>
  );
}

