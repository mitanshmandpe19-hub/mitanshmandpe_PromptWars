import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getModelName, getGeminiClient } from '../src/services/gemini.js';
import { AppError } from '../src/errors/AppError.js';

describe('Gemini Service Configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('getModelName returns default model when unset', () => {
    delete process.env.GEMINI_MODEL;
    expect(getModelName()).toBe('gemini-3.5-flash-lite');
  });

  it('getModelName maps deprecated 2.5-flash-lite to 3.5-flash-lite', () => {
    process.env.GEMINI_MODEL = 'gemini-2.5-flash-lite';
    expect(getModelName()).toBe('gemini-3.5-flash-lite');
  });

  it('getModelName maps deprecated 2.5-flash to 3.5-flash', () => {
    process.env.GEMINI_MODEL = 'gemini-2.5-flash';
    expect(getModelName()).toBe('gemini-3.5-flash');
  });

  it('getModelName cleans up any accidental key=value syntax', () => {
    process.env.GEMINI_MODEL = 'GEMINI_MODEL=gemini-3.7-flash';
    expect(getModelName()).toBe('gemini-3.7-flash');
  });

  it('getGeminiClient throws AppError when API key is missing', () => {
    delete process.env.GEMINI_API_KEY;
    expect(() => getGeminiClient()).toThrow(AppError);
  });

  it('getGeminiClient instantiates client when API key is present', () => {
    process.env.GEMINI_API_KEY = 'test_dummy_key_not_real';
    const client = getGeminiClient();
    expect(client).toBeDefined();
  });
});
