/**
 * Utility for retrying async operations only on transient 429 / 503 errors.
 *
 * @template T
 * @param {() => Promise<T>} fn - Async function to execute
 * @param {Object} [options={}]
 * @param {number} [options.maxRetries=1] - Maximum retries (default 1)
 * @param {number} [options.baseDelayMs=1500] - Base delay before retry in ms
 * @returns {Promise<T>}
 */
export async function withTransientRetry(fn, options = {}) {
  const maxRetries = options.maxRetries ?? 1;
  const baseDelayMs = options.baseDelayMs ?? 1500;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const status = err?.status || err?.statusCode || 0;
      const msg = (err?.message || '').toLowerCase();
      const isTransient =
        status === 429 ||
        status === 503 ||
        msg.includes('resource_exhausted') ||
        msg.includes('high demand') ||
        msg.includes('rate limit');

      if (!isTransient || attempt > maxRetries) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
