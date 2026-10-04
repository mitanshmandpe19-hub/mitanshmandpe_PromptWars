import { describe, it, expect } from 'vitest';
import {
  SYSTEM_PROMPT,
  buildAnalyzePrompt,
  buildUpdatePrompt,
  buildSummaryPrompt,
} from '../src/prompts/systemPrompt.js';

describe('System Prompts and Builders', () => {
  it('SYSTEM_PROMPT includes core product rules', () => {
    expect(SYSTEM_PROMPT).toContain('NEVER DECIDE OR ADVISE');
    expect(SYSTEM_PROMPT).toContain('EVIDENCE QUOTES');
    expect(SYSTEM_PROMPT).toContain('RETURN AT MOST 3 BLIND SPOTS');
  });

  it('buildAnalyzePrompt embeds text within user_text tags', () => {
    const prompt = buildAnalyzePrompt('Should I take job offer A or B?');
    expect(prompt).toContain('<user_text>');
    expect(prompt).toContain('Should I take job offer A or B?');
    expect(prompt).toContain('</user_text>');
  });

  it('buildUpdatePrompt embeds previous rounds, latest question, and user answer', () => {
    const prompt = buildUpdatePrompt({
      originalText: 'Original text',
      answers: [{ question: 'Q1', answer: 'A1' }],
      previousAnalysis: { decision: 'Test' },
      question: 'Q2',
      answer: 'A2',
    });
    expect(prompt).toContain('Original text');
    expect(prompt).toContain('Round 1:\nQ: Q1\nA: A1');
    expect(prompt).toContain('Question: Q2');
    expect(prompt).toContain('<user_answer>\nA2\n</user_answer>');
  });

  it('buildSummaryPrompt embeds history and exact required disclaimer', () => {
    const prompt = buildSummaryPrompt({
      originalText: 'My decision',
      answers: [{ question: 'Q1', answer: 'A1' }],
      analysis: { decision: 'My decision' },
    });
    expect(prompt).toContain('My decision');
    expect(prompt).toContain('Q1: Q1\nA1: A1');
    expect(prompt).toContain('This is a thinking aid, not advice. The decision is yours.');
  });
});
