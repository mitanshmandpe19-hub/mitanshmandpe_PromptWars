import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { createApp } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve .env path relative to project root
const projectRootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(projectRootEnvPath)) {
  dotenv.config({ path: projectRootEnvPath });
} else {
  dotenv.config(); // fallback to cwd
}

const rawApiKey = process.env.GEMINI_API_KEY;
const apiKey = rawApiKey?.trim();
const isKeyConfigured = Boolean(apiKey && apiKey.length > 0);
const keyLength = apiKey ? apiKey.length : 0;

const PORT = parseInt(process.env.PORT, 10) || 8080;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`[Blind Spot Backend] Server running on http://localhost:${PORT}`);
  console.log(`[Blind Spot Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Blind Spot Backend] Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log(`[Blind Spot Backend] GEMINI_API_KEY configured: ${isKeyConfigured} (length: ${keyLength})`);

  if (!isKeyConfigured) {
    console.warn('\n⚠️  [Blind Spot Backend] GEMINI_API_KEY is not set. Add it to .env and restart.\n');
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
