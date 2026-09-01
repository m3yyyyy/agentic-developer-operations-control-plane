#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { repositories, runbooks } from '../domain/catalog.js';
import { controlPlaneStore } from '../domain/store.js';

const server = new McpServer({
  name: 'relayops-control-plane',
  version: '0.1.0',
});

server.registerTool(
  'list_repositories',
  {
    description: 'List the synthetic repositories available to the safe demo.',
    outputSchema: { repositories: z.array(z.object({ id: z.string(), name: z.string(), health: z.string() })) },
  },
  async () => {
    const structuredContent = {
      repositories: repositories.map(({ id, name, health }) => ({ id, name, health })),
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(structuredContent, null, 2) }],
      structuredContent,
    };
  },
);

server.registerTool(
  'inspect_run',
  {
    description: 'Inspect an existing simulated agent run and its approval state.',
    inputSchema: { runId: z.string() },
  },
  async ({ runId }) => {
    const run = controlPlaneStore.getRun(runId);
    return {
      content: [{ type: 'text', text: JSON.stringify(run ?? { status: 'not-found' }, null, 2) }],
      isError: !run,
    };
  },
);

server.registerTool(
  'search_runbooks',
  {
    description: 'Search the curated read-only operations runbook library.',
    inputSchema: { query: z.string().min(2) },
  },
  async ({ query }) => {
    const normalized = query.toLowerCase();
    const matches = runbooks.filter((runbook) =>
      `${runbook.title} ${runbook.summary}`.toLowerCase().includes(normalized),
    );
    return { content: [{ type: 'text', text: JSON.stringify({ count: matches.length, matches }, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('RelayOps MCP server is running on stdio.');

