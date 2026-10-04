import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import * as geminiService from '../src/services/gemini.js';

describe('API Endpoints Integration Tests', () => {
  let app;

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();
  });

  describe('GET /api/health', () => {
    it('returns status ok with 200', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/analyze', () => {
    it('successfully analyzes decision and verifies evidence quotes', async () => {
      const sampleUserText =
        "I am thinking of quitting my internship because I don't have enough time to study.";

      const mockAiResponse = {
        needs_more_input: false,
        decision: 'Quitting internship',
        stated_reason: "don't have enough time to study",
        assumption: 'Internship hours are strictly inflexible',
        focused_on: ['Study time', 'Grades'],
        not_mentioned: ['Supervisor conversation', 'Remote arrangement'],
        blind_spots: [
          {
            id: 'bs-1',
            title: 'Schedule Inflexibility',
            type: 'Assumption',
            why_flagged: 'Have you verified if hours can be negotiated?',
            evidence_quote: "don't have enough time to study",
            evidence_status: 'direct',
            quote_verified: false,
            confidence: 'high',
            status: 'open',
          },
          {
            id: 'bs-2',
            title: 'Fake Quote Blind Spot',
            type: 'Risk',
            why_flagged: 'Fabricated quote that does not exist in user text',
            evidence_quote: 'my boss will fire me anyway',
            evidence_status: 'direct',
            quote_verified: false,
            confidence: 'medium',
            status: 'open',
          },
        ],
        top_question: 'Could you ask your manager about flexible exam-season hours?',
      };

      vi.spyOn(geminiService, 'analyzeDecision').mockResolvedValue(mockAiResponse);

      const response = await request(app)
        .post('/api/analyze')
        .send({ text: sampleUserText });

      expect(response.status).toBe(200);
      expect(response.body.decision).toBe('Quitting internship');
      expect(response.body.blind_spots.length).toBe(2);

      // Verify Quote 1 was verified
      expect(response.body.blind_spots[0].quote_verified).toBe(true);
      expect(response.body.blind_spots[0].evidence_quote).toBe("don't have enough time to study");
      expect(response.body.blind_spots[0].evidence_status).toBe('direct');

      // Verify Fake Quote was downgraded
      expect(response.body.blind_spots[1].quote_verified).toBe(false);
      expect(response.body.blind_spots[1].evidence_quote).toBeNull();
      expect(response.body.blind_spots[1].evidence_status).toBe('none');

      expect(response.body.top_question).toBe(
        'Could you ask your manager about flexible exam-season hours?'
      );
    });

    it('returns 400 when text is too short (< 10 characters)', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ text: 'Help me' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 10 characters');
    });

    it('returns 400 when body is missing text field', async () => {
      const response = await request(app).post('/api/analyze').send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Text is required');
    });
  });

  describe('POST /api/update', () => {
    it('successfully updates analysis with user answer and notes status changes', async () => {
      const payload = {
        originalText: "I am thinking of quitting my internship because I don't have enough time to study.",
        answers: [
          {
            question: 'Could you ask your manager about flexible exam-season hours?',
            answer: 'I asked today and they offered to let me work 10 hours a week instead of 30.',
          },
        ],
        previousAnalysis: {
          decision: 'Quitting internship',
          blind_spots: [],
        },
        question: 'Does 10 hours a week resolve your study time pressure?',
        answer: 'Yes, 10 hours gives me 20 extra hours per week to study.',
      };

      const mockUpdateResponse = {
        needs_more_input: false,
        decision: 'Adjusting internship hours rather than quitting',
        stated_reason: '10 hours per week frees up study time',
        assumption: 'Workload at 10 hours will be manageable',
        focused_on: ['Study balance', 'Manager agreement'],
        not_mentioned: ['Impact on team deliverable deadlines'],
        blind_spots: [
          {
            id: 'bs-1',
            title: 'Schedule Inflexibility',
            type: 'Assumption',
            why_flagged: 'Have you verified if hours can be negotiated?',
            evidence_quote: 'work 10 hours a week instead of 30',
            evidence_status: 'direct',
            quote_verified: false,
            confidence: 'high',
            status: 'resolved',
          },
        ],
        top_question: 'Will your pay at 10 hours cover your required monthly living expenses?',
        status_change_notes: [
          {
            id: 'bs-1',
            from: 'open',
            to: 'resolved',
            reason: 'Manager agreed to 10-hour work week.',
          },
        ],
      };

      vi.spyOn(geminiService, 'updateAnalysis').mockResolvedValue(mockUpdateResponse);

      const response = await request(app).post('/api/update').send(payload);

      expect(response.status).toBe(200);
      expect(response.body.blind_spots[0].status).toBe('resolved');
      expect(response.body.blind_spots[0].quote_verified).toBe(true);
      expect(response.body.status_change_notes.length).toBe(1);
      expect(response.body.status_change_notes[0].to).toBe('resolved');
    });

    it('returns 400 for invalid update payload', async () => {
      const response = await request(app).post('/api/update').send({
        originalText: 'Valid length text here',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/summary', () => {
    it('successfully generates summary with verified disclaimer and checks', async () => {
      const payload = {
        originalText: "I am thinking of quitting my internship because I don't have enough time to study.",
        answers: [
          {
            question: 'Did you ask about reduced hours?',
            answer: 'Yes, reduced hours was approved.',
          },
        ],
        analysis: {
          decision: 'Shift to 10 hours weekly',
          blind_spots: [],
        },
      };

      const mockSummaryResponse = {
        decision: 'Adjusting internship schedule instead of quitting',
        checked: [
          'Confirmed manager is willing to adjust schedule down to 10 hours/week',
          'Calculated 20 additional hours available for study time',
        ],
        still_unknown: [
          'Whether 10 hours salary covers required living expenses',
          'Whether exam schedule clashes with specific work meeting days',
        ],
        next_checks: [
          'Review monthly budget against reduced 10-hour earnings',
          'Confirm team meeting times with manager',
        ],
        disclaimer: 'This is a thinking aid, not advice. The decision is yours.',
      };

      vi.spyOn(geminiService, 'summarizeAnalysis').mockResolvedValue(mockSummaryResponse);

      const response = await request(app).post('/api/summary').send(payload);

      expect(response.status).toBe(200);
      expect(response.body.decision).toBe('Adjusting internship schedule instead of quitting');
      expect(response.body.checked.length).toBe(2);
      expect(response.body.still_unknown.length).toBe(2);
      expect(response.body.next_checks.length).toBe(2);
      expect(response.body.disclaimer).toBe(
        'This is a thinking aid, not advice. The decision is yours.'
      );
    });
  });

  describe('Error & 404 handling', () => {
    it('returns 404 for non-existent API routes', async () => {
      const response = await request(app).get('/api/unknown-endpoint');
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Cannot GET /api/unknown-endpoint');
    });

    it('handles AI service failure with specific friendly message', async () => {
      vi.spyOn(geminiService, 'analyzeDecision').mockRejectedValue(
        new Error('AI service connection failed')
      );

      const response = await request(app)
        .post('/api/analyze')
        .send({ text: 'Valid length text here for testing error handling.' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('AI service connection failed');
    });
  });
});
