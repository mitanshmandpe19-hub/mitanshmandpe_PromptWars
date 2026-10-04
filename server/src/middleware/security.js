import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import express from 'express';

/**
 * Configures and returns standard security & performance middleware array.
 *
 * @returns {Array<import('express').RequestHandler>}
 */
export function createSecurityMiddleware() {
  const allowedOrigin = process.env.CORS_ORIGIN || '*';

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
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),

    // CORS configuration
    cors({
      origin: allowedOrigin === '*' ? true : allowedOrigin.split(',').map((o) => o.trim()),
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
