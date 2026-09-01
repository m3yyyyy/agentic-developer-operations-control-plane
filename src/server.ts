import { createApp } from './app.js';

const port = Number.parseInt(process.env.PORT ?? '3100', 10);
const app = createApp();

app.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'server.started',
    port,
    mode: 'safe-simulation',
  }));
});

