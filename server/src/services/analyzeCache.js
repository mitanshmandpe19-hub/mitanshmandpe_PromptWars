import crypto from 'crypto';
import { LIMITS } from '../constants/index.js';

/**
 * In-memory TTL/LRU Cache for identical /api/analyze requests.
 * Uses SHA-256 hash of normalized text as the cache key to prevent storing or logging raw text in keys.
 */
export class AnalyzeCache {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.ttlMs=LIMITS.ANALYZE_CACHE_TTL_MS] - Time to live in ms
   * @param {number} [options.maxEntries=LIMITS.ANALYZE_CACHE_MAX_ENTRIES] - Maximum cached entries
   */
  constructor(options = {}) {
    this.ttlMs = options.ttlMs || LIMITS.ANALYZE_CACHE_TTL_MS;
    this.maxEntries = options.maxEntries || LIMITS.ANALYZE_CACHE_MAX_ENTRIES;
    /** @type {Map<string, { data: any, expiresAt: number }>} */
    this.cache = new Map();
  }

  /**
   * Computes a deterministic SHA-256 hash of normalized input text.
   * @param {string} text
   * @returns {string}
   */
  hashKey(text) {
    const normalized = (text || '').trim().toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Retrieves an item from cache if it exists and has not expired.
   * @param {string} text - Raw input text
   * @returns {any|null}
   */
  get(text) {
    if (!text || typeof text !== 'string') return null;
    const key = this.hashKey(text);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order on hit
    this.cache.delete(key);
    this.cache.set(key, entry);

    return JSON.parse(JSON.stringify(entry.data));
  }

  /**
   * Stores an item in cache with TTL and enforces maxEntries capacity.
   * @param {string} text - Raw input text
   * @param {any} data - Analysis result object
   * @param {number} [customTtl] - Optional custom TTL in ms
   */
  set(text, data, customTtl) {
    if (!text || !data) return;
    const key = this.hashKey(text);
    const ttl = customTtl || this.ttlMs;

    // Enforce max capacity by evicting oldest entry
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Checks if an unexpired key exists.
   * @param {string} text
   * @returns {boolean}
   */
  has(text) {
    return this.get(text) !== null;
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns current cache size.
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }
}

export const analyzeCache = new AnalyzeCache();
export default analyzeCache;
