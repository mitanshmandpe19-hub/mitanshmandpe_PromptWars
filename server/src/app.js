import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { createSecurityMiddleware } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import analyzeRouter from './routes/analyze.js';
import updateRouter from './routes/update.js';
import summaryRouter from './routes/summary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Trust first proxy for Cloud Run / reverse proxies (needed for rate-limiting and secure headers)
  app.set('trust proxy', 1);

  // Security, CORS, Gzip compression & 10kb JSON parsing
  const securityMiddlewares = createSecurityMiddleware();
  securityMiddlewares.forEach((mw) => app.use(mw));

  // Health check endpoint (exempt from rate limit)
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Apply rate limiter to all /api routes
  app.use('/api', apiLimiter);

  // API Routes
  app.use('/api/analyze', analyzeRouter);
  app.use('/api/update', updateRouter);
  app.use('/api/summary', summaryRouter);

  // Handle unmatched API routes
  app.use('/api', notFoundHandler);

  // Serve static client bundle if client/dist exists (for single-URL deployment)
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    // Development fallback when client is not yet built
    app.get('/', (req, res) => {
      res.status(200).send('<h1>Blind Spot API</h1><p>Backend is active. Frontend build at /client/dist not found yet.</p>');
    });
  }

  // Fallback 404 for any other unmatched routes
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
