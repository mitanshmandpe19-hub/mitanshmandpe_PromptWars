/**
 * Shared server constants for Blind Spot.
 */

export const BLIND_SPOT_STATUSES = Object.freeze({
  OPEN: 'open',
  PARTIAL: 'partial',
  RESOLVED: 'resolved',
});

export const BLIND_SPOT_TYPES = Object.freeze({
  ASSUMPTION: 'Assumption',
  RISK: 'Risk',
  MISSING_FACTOR: 'Missing Factor',
});

export const EVIDENCE_STATUSES = Object.freeze({
  DIRECT: 'direct',
  INDIRECT: 'indirect',
  NONE: 'none',
});

export const CONFIDENCE_LEVELS = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
});

export const ERROR_CODES = Object.freeze({
  MISSING_API_KEY: 'MISSING_API_KEY',
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
  INVALID_AI_RESPONSE: 'INVALID_AI_RESPONSE',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CORS_ERROR: 'CORS_ERROR',
});

export const LIMITS = Object.freeze({
  MAX_BLIND_SPOTS: 3,
  MIN_INPUT_CHARS: 5,
  MAX_INPUT_CHARS: 2000,
  MAX_QUESTION_CHARS: 500,
  MAX_ANSWER_CHARS: 1500,
  REQUEST_TIMEOUT_MS: 45000,
  ANALYZE_CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes
  ANALYZE_CACHE_MAX_ENTRIES: 100,
});
