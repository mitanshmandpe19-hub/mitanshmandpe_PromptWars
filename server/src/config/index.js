import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from project root if it exists
const projectRootEnvPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(projectRootEnvPath)) {
  dotenv.config({ path: projectRootEnvPath });
} else {
  dotenv.config();
}

const rawApiKey = process.env.GEMINI_API_KEY?.trim() || '';

/**
 * Validated server configuration object.
 */
export const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 8080,
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  geminiApiKey: rawApiKey,
  isKeyConfigured: Boolean(rawApiKey && rawApiKey.length > 0),
  keyLength: rawApiKey.length,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 20,
});
