import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import express from 'express';

/**
 * Resolves the CORS origin configuration based on CORS_ORIGIN and NODE_ENV.
 * In production, '*' is strictly disallowed and filtered out.
 *
 * @param {string} [rawCorsOrigin=process.env.CORS_ORIGIN]
 * @param {string} [nodeEnv=process.env.NODE_ENV]
 * @returns {boolean|Array<string>}
 */
export function getCorsOriginConfig(rawCorsOrigin = process.env.CORS_ORIGIN, nodeEnv = process.env.NODE_ENV) {
  const isProd = nodeEnv === 'production';
  const origins = (rawCorsOrigin || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (isProd) {
    // In production, wildcard '*' is disallowed
    const sanitizedOrigins = origins.filter((o) => o !== '*');
    if (sanitizedOrigins.length === 0) {
      return false;
    }
    return sanitizedOrigins;
  }

  // In development / test: allow wildcard or reflect origin
  if (origins.includes('*') || origins.length === 0) {
    return true;
  }
  return origins;
}

/**
 * Configures and returns standard security & performance middleware array.
 *
 * @param {Object} [options={}]
 * @param {string} [options.corsOrigin=process.env.CORS_ORIGIN]
 * @param {string} [options.nodeEnv=process.env.NODE_ENV]
 * @returns {Array<import('express').RequestHandler>}
 */
export function createSecurityMiddleware(options = {}) {
  const corsOrigin = getCorsOriginConfig(
    options.corsOrigin ?? process.env.CORS_ORIGIN,
    options.nodeEnv ?? process.env.NODE_ENV
  );

  return [
    // Helmet headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'", '*'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),

    // CORS configuration
    cors({
      origin: corsOrigin,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400,
    }),

    // Gzip compression
    compression(),

    // JSON Body parser with strict 10kb limit
    express.json({
      limit: '10kb',
      strict: true,
    }),
  ];
}
