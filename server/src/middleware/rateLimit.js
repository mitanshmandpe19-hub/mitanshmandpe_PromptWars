import rateLimit from 'express-rate-limit';

/**
 * Rate limit middleware allowing ~20 requests per minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 requests per IP per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests. Please slow down and try again in a minute.',
  },
  statusCode: 429,
  skipSuccessfulRequests: false,
});
