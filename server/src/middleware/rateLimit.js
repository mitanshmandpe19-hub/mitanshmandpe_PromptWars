import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000; // 1 minute default
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 20; // max 20 requests per IP per window

/**
 * Rate limit middleware with configurable window and request threshold.
 */
export const apiLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests. Please slow down and try again in a minute.',
  },
  statusCode: 429,
  skipSuccessfulRequests: false,
});
