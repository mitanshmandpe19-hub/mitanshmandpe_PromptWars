import { describe, it, expect } from 'vitest';
import {
  stripControlCharacters,
  sanitizeInputString,
  AnalyzeRequestSchema,
  UpdateRequestSchema,
  SummaryRequestSchema,
  validateRequest,
} from '../src/services/validation.js';

describe('Validation Service', () => {
  describe('stripControlCharacters and sanitizeInputString', () => {
    it('strips null bytes and non-printable control characters', () => {
      const dirty = 'Hello\x00\x08World\x1F\x7F Test';
      expect(stripControlCharacters(dirty)).toBe('HelloWorld Test');
    });

    it('preserves standard whitespaces like newline and tab', () => {
      const formatted = 'Line 1\nLine 2\tTabbed';
      expect(stripControlCharacters(formatted)).toBe('Line 1\nLine 2\tTabbed');
    });

    it('sanitizes non-string values gracefully', () => {
      expect(sanitizeInputString(null)).toBe('');
      expect(sanitizeInputString(undefined)).toBe('');
      expect(sanitizeInputString(42)).toBe('');
    });
  });

  describe('AnalyzeRequestSchema', () => {
    it('accepts valid text between 10 and 1500 characters', () => {
      const validPayload = {
        text: 'I am debating whether to quit my job to launch a startup.',
      };
      const result = validateRequest(AnalyzeRequestSchema, validPayload);
      expect(result.success).toBe(true);
      expect(result.data.text).toBe(validPayload.text);
    });

    it('rejects text shorter than 10 characters', () => {
      const invalidPayload = { text: 'Too short' };
      const result = validateRequest(AnalyzeRequestSchema, invalidPayload);
      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 10 characters');
    });

    it('rejects text exceeding 1500 characters', () => {
      const longText = 'A'.repeat(1501);
      const result = validateRequest(AnalyzeRequestSchema, { text: longText });
      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot exceed 1500 characters');
    });

    it('rejects wrong types or missing fields', () => {
      expect(validateRequest(AnalyzeRequestSchema, { text: 12345 }).success).toBe(false);
      expect(validateRequest(AnalyzeRequestSchema, {}).success).toBe(false);
      expect(validateRequest(AnalyzeRequestSchema, null).success).toBe(false);
    });

    it('strips control characters during validation', () => {
      const payloadWithControl = {
        text: 'Valid length decision\x00 with stripped chars.',
      };
      const result = validateRequest(AnalyzeRequestSchema, payloadWithControl);
      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Valid length decision with stripped chars.');
    });
  });

  describe('UpdateRequestSchema', () => {
    const validUpdatePayload = {
      originalText: 'I am thinking of quitting my internship to study for finals.',
      answers: [
        {
          question: 'What if you talk to your manager?',
          answer: 'I could ask for reduced hours.',
        },
      ],
      previousAnalysis: {
        needs_more_input: false,
        blind_spots: [],
      },
      question: 'Have you scheduled a meeting with them?',
      answer: 'Yes, I sent an email this morning.',
    };

    it('accepts valid update payload', () => {
      const result = validateRequest(UpdateRequestSchema, validUpdatePayload);
      expect(result.success).toBe(true);
    });

    it('rejects missing previousAnalysis object', () => {
      const invalid = { ...validUpdatePayload, previousAnalysis: null };
      const result = validateRequest(UpdateRequestSchema, invalid);
      expect(result.success).toBe(false);
    });

    it('rejects empty question or answer', () => {
      const invalid = { ...validUpdatePayload, answer: '' };
      const result = validateRequest(UpdateRequestSchema, invalid);
      expect(result.success).toBe(false);
    });

    it('rejects answers array exceeding limit of 50', () => {
      const answersTooMany = Array.from({ length: 51 }, (_, i) => ({
        question: `Question ${i}`,
        answer: `Answer ${i}`,
      }));
      const invalid = { ...validUpdatePayload, answers: answersTooMany };
      const result = validateRequest(UpdateRequestSchema, invalid);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot exceed 50 previous answers');
    });
  });

  describe('SummaryRequestSchema', () => {
    it('validates summary request payload properly', () => {
      const validSummaryPayload = {
        originalText: 'I want to decide between offer A and offer B.',
        answers: [],
        analysis: {
          decision: 'Choosing between offer A and offer B',
          blind_spots: [],
        },
      };
      const result = validateRequest(SummaryRequestSchema, validSummaryPayload);
      expect(result.success).toBe(true);
    });

    it('rejects missing analysis in summary payload', () => {
      const result = validateRequest(SummaryRequestSchema, {
        originalText: 'Valid length text here for the decision dilemma.',
      });
      expect(result.success).toBe(false);
    });
  });
});
