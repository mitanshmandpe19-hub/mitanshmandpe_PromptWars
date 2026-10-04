import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import * as geminiService from '../src/services/gemini.js';

describe('Sample Decision End-to-End Walkthrough', () => {
  const sampleDecisionText =
    "I am thinking of quitting my internship because I don't have enough time to study.";

  const app = createApp();

  it('Step 1: Health check returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('Step 2: POST /api/analyze with sample decision', async () => {
    const mockAnalyzeResponse = {
      needs_more_input: false,
      decision: 'Quitting internship',
      stated_reason: 'Not having enough time to study',
      assumption: 'Internship schedule is strictly inflexible and cannot be reduced',
      focused_on: ['Study time requirements', 'Academic performance'],
      not_mentioned: ['Talking to manager about reduced hours', 'Taking a temporary leave of absence', 'Remote hours'],
      blind_spots: [
        {
          id: 'bs-1',
          title: 'Unnegotiated Schedule Assumption',
          type: 'Assumption',
          why_flagged: 'Have you verified whether your employer offers flexible hours or a reduced workload for exams?',
          evidence_quote: "don't have enough time to study",
          evidence_status: 'direct',
          quote_verified: false,
          confidence: 'high',
          status: 'open',
        },
        {
          id: 'bs-2',
          title: 'Career Momentum Risk',
          type: 'Risk',
          why_flagged: 'What are the long-term career trade-offs of stepping away from this internship completely?',
          evidence_quote: 'quitting my internship',
          evidence_status: 'direct',
          quote_verified: false,
          confidence: 'medium',
          status: 'open',
        },
        {
          id: 'bs-3',
          title: 'Alternative Study Optimization',
          type: 'Missing Factor',
          why_flagged: 'Are there other time commitments or study habits that could be restructured first?',
          evidence_quote: null,
          evidence_status: 'none',
          quote_verified: false,
          confidence: 'low',
          status: 'open',
        },
      ],
      top_question: 'What would happen if you requested a temporary 10-hour work week from your manager for the exam season?',
    };

    vi.spyOn(geminiService, 'analyzeDecision').mockResolvedValue(mockAnalyzeResponse);

    const res = await request(app)
      .post('/api/analyze')
      .send({ text: sampleDecisionText });

    expect(res.status).toBe(200);
    expect(res.body.needs_more_input).toBe(false);
    expect(res.body.decision).toBe('Quitting internship');
    expect(res.body.blind_spots.length).toBe(3);

    // Verify backend quote verification
    expect(res.body.blind_spots[0].quote_verified).toBe(true);
    expect(res.body.blind_spots[0].evidence_quote).toBe("don't have enough time to study");
    expect(res.body.blind_spots[1].quote_verified).toBe(true);
    expect(res.body.blind_spots[1].evidence_quote).toBe('quitting my internship');
    expect(res.body.blind_spots[2].quote_verified).toBe(false);
    expect(res.body.blind_spots[2].evidence_quote).toBeNull();

    expect(res.body.top_question).toBe(
      'What would happen if you requested a temporary 10-hour work week from your manager for the exam season?'
    );
  });

  it('Step 3: POST /api/update answering the top question', async () => {
    const questionAsked =
      'What would happen if you requested a temporary 10-hour work week from your manager for the exam season?';
    const userAnswer =
      'I spoke with my manager today and they happily approved working 10 hours a week for the next 4 weeks.';

    const mockUpdateResponse = {
      needs_more_input: false,
      decision: 'Shift to 10 hours/week during exams instead of quitting',
      stated_reason: 'Manager approved temporary 10-hour schedule',
      assumption: '10 hours workload will leave sufficient study time',
      focused_on: ['Manager approval', 'Study schedule'],
      not_mentioned: ['Project deliverable handoffs'],
      blind_spots: [
        {
          id: 'bs-1',
          title: 'Unnegotiated Schedule Assumption',
          type: 'Assumption',
          why_flagged: 'Have you verified whether your employer offers flexible hours?',
          evidence_quote: 'approved working 10 hours a week',
          evidence_status: 'direct',
          quote_verified: false,
          confidence: 'high',
          status: 'resolved',
        },
        {
          id: 'bs-2',
          title: 'Team Workload Distribution',
          type: 'Risk',
          why_flagged: 'Will reducing hours leave high-priority team tasks stalled during your crunch period?',
          evidence_quote: null,
          evidence_status: 'none',
          quote_verified: false,
          confidence: 'medium',
          status: 'open',
        },
      ],
      top_question: 'Have you aligned with your project team on which tasks will be paused during your 10-hour schedule?',
      status_change_notes: [
        {
          id: 'bs-1',
          from: 'open',
          to: 'resolved',
          reason: 'Manager confirmed and approved 10-hour reduced schedule.',
        },
      ],
    };

    vi.spyOn(geminiService, 'updateAnalysis').mockResolvedValue(mockUpdateResponse);

    const res = await request(app)
      .post('/api/update')
      .send({
        originalText: sampleDecisionText,
        answers: [],
        previousAnalysis: {
          decision: 'Quitting internship',
          blind_spots: [{ id: 'bs-1', status: 'open' }],
        },
        question: questionAsked,
        answer: userAnswer,
      });

    expect(res.status).toBe(200);
    expect(res.body.blind_spots[0].status).toBe('resolved');
    expect(res.body.blind_spots[0].quote_verified).toBe(true);
    expect(res.body.blind_spots[0].evidence_quote).toBe('approved working 10 hours a week');
    expect(res.body.status_change_notes.length).toBe(1);
    expect(res.body.status_change_notes[0].to).toBe('resolved');
  });

  it('Step 4: POST /api/summary generating final synthesis', async () => {
    const mockSummaryResponse = {
      decision: 'Shift to 10 hours/week temporary schedule rather than quitting internship',
      checked: [
        'Confirmed manager willingness to accommodate exam season with 10h/week',
        'Preserved internship status and career continuity while reclaiming study hours',
      ],
      still_unknown: [
        'Whether team commitments are fully delegated during reduced hours',
      ],
      next_checks: [
        'Draft a quick handoff list of ongoing tasks with teammates before starting 10h schedule',
      ],
      disclaimer: 'This is a thinking aid, not advice. The decision is yours.',
    };

    vi.spyOn(geminiService, 'summarizeAnalysis').mockResolvedValue(mockSummaryResponse);

    const res = await request(app)
      .post('/api/summary')
      .send({
        originalText: sampleDecisionText,
        answers: [
          {
            question: 'What would happen if you requested a temporary 10-hour work week from your manager for the exam season?',
            answer: 'I spoke with my manager today and they happily approved working 10 hours a week for the next 4 weeks.',
          },
        ],
        analysis: {
          decision: 'Shift to 10 hours/week temporary schedule',
          blind_spots: [],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.decision).toBe('Shift to 10 hours/week temporary schedule rather than quitting internship');
    expect(res.body.checked.length).toBe(2);
    expect(res.body.still_unknown.length).toBe(1);
    expect(res.body.next_checks.length).toBe(1);
    expect(res.body.disclaimer).toBe('This is a thinking aid, not advice. The decision is yours.');
  });
});
