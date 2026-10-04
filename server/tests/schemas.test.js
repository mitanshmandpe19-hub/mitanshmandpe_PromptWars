import { describe, it, expect } from 'vitest';
import {
  AnalyzeResponseZodSchema,
} from '../src/prompts/schemas.js';
import {
  validateAiAnalyzeOutput,
  validateAiUpdateOutput,
  validateAiSummaryOutput,
} from '../src/services/validation.js';

describe('AI Output Schema Validation', () => {
  const validAnalyzeOutput = {
    needs_more_input: false,
    decision: 'Quitting internship',
    stated_reason: 'Not enough time to study',
    assumption: 'Internship hours cannot be changed',
    focused_on: ['Grades', 'Study time'],
    not_mentioned: ['Talking to supervisor', 'Part-time adjustment'],
    blind_spots: [
      {
        id: 'bs-1',
        title: 'Rigid Schedule Assumption',
        type: 'Assumption',
        why_flagged: 'Have you verified if the company offers flexible hours?',
        evidence_quote: "don't have enough time to study",
        evidence_status: 'direct',
        quote_verified: false,
        confidence: 'high',
        status: 'open',
      },
    ],
    top_question: 'What would happen if you requested a reduced 15-hour schedule for finals?',
  };

  describe('Analyze Output Validation', () => {
    it('accepts compliant AI output structure', () => {
      const validation = validateAiAnalyzeOutput(validAnalyzeOutput);
      expect(validation.success).toBe(true);
      expect(validation.data.blind_spots.length).toBe(1);
    });

    it('rejects malformed blind spot with invalid type enum', () => {
      const invalid = {
        ...validAnalyzeOutput,
        blind_spots: [
          {
            ...validAnalyzeOutput.blind_spots[0],
            type: 'InvalidTypeCategory',
          },
        ],
      };
      const validation = validateAiAnalyzeOutput(invalid);
      expect(validation.success).toBe(false);
      expect(validation.error).toContain('type');
    });

    it('rejects blind spots array with more than 3 items', () => {
      const fourSpots = Array.from({ length: 4 }, (_, i) => ({
        id: `bs-${i}`,
        title: `Spot ${i}`,
        type: 'Assumption',
        why_flagged: 'Test consideration?',
        evidence_quote: null,
        evidence_status: 'none',
        quote_verified: false,
        confidence: 'medium',
        status: 'open',
      }));

      const invalid = { ...validAnalyzeOutput, blind_spots: fourSpots };
      const validation = validateAiAnalyzeOutput(invalid);
      expect(validation.success).toBe(false);
    });

    it('rejects missing required fields or bad types', () => {
      const badType = {
        needs_more_input: 'not-a-boolean',
      };
      const result = AnalyzeResponseZodSchema.safeParse(badType);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Output Validation', () => {
    it('accepts compliant update output including status_change_notes', () => {
      const validUpdate = {
        ...validAnalyzeOutput,
        status_change_notes: [
          {
            id: 'bs-1',
            from: 'open',
            to: 'partial',
            reason: 'User mentioned they will ask their boss tomorrow.',
          },
        ],
      };

      const validation = validateAiUpdateOutput(validUpdate);
      expect(validation.success).toBe(true);
      expect(validation.data.status_change_notes.length).toBe(1);
    });

    it('rejects invalid status change note transitions', () => {
      const invalidUpdate = {
        ...validAnalyzeOutput,
        status_change_notes: [
          {
            id: 'bs-1',
            from: 'invalid_status',
            to: 'resolved',
            reason: 'Reason string',
          },
        ],
      };
      const validation = validateAiUpdateOutput(invalidUpdate);
      expect(validation.success).toBe(false);
    });
  });

  describe('Summary Output Validation', () => {
    it('accepts compliant summary structure', () => {
      const validSummary = {
        decision: 'Quitting internship',
        checked: ['Talked to manager about part-time'],
        still_unknown: ['Whether reduced pay impacts tuition budget'],
        next_checks: ['Verify final exam dates and hours required'],
        disclaimer: 'This is a thinking aid, not advice. The decision is yours.',
      };

      const validation = validateAiSummaryOutput(validSummary);
      expect(validation.success).toBe(true);
    });

    it('rejects summary missing decision', () => {
      const invalidSummary = {
        checked: [],
        still_unknown: [],
        next_checks: [],
      };
      const validation = validateAiSummaryOutput(invalidSummary);
      expect(validation.success).toBe(false);
    });
  });
});
