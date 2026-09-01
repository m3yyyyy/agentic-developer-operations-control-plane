import type { AgentRun, ControlPlaneSnapshot } from '../domain/types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function fetchControlPlane(): Promise<ControlPlaneSnapshot> {
  return request('/api/control-plane');
}

export function createRun(input: {
  repositoryId: string;
  objective: string;
  requestedBy: string;
}): Promise<AgentRun> {
  return request('/api/runs', { method: 'POST', body: JSON.stringify(input) });
}

export function decideRun(
  runId: string,
  input: { outcome: 'approved' | 'rejected'; reviewer: string; reason: string },
): Promise<AgentRun> {
  return request(`/api/runs/${runId}/decisions`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

