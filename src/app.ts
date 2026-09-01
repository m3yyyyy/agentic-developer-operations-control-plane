import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { controlPlaneStore } from './domain/store.js';

const createRunSchema = z.object({
  repositoryId: z.string().min(1),
  objective: z.string().trim().min(12).max(240),
  requestedBy: z.string().trim().min(2).max(80),
});

const decisionSchema = z.object({
  outcome: z.enum(['approved', 'rejected']),
  reviewer: z.string().trim().min(2).max(80),
  reason: z.string().trim().min(8).max(240),
});

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use((_request, response, next) => {
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; frame-ancestors 'none'");
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'relayops-control-plane', mode: 'safe-simulation' });
  });

  app.get('/api/control-plane', (_request, response) => {
    response.json(controlPlaneStore.snapshot());
  });

  app.get('/api/runs/:runId', (request, response) => {
    const run = controlPlaneStore.getRun(request.params.runId);
    if (!run) {
      response.status(404).json({ error: 'Run not found.' });
      return;
    }
    response.json(run);
  });

  app.post('/api/runs', (request, response, next) => {
    try {
      const input = createRunSchema.parse(request.body);
      response.status(201).json(controlPlaneStore.createRun(input));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/runs/:runId/decisions', (request, response, next) => {
    try {
      const input = decisionSchema.parse(request.body);
      response.json(controlPlaneStore.decideRun(request.params.runId, input));
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/events', (request, response) => {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();
    response.write(`event: ready\ndata: ${JSON.stringify({ connectedAt: new Date().toISOString() })}\n\n`);

    const unsubscribe = controlPlaneStore.subscribe((event) => {
      response.write(`event: audit\ndata: ${JSON.stringify(event)}\n\n`);
    });
    const heartbeat = setInterval(() => response.write(': heartbeat\n\n'), 20_000);

    request.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  });

  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const clientDirectory = path.resolve(currentDirectory, '../client');
  app.use(express.static(clientDirectory, { index: false }));
  app.get('/{*path}', (_request, response) => {
    response.sendFile(path.join(clientDirectory, 'index.html'));
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof z.ZodError) {
      response.status(400).json({ error: 'Invalid request.', issues: error.issues });
      return;
    }
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    const status = message.includes('not found') ? 404 : message.includes('awaiting approval') ? 409 : 400;
    response.status(status).json({ error: message });
  });

  return app;
}

