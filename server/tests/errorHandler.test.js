import { describe, it, expect, vi } from 'vitest';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler.js';
import { AppError } from '../src/errors/AppError.js';

describe('Error Handling Middleware', () => {
  it('handles SyntaxError for malformed JSON body', () => {
    const err = new SyntaxError('Unexpected token in JSON');
    err.status = 400;
    err.body = '{bad-json}';

    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Malformed JSON payload in request body',
    });
  });

  it('handles 413 PayloadTooLarge error', () => {
    const err = new Error('Payload too large');
    err.type = 'entity.too.large';

    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Request payload exceeds 10kb limit',
    });
  });

  it('handles AppError and preserves custom status code', () => {
    const err = new AppError('Custom rate limit hit', 429, 'RATE_LIMIT_EXCEEDED');

    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Custom rate limit hit',
    });
  });

  it('notFoundHandler returns 404 for unknown route', () => {
    const req = { method: 'GET', originalUrl: '/unknown/route' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    notFoundHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Cannot GET /unknown/route',
    });
  });
});
