import { describe, it, expect, vi } from 'vitest';
import { withTransientRetry } from '../src/services/retry.js';

describe('withTransientRetry Utility', () => {
  it('returns result immediately on successful execution', async () => {
    const fn = vi.fn().mockResolvedValue('success-payload');
    const result = await withTransientRetry(fn);
    expect(result).toBe('success-payload');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 rate limit error and succeeds', async () => {
    let callCount = 0;
    const fn = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        const err = new Error('Resource exhausted rate limit');
        err.status = 429;
        throw err;
      }
      return 'recovered-after-retry';
    });

    const result = await withTransientRetry(fn, { maxRetries: 2, baseDelayMs: 10 });
    expect(result).toBe('recovered-after-retry');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-transient errors (e.g. 400 validation, 401 invalid key)', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 400, message: 'Invalid prompt structure' });

    await expect(withTransientRetry(fn, { maxRetries: 2, baseDelayMs: 10 })).rejects.toMatchObject({
      status: 400,
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws error after exceeding maxRetries on persistent 503', async () => {
    const persistentErr = { status: 503, message: 'High demand' };
    const fn = vi.fn().mockRejectedValue(persistentErr);

    await expect(withTransientRetry(fn, { maxRetries: 2, baseDelayMs: 10 })).rejects.toEqual(
      persistentErr,
    );
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});
