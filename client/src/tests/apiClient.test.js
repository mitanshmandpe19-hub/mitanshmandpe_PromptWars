import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeText, updateSession, getSummary } from '../api/client.js';

describe('Client API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('analyzeText posts JSON and returns payload', async () => {
    const mockData = { decision: 'Test decision', blind_spots: [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockData,
    });

    const result = await analyzeText('I am considering a new job');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/analyze',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(result).toEqual(mockData);
  });

  it('updateSession posts update payload and returns updated analysis', async () => {
    const mockUpdated = { decision: 'Test', blind_spots: [{ id: 'bs_1', status: 'partial' }] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockUpdated,
    });

    const payload = {
      originalText: 'Test text',
      answers: [],
      previousAnalysis: { decision: 'Test' },
      question: 'Why?',
      answer: 'Because of X',
    };

    const result = await updateSession(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/update',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(mockUpdated);
  });

  it('getSummary posts summary payload and returns receipt', async () => {
    const mockSummary = {
      decision: 'Test',
      checked: ['X'],
      disclaimer: 'This is a thinking aid, not advice. The decision is yours.',
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockSummary,
    });

    const payload = {
      originalText: 'Test text',
      answers: [],
      analysis: { decision: 'Test' },
    };

    const result = await getSummary(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/summary',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(mockSummary);
  });

  it('passes AbortSignal to fetch and propagates abort', async () => {
    const controller = new AbortController();
    global.fetch = vi.fn().mockImplementation((url, options) => {
      if (options.signal?.aborted) {
        const error = new Error('The operation was aborted.');
        error.name = 'AbortError';
        return Promise.reject(error);
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ status: 'ok' }),
      });
    });

    controller.abort();
    await expect(analyzeText('Test text', controller.signal)).rejects.toThrow();
  });

  it('throws structured error on non-ok status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Too many requests' }),
    });

    await expect(analyzeText('Test text')).rejects.toThrow('Too many requests');
  });
});
