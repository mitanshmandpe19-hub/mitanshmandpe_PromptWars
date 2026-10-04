import { describe, it, expect } from 'vitest';
import { AppError } from '../src/errors/AppError.js';
import { ERROR_CODES } from '../src/constants/index.js';

describe('AppError Class and Factories', () => {
  it('creates standard AppError instance with custom code and status', () => {
    const err = new AppError('Custom test error', 418, 'TEAPOT');
    expect(err.message).toBe('Custom test error');
    expect(err.statusCode).toBe(418);
    expect(err.errorType).toBe('TEAPOT');
    expect(err.name).toBe('AppError');
  });

  it('creates validation error (400)', () => {
    const err = AppError.validation('Invalid data provided');
    expect(err.statusCode).toBe(400);
    expect(err.errorType).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('creates missing API key error (500)', () => {
    const err = AppError.missingApiKey();
    expect(err.statusCode).toBe(500);
    expect(err.errorType).toBe(ERROR_CODES.MISSING_API_KEY);
  });

  it('creates invalid API key error (401)', () => {
    const err = AppError.invalidApiKey();
    expect(err.statusCode).toBe(401);
    expect(err.errorType).toBe(ERROR_CODES.INVALID_API_KEY);
  });

  it('creates rate limit error (429)', () => {
    const err = AppError.rateLimit();
    expect(err.statusCode).toBe(429);
    expect(err.errorType).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
  });

  it('creates timeout error (504)', () => {
    const err = AppError.timeout();
    expect(err.statusCode).toBe(504);
    expect(err.errorType).toBe(ERROR_CODES.TIMEOUT);
  });

  it('creates model not found error (502)', () => {
    const err = AppError.modelNotFound('gemini-invalid');
    expect(err.statusCode).toBe(502);
    expect(err.errorType).toBe(ERROR_CODES.MODEL_NOT_FOUND);
    expect(err.message).toContain('gemini-invalid');
  });

  it('creates invalid AI response error (502)', () => {
    const err = AppError.invalidAiResponse();
    expect(err.statusCode).toBe(502);
    expect(err.errorType).toBe(ERROR_CODES.INVALID_AI_RESPONSE);
  });
});
