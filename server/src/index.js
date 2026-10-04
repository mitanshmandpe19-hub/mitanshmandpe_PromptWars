import { config } from './config/index.js';
import { createApp } from './app.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(`[Blind Spot Backend] Server running on http://${config.host}:${config.port}`);
  console.log(`[Blind Spot Backend] Environment: ${config.nodeEnv}`);
  console.log(`[Blind Spot Backend] Model: ${config.geminiModel}`);
  console.log(
    `[Blind Spot Backend] GEMINI_API_KEY configured: ${config.isKeyConfigured} (length: ${config.keyLength})`,
  );

  if (!config.isKeyConfigured) {
    console.warn(
      '\n⚠️  [Blind Spot Backend] GEMINI_API_KEY is not set. Add it to .env or deployment environment variables and restart.\n',
    );
  }
});

// Graceful shutdown handling for Cloud Run / containers
const shutdown = (signal) => {
  console.log(`[Blind Spot Backend] Received ${signal}, gracefully shutting down...`);
  server.close(() => {
    console.log('[Blind Spot Backend] Closed all remaining connections. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
