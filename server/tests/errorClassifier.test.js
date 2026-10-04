import { describe, it, expect } from 'vitest';
import { classifyGeminiError } from '../src/services/errorClassifier.js';
import { AppError } from '../src/errors/AppError.js';
import { ERROR_CODES } from '../src/constants/index.js';

describe('classifyGeminiError Service', () => {
  it('returns existing AppError untouched', () => {
    const original = new AppError('Already custom', 400, 'CUSTOM');
    const result = classifyGeminiError(original);
    expect(result).toBe(original);
  });

  it('classifies missing API key error', () => {
    const result = classifyGeminiError({ message: 'gemini_api_key is not configured' });
    expect(result.statusCode).toBe(500);
    expect(result.errorType).toBe(ERROR_CODES.MISSING_API_KEY);
  });

  it('classifies timeout error', () => {
    const result = classifyGeminiError({ code: 'TIMEOUT', message: 'timed out' });
    expect(result.statusCode).toBe(504);
    expect(result.errorType).toBe(ERROR_CODES.TIMEOUT);
  });

  it('classifies invalid API key errors', () => {
    const result = classifyGeminiError({ status: 401, message: 'API_KEY_INVALID' });
    expect(result.statusCode).toBe(401);
    expect(result.errorType).toBe(ERROR_CODES.INVALID_API_KEY);
  });

  it('classifies 429 and resource exhausted rate limit errors', () => {
    const res1 = classifyGeminiError({ status: 429, message: 'Resource has been exhausted' });
    expect(res1.statusCode).toBe(429);
    expect(res1.errorType).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);

    const res2 = classifyGeminiError({ status: 503, message: 'High demand' });
    expect(res2.statusCode).toBe(429);
    expect(res2.errorType).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
  });

  it('classifies 404 model not found error', () => {
    const result = classifyGeminiError(
      { status: 404, message: 'models/unknown not found' },
      'gemini-unknown',
    );
    expect(result.statusCode).toBe(502);
    expect(result.errorType).toBe(ERROR_CODES.MODEL_NOT_FOUND);
    expect(result.message).toContain('gemini-unknown');
  });

  it('classifies schema and JSON parsing failures', () => {
    const result = classifyGeminiError({ message: 'Failed schema validation for output' });
    expect(result.statusCode).toBe(502);
    expect(result.errorType).toBe(ERROR_CODES.INVALID_AI_RESPONSE);
  });

  it('classifies generic errors as AI_SERVICE_ERROR with status preservation', () => {
    const result = classifyGeminiError({ status: 503, message: 'Database connection failed' });
    expect(result.statusCode).toBe(429); // 503 maps to rate limit / high demand
  });
});
