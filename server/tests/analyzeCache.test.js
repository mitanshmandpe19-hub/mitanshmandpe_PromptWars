import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyzeCache } from '../src/services/analyzeCache.js';

describe('AnalyzeCache Service', () => {
  let cache;

  beforeEach(() => {
    cache = new AnalyzeCache({ ttlMs: 1000, maxEntries: 3 });
  });

  it('hashes text deterministically and retrieves cached data', () => {
    const text = 'I want to change careers.';
    const data = { decision: 'Career change', blind_spots: [] };

    cache.set(text, data);
    expect(cache.has(text)).toBe(true);

    const retrieved = cache.get(text);
    expect(retrieved).toEqual(data);
  });

  it('normalizes text before hashing so whitespace and casing match', () => {
    const text = '   I want to quit my job.  ';
    const textCased = 'I WANT TO QUIT MY JOB.';
    const data = { decision: 'Quit job' };

    cache.set(text, data);
    expect(cache.get(textCased)).toEqual(data);
  });

  it('expires entries after TTL', async () => {
    const shortCache = new AnalyzeCache({ ttlMs: 50, maxEntries: 10 });
    const text = 'Thinking of moving abroad.';
    const data = { decision: 'Moving abroad' };

    shortCache.set(text, data);
    expect(shortCache.get(text)).toEqual(data);

    await new Promise((resolve) => setTimeout(resolve, 70));
    expect(shortCache.get(text)).toBeNull();
  });

  it('evicts oldest entries when capacity exceeds maxEntries', () => {
    cache.set('text1', { id: 1 });
    cache.set('text2', { id: 2 });
    cache.set('text3', { id: 3 });
    expect(cache.size()).toBe(3);

    cache.set('text4', { id: 4 });
    expect(cache.size()).toBe(3);
    expect(cache.get('text1')).toBeNull(); // evicted
    expect(cache.get('text4')).toEqual({ id: 4 });
  });

  it('clears all entries', () => {
    cache.set('t1', { a: 1 });
    cache.set('t2', { a: 2 });
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('t1')).toBeNull();
  });
});
