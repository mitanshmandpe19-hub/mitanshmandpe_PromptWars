import { GoogleGenAI } from '@google/genai';
import {
  SYSTEM_PROMPT,
  buildAnalyzePrompt,
  buildUpdatePrompt,
  buildSummaryPrompt,
} from '../prompts/systemPrompt.js';
import {
  GEMINI_ANALYZE_SCHEMA,
  GEMINI_UPDATE_SCHEMA,
  GEMINI_SUMMARY_SCHEMA,
} from '../prompts/schemas.js';
import {
  validateAiAnalyzeOutput,
  validateAiUpdateOutput,
  validateAiSummaryOutput,
} from './validation.js';
import { classifyGeminiError } from './errorClassifier.js';
import { withTransientRetry } from './retry.js';
import { LIMITS } from '../constants/index.js';
import { AppError } from '../errors/AppError.js';

export { classifyGeminiError };

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

/**
 * Creates or retrieves the GoogleGenAI client instance.
 *
 * @returns {GoogleGenAI}
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw AppError.missingApiKey();
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Gets the configured model name with fallback for deprecated names.
 *
 * @returns {string}
 */
export function getModelName() {
  let model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  if (model.includes('=')) {
    model = model.split('=').pop();
  }
  model = model.trim();
  if (model.startsWith('gemini-2.5-flash-lite') || model.startsWith('gemini-2.0-flash-lite')) {
    return 'gemini-3.5-flash-lite';
  }
  if (model.startsWith('gemini-2.5-flash') || model.startsWith('gemini-2.0-flash')) {
    return 'gemini-3.5-flash';
  }
  return model || DEFAULT_MODEL;
}

/**
 * Wraps a promise with a timeout.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} [operationName='Gemini API call']
 * @returns {Promise<T>}
 */
function withTimeout(promise, ms, operationName = 'Gemini API call') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${operationName} timed out after ${ms}ms`);
      err.code = 'TIMEOUT';
      err.statusCode = 504;
      reject(err);
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Core helper to invoke Gemini generateContent with schema, timeout, retry, and validation.
 *
 * @template T
 * @param {string} promptText
 * @param {Object} schema
 * @param {(data: any) => T} validatorFn
 * @param {number} [maxOutputTokens=1000]
 * @returns {Promise<T>}
 */
async function callGemini(promptText, schema, validatorFn, maxOutputTokens = 1000) {
  const ai = getGeminiClient();
  const modelName = getModelName();

  return withTransientRetry(async () => {
    try {
      const apiCall = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2,
          maxOutputTokens,
        },
      });

      const response = await withTimeout(
        apiCall,
        LIMITS.REQUEST_TIMEOUT_MS,
        'Gemini thinking analysis',
      );
      const responseText = response?.text;

      if (!responseText || typeof responseText !== 'string') {
        throw new Error('Gemini API returned an empty response');
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        throw new Error('Failed to parse Gemini response as JSON');
      }

      return validatorFn(parsed);
    } catch (err) {
      throw classifyGeminiError(err, modelName);
    }
  });
}

/**
 * Generates initial reasoning analysis for user's dilemma.
 *
 * @param {string} text - User's dilemma
 * @returns {Promise<import('./validation.js').AiAnalyzeOutput>}
 */
export async function analyzeDecision(text) {
  const prompt = buildAnalyzePrompt(text);
  return callGemini(prompt, GEMINI_ANALYZE_SCHEMA, validateAiAnalyzeOutput, 1000);
}

/**
 * Updates reasoning analysis with user's follow-up answer.
 *
 * @param {Object} params
 * @param {string} params.originalText
 * @param {Array<{question: string, answer: string}>} params.answers
 * @param {Object} params.previousAnalysis
 * @param {string} params.question
 * @param {string} params.answer
 * @returns {Promise<import('./validation.js').AiUpdateOutput>}
 */
export async function updateDecision(params) {
  const prompt = buildUpdatePrompt(params);
  return callGemini(prompt, GEMINI_UPDATE_SCHEMA, validateAiUpdateOutput, 1000);
}

/**
 * Generates final thinking summary.
 *
 * @param {Object} params
 * @param {string} params.originalText
 * @param {Array<{question: string, answer: string}>} params.answers
 * @param {Object} params.analysis
 * @returns {Promise<import('./validation.js').AiSummaryOutput>}
 */
export async function summarizeDecision(params) {
  const prompt = buildSummaryPrompt(params);
  return callGemini(prompt, GEMINI_SUMMARY_SCHEMA, validateAiSummaryOutput, 800);
}

// Named aliases for compatibility
export const updateAnalysis = updateDecision;
export const summarizeAnalysis = summarizeDecision;
export const analyzeText = analyzeDecision;
