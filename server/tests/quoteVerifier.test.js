import { describe, it, expect } from 'vitest';
import {
  normalizeForQuoteMatch,
  isQuoteInText,
  buildUserCorpus,
  verifyBlindSpotQuotes,
} from '../src/services/quoteVerifier.js';

describe('Quote Verifier Service', () => {
  const sampleOriginalText =
    "I am thinking of quitting my internship because I don't have enough time to study.";

  const sampleAnswers = [
    {
      question: 'Have you discussed reducing your hours with your manager?',
      answer: 'No, I have not spoken with my manager yet because I assume they will say no.',
    },
  ];

  describe('normalizeForQuoteMatch', () => {
    it('handles lowercase conversion, whitespace normalization, and punctuation tolerance', () => {
      const input = "  I Don't  Have  Enough \n TIME — To Study!  ";
      const normalized = normalizeForQuoteMatch(input);
      expect(normalized).toBe('i dont have enough time to study');
    });

    it('returns empty string for non-string input', () => {
      expect(normalizeForQuoteMatch(null)).toBe('');
      expect(normalizeForQuoteMatch(undefined)).toBe('');
      expect(normalizeForQuoteMatch(123)).toBe('');
    });
  });

  describe('isQuoteInText', () => {
    it('verifies exact match', () => {
      const quote = 'quitting my internship';
      expect(isQuoteInText(quote, sampleOriginalText)).toBe(true);
    });

    it('verifies case difference', () => {
      const quote = 'QUITTING MY INTERNSHIP';
      expect(isQuoteInText(quote, sampleOriginalText)).toBe(true);
    });

    it('verifies extra whitespace in quote and text', () => {
      const quote = 'quitting    my \n internship';
      expect(isQuoteInText(quote, sampleOriginalText)).toBe(true);
    });

    it('handles smart quotes and punctuation variations', () => {
      const textWithSmartQuotes = 'I said “I don’t have enough time” to study.';
      const quote = "I don't have enough time";
      expect(isQuoteInText(quote, textWithSmartQuotes)).toBe(true);
    });

    it('rejects fake/fabricated quote', () => {
      const fakeQuote = 'I hate my current internship boss';
      expect(isQuoteInText(fakeQuote, sampleOriginalText)).toBe(false);
    });

    it('verifies quote found in an earlier answer corpus', () => {
      const corpus = buildUserCorpus(sampleOriginalText, sampleAnswers);
      const quote = 'assume they will say no';
      expect(isQuoteInText(quote, corpus)).toBe(true);
    });
  });

  describe('buildUserCorpus', () => {
    it('aggregates original text, answer objects, and latest answer', () => {
      const corpus = buildUserCorpus(
        sampleOriginalText,
        sampleAnswers,
        'My final exam is in two weeks.',
      );
      expect(corpus).toContain('quitting my internship');
      expect(corpus).toContain('spoken with my manager');
      expect(corpus).toContain('final exam is in two weeks');
    });
  });

  describe('verifyBlindSpotQuotes', () => {
    it('verifies valid quotes and marks quote_verified: true', () => {
      const blindSpots = [
        {
          id: 'bs-1',
          title: 'Fixed Time Assumption',
          type: 'Assumption',
          why_flagged: 'Have you verified your available study hours?',
          evidence_quote: "don't have enough time to study",
          evidence_status: 'direct',
          quote_verified: false,
          confidence: 'high',
          status: 'open',
        },
      ];

      const verified = verifyBlindSpotQuotes(blindSpots, sampleOriginalText);

      expect(verified[0].quote_verified).toBe(true);
      expect(verified[0].evidence_quote).toBe("don't have enough time to study");
      expect(verified[0].evidence_status).toBe('direct');
    });

    it('downgrades fabricated quotes to null quote, quote_verified: false, evidence_status: "none"', () => {
      const blindSpots = [
        {
          id: 'bs-fake',
          title: 'Fabricated Quote',
          type: 'Risk',
          why_flagged: 'Unverified claim',
          evidence_quote: 'I absolutely refuse to work overtime ever',
          evidence_status: 'direct',
          quote_verified: true, // Claimed true by AI
          confidence: 'medium',
          status: 'open',
        },
      ];

      const verified = verifyBlindSpotQuotes(blindSpots, sampleOriginalText);

      expect(verified[0].quote_verified).toBe(false);
      expect(verified[0].evidence_quote).toBeNull();
      expect(verified[0].evidence_status).toBe('none');
    });

    it('handles null or empty quotes cleanly', () => {
      const blindSpots = [
        {
          id: 'bs-empty',
          title: 'No Quote Given',
          type: 'Missing Factor',
          why_flagged: 'Alternative options not considered',
          evidence_quote: null,
          evidence_status: 'none',
          quote_verified: false,
          confidence: 'low',
          status: 'open',
        },
      ];

      const verified = verifyBlindSpotQuotes(blindSpots, sampleOriginalText);

      expect(verified[0].quote_verified).toBe(false);
      expect(verified[0].evidence_quote).toBeNull();
      expect(verified[0].evidence_status).toBe('none');
    });

    it('verifies quote from previous answers in multi-round conversation', () => {
      const corpus = buildUserCorpus(sampleOriginalText, sampleAnswers);
      const blindSpots = [
        {
          id: 'bs-2',
          title: 'Manager Assumption',
          type: 'Assumption',
          why_flagged: 'Why assume the manager will refuse before asking?',
          evidence_quote: 'assume they will say no',
          evidence_status: 'direct',
          quote_verified: false,
          confidence: 'high',
          status: 'open',
        },
      ];

      const verified = verifyBlindSpotQuotes(blindSpots, corpus);

      expect(verified[0].quote_verified).toBe(true);
      expect(verified[0].evidence_quote).toBe('assume they will say no');
      expect(verified[0].evidence_status).toBe('direct');
    });
  });
});
