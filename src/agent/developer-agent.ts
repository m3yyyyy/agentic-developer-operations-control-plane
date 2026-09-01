import { ToolLoopAgent, isStepCount, tool, type LanguageModel } from 'ai';
import { z } from 'zod';
import { repositories, runbooks } from '../domain/catalog.js';

/**
 * Creates an optional live AI agent while keeping model selection outside the
 * repository. The deployed demo uses the deterministic control-plane simulator,
 * so it needs no provider key and cannot alter a real checkout.
 */
export function createDeveloperOperationsAgent(model: LanguageModel) {
  const tools = {
    inspectRepository: tool({
      description: 'Read a synthetic repository snapshot from the safe demo catalog.',
      inputSchema: z.object({ repositoryId: z.string() }),
      execute: async ({ repositoryId }) =>
        repositories.find((repository) => repository.id === repositoryId) ?? {
          status: 'not-found',
        },
    }),
    searchRunbooks: tool({
      description: 'Search curated read-only operational runbooks.',
      inputSchema: z.object({ query: z.string().min(2) }),
      execute: async ({ query }) => {
        const normalized = query.toLowerCase();
        return runbooks.filter((runbook) =>
          `${runbook.title} ${runbook.summary}`.toLowerCase().includes(normalized),
        );
      },
    }),
    proposePatch: tool({
      description: 'Return a simulated patch proposal. Never writes to a filesystem.',
      inputSchema: z.object({ repositoryId: z.string(), summary: z.string().min(8) }),
      execute: async ({ repositoryId, summary }) => ({
        repositoryId,
        summary,
        applied: false,
        location: `sim://worktrees/${repositoryId}`,
      }),
    }),
  };

  return new ToolLoopAgent({
    model,
    instructions: `You are a developer-operations planning agent.
Use only the synthetic context exposed by the tools.
Never claim that a simulated proposal changed a real repository.
Stop if a tool is denied and do not retry it.
Prefer the smallest testable proposal and explain the evidence needed.`,
    tools,
    stopWhen: isStepCount(6),
    toolApproval: {
      proposePatch: 'user-approval',
    },
  });
}

