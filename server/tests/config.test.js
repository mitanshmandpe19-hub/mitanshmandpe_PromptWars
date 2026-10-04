import { describe, it, expect } from 'vitest';
import { config } from '../src/config/index.js';

describe('Server Configuration Module', () => {
  it('exports structured config with defaults', () => {
    expect(config).toBeDefined();
    expect(config.port).toBeTypeOf('number');
    expect(config.host).toBe('0.0.0.0');
    expect(config.geminiModel).toBeDefined();
    expect(config.rateLimitWindowMs).toBeGreaterThan(0);
    expect(config.rateLimitMax).toBeGreaterThan(0);
    expect(config.isKeyConfigured).toBeTypeOf('boolean');
    expect(config.keyLength).toBeTypeOf('number');
  });
});
