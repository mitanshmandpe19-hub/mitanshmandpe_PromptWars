import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { getCorsOriginConfig, createSecurityMiddleware } from '../src/middleware/security.js';

describe('CORS and Security Middleware', () => {
  describe('getCorsOriginConfig logic', () => {
    it('allows wildcard / true in development environment', () => {
      expect(getCorsOriginConfig('*', 'development')).toBe(true);
      expect(getCorsOriginConfig('', 'development')).toBe(true);
      expect(getCorsOriginConfig(undefined, 'development')).toBe(true);
      expect(getCorsOriginConfig('https://dev.example.com', 'development')).toEqual([
        'https://dev.example.com',
      ]);
    });

    it('disallows wildcard "*" in production environment', () => {
      expect(getCorsOriginConfig('*', 'production')).toBe(false);
      expect(getCorsOriginConfig('*, *', 'production')).toBe(false);
      expect(getCorsOriginConfig('', 'production')).toBe(false);
    });

    it('filters out "*" and preserves valid origins in production', () => {
      expect(getCorsOriginConfig('https://my-app.vercel.app, *', 'production')).toEqual([
        'https://my-app.vercel.app',
      ]);
      expect(
        getCorsOriginConfig('https://app.vercel.app, https://api.onrender.com', 'production'),
      ).toEqual(['https://app.vercel.app', 'https://api.onrender.com']);
    });
  });

  describe('Express CORS Header Verification', () => {
    it('does not set Access-Control-Allow-Origin to * for random origin in production when CORS_ORIGIN is *', async () => {
      const app = express();
      const securityMiddlewares = createSecurityMiddleware({
        corsOrigin: '*',
        nodeEnv: 'production',
      });
      securityMiddlewares.forEach((mw) => app.use(mw));
      app.get('/test', (req, res) => res.json({ ok: true }));

      const res = await request(app).get('/test').set('Origin', 'https://malicious-site.com');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('allows whitelisted origin in production', async () => {
      const app = express();
      const securityMiddlewares = createSecurityMiddleware({
        corsOrigin: 'https://trusted-frontend.vercel.app, https://my-app.com',
        nodeEnv: 'production',
      });
      securityMiddlewares.forEach((mw) => app.use(mw));
      app.get('/test', (req, res) => res.json({ ok: true }));

      const res = await request(app)
        .get('/test')
        .set('Origin', 'https://trusted-frontend.vercel.app');

      expect(res.headers['access-control-allow-origin']).toBe(
        'https://trusted-frontend.vercel.app',
      );
    });
  });
});
