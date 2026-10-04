import { z } from 'zod';
import {
  AnalyzeResponseZodSchema,
  UpdateResponseZodSchema,
  SummaryResponseZodSchema,
} from '../prompts/schemas.js';

/**
 * Strips ASCII control characters except standard whitespace (\n, \r, \t).
 *
 * @param {string} text
 * @returns {string}
 */
export function stripControlCharacters(text) {
  if (typeof text !== 'string') return '';
  // Removes control chars \x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitizes input string: strips control characters and trims whitespace.
 *
 * @param {unknown} val
 * @returns {string}
 */
export function sanitizeInputString(val) {
  if (typeof val !== 'string') return '';
  return stripControlCharacters(val).trim();
}

/* =========================================================================
   REQUEST VALIDATION SCHEMAS
   ========================================================================= */

const stringField = (fieldName, minLen, maxLen) =>
  z
    .string({
      error: `${fieldName} is required`,
    })
    .transform(sanitizeInputString)
    .refine((val) => val.length >= minLen, {
      message: `${fieldName} must be at least ${minLen} characters long`,
    })
    .refine((val) => val.length <= maxLen, {
      message: `${fieldName} cannot exceed ${maxLen} characters`,
    });

const AnswerItemSchema = z.object({
  question: stringField('question', 1, 500),
  answer: stringField('answer', 1, 1500),
});

export const AnalyzeRequestSchema = z.object({
  text: stringField('Text', 10, 1500),
});

export const UpdateRequestSchema = z.object({
  originalText: stringField('originalText', 10, 1500),
  answers: z
    .array(AnswerItemSchema)
    .max(50, 'Cannot exceed 50 previous answers')
    .optional()
    .default([]),
  previousAnalysis: z.record(z.any(), {
    error: 'previousAnalysis object is required',
  }),
  question: stringField('question', 1, 500),
  answer: stringField('answer', 1, 1500),
});

export const SummaryRequestSchema = z.object({
  originalText: stringField('originalText', 10, 1500),
  answers: z.array(AnswerItemSchema).max(50, 'Cannot exceed 50 answers').optional().default([]),
  analysis: z.record(z.any(), {
    error: 'analysis object is required',
  }),
});

/* =========================================================================
   VALIDATION HELPERS
   ========================================================================= */

/**
 * Helper to extract issues list from Zod error.
 */
function getErrorIssues(error) {
  if (!error) return [];
  if (Array.isArray(error.issues)) return error.issues;
  if (Array.isArray(error.errors)) return error.errors;
  return [];
}

/**
 * Validates request payload against a Zod schema.
 *
 * @param {z.ZodSchema} schema
 * @param {unknown} data
 * @returns {{ success: boolean, data?: any, error?: string }}
 */
export function validateRequest(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = getErrorIssues(result.error);
    const errorMsg = issues.map((e) => e.message).join('; ') || 'Invalid request parameters';
    return { success: false, error: errorMsg };
  }
  return { success: true, data: result.data };
}

/**
 * Validates AI JSON response against the Analyze schema.
 *
 * @param {unknown} rawData
 * @returns {{ success: boolean, data?: any, error?: string }}
 */
export function validateAiAnalyzeOutput(rawData) {
  const result = AnalyzeResponseZodSchema.safeParse(rawData);
  if (!result.success) {
    const issues = getErrorIssues(result.error);
    const errorMsg =
      issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ') ||
      'Schema validation failed';
    return { success: false, error: errorMsg };
  }
  return { success: true, data: result.data };
}

/**
 * Validates AI JSON response against the Update schema.
 *
 * @param {unknown} rawData
 * @returns {{ success: boolean, data?: any, error?: string }}
 */
export function validateAiUpdateOutput(rawData) {
  const result = UpdateResponseZodSchema.safeParse(rawData);
  if (!result.success) {
    const issues = getErrorIssues(result.error);
    const errorMsg =
      issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ') ||
      'Schema validation failed';
    return { success: false, error: errorMsg };
  }
  return { success: true, data: result.data };
}

/**
 * Validates AI JSON response against the Summary schema.
 *
 * @param {unknown} rawData
 * @returns {{ success: boolean, data?: any, error?: string }}
 */
export function validateAiSummaryOutput(rawData) {
  const result = SummaryResponseZodSchema.safeParse(rawData);
  if (!result.success) {
    const issues = getErrorIssues(result.error);
    const errorMsg =
      issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ') ||
      'Schema validation failed';
    return { success: false, error: errorMsg };
  }
  return { success: true, data: result.data };
}
