import { z } from 'zod';

/* =========================================================================
   ZOD SCHEMAS (Runtime validation of AI responses)
   ========================================================================= */

export const BlindSpotTypeEnum = z.enum(['Assumption', 'Risk', 'Missing Factor']);
export const EvidenceStatusEnum = z.enum(['direct', 'indirect', 'none']);
export const ConfidenceEnum = z.enum(['low', 'medium', 'high']);
export const StatusEnum = z.enum(['open', 'partial', 'resolved']);

export const BlindSpotItemSchema = z.object({
  id: z.string().default(() => `bs-${Math.random().toString(36).substring(2, 7)}`),
  title: z.string().min(1),
  type: BlindSpotTypeEnum,
  why_flagged: z.string().min(1),
  evidence_quote: z.string().nullable().optional().default(null),
  evidence_status: EvidenceStatusEnum.default('none'),
  quote_verified: z.boolean().default(false),
  confidence: ConfidenceEnum.default('medium'),
  status: StatusEnum.default('open'),
});

export const AnalyzeResponseZodSchema = z.object({
  needs_more_input: z.boolean().default(false),
  decision: z.string().nullable().optional().default(null),
  stated_reason: z.string().nullable().optional().default(null),
  assumption: z.string().nullable().optional().default(null),
  focused_on: z.array(z.string()).default([]),
  not_mentioned: z.array(z.string()).default([]),
  blind_spots: z.array(BlindSpotItemSchema).max(3).default([]),
  top_question: z.string().nullable().optional().default(null),
});

export const StatusChangeNoteSchema = z.object({
  id: z.string(),
  from: StatusEnum,
  to: StatusEnum,
  reason: z.string(),
});

export const UpdateResponseZodSchema = AnalyzeResponseZodSchema.extend({
  status_change_notes: z.array(StatusChangeNoteSchema).default([]),
});

export const SummaryResponseZodSchema = z.object({
  decision: z.string().min(1),
  checked: z.array(z.string()).default([]),
  still_unknown: z.array(z.string()).default([]),
  next_checks: z.array(z.string()).default([]),
  disclaimer: z.string().default('This is a thinking aid, not advice. The decision is yours.'),
});

/* =========================================================================
   GEMINI API JSON SCHEMAS (OpenAPI-compatible for structured outputs)
   ========================================================================= */

export const GEMINI_ANALYZE_SCHEMA = {
  type: 'object',
  properties: {
    needs_more_input: {
      type: 'boolean',
      description: 'Set to true if input is spam, gibberish, or not a decision/reasoning',
    },
    decision: {
      type: 'string',
      description: 'The core decision or choice the user is weighing',
    },
    stated_reason: {
      type: 'string',
      description: 'The primary reason or rationale given by the user',
    },
    assumption: {
      type: 'string',
      description: 'Key underlying unstated assumption behind the decision',
    },
    focused_on: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key factors the user explicitly paid attention to',
    },
    not_mentioned: {
      type: 'array',
      items: { type: 'string' },
      description: 'Critical factors, alternatives, or stakeholders not mentioned',
    },
    blind_spots: {
      type: 'array',
      description: 'At most 3 blind spots, ranked by impact',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', description: 'Concise title of the blind spot' },
          type: {
            type: 'string',
            enum: ['Assumption', 'Risk', 'Missing Factor'],
          },
          why_flagged: {
            type: 'string',
            description: 'Why this represents an unexamined risk or gap, phrased as a question/consideration',
          },
          evidence_quote: {
            type: 'string',
            description: 'Exact verbatim quote from user text, or omit if none',
          },
          evidence_status: {
            type: 'string',
            enum: ['direct', 'indirect', 'none'],
          },
          quote_verified: { type: 'boolean' },
          confidence: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
          status: {
            type: 'string',
            enum: ['open', 'partial', 'resolved'],
          },
        },
        required: ['id', 'title', 'type', 'why_flagged', 'evidence_status', 'confidence', 'status'],
      },
    },
    top_question: {
      type: 'string',
      description: 'Exactly ONE thoughtful question prompting the user to examine the most crucial blind spot',
    },
  },
  required: [
    'needs_more_input',
    'focused_on',
    'not_mentioned',
    'blind_spots',
  ],
};

export const GEMINI_UPDATE_SCHEMA = {
  type: 'object',
  properties: {
    needs_more_input: { type: 'boolean' },
    decision: { type: 'string' },
    stated_reason: { type: 'string' },
    assumption: { type: 'string' },
    focused_on: {
      type: 'array',
      items: { type: 'string' },
    },
    not_mentioned: {
      type: 'array',
      items: { type: 'string' },
    },
    blind_spots: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          type: {
            type: 'string',
            enum: ['Assumption', 'Risk', 'Missing Factor'],
          },
          why_flagged: { type: 'string' },
          evidence_quote: { type: 'string' },
          evidence_status: {
            type: 'string',
            enum: ['direct', 'indirect', 'none'],
          },
          quote_verified: { type: 'boolean' },
          confidence: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
          status: {
            type: 'string',
            enum: ['open', 'partial', 'resolved'],
          },
        },
        required: ['id', 'title', 'type', 'why_flagged', 'evidence_status', 'confidence', 'status'],
      },
    },
    top_question: {
      type: 'string',
      description: 'New single top question, or null if nothing critical remains',
    },
    status_change_notes: {
      type: 'array',
      description: 'Notes on changes in blind spot statuses',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          from: { type: 'string', enum: ['open', 'partial', 'resolved'] },
          to: { type: 'string', enum: ['open', 'partial', 'resolved'] },
          reason: { type: 'string' },
        },
        required: ['id', 'from', 'to', 'reason'],
      },
    },
  },
  required: [
    'needs_more_input',
    'focused_on',
    'not_mentioned',
    'blind_spots',
    'status_change_notes',
  ],
};

export const GEMINI_SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    decision: {
      type: 'string',
      description: 'Summary of the decision being considered',
    },
    checked: {
      type: 'array',
      items: { type: 'string' },
      description: 'Factors, assumptions, or risks examined and resolved',
    },
    still_unknown: {
      type: 'array',
      items: { type: 'string' },
      description: 'Factors, assumptions, or risks that remain unverified or open',
    },
    next_checks: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable observations or validations the user can do next. Must map directly to open or partial blind spots.',
    },
    disclaimer: {
      type: 'string',
      description: 'Must be exactly: "This is a thinking aid, not advice. The decision is yours."',
    },
  },
  required: ['decision', 'checked', 'still_unknown', 'next_checks', 'disclaimer'],
};
