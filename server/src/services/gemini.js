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

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const REQUEST_TIMEOUT_MS = 45000;

/**
 * Creates or retrieves the GoogleGenAI client instance.
 *
 * @returns {GoogleGenAI}
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured. Please add your key to .env and restart.');
    error.statusCode = 500;
    error.errorType = 'MISSING_API_KEY';
    throw error;
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
 * Classifies raw errors from Gemini API / network / schema validation into specific, friendly errors.
 *
 * @param {Error} err
 * @param {string} modelName
 * @returns {Error}
 */
export function classifyGeminiError(err, modelName = DEFAULT_MODEL) {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status || err?.statusCode || 0;

  if (err?.errorType === 'MISSING_API_KEY' || msg.includes('gemini_api_key is not configured') || msg.includes('gemini_api_key is not set')) {
    const error = new Error('GEMINI_API_KEY is not configured. Please add your key to .env and restart.');
    error.statusCode = 500;
    error.errorType = 'MISSING_API_KEY';
    return error;
  }

  if (err?.code === 'TIMEOUT' || status === 504 || msg.includes('timed out')) {
    const error = new Error('The AI thinking analysis took too long to complete. Please try again.');
    error.statusCode = 504;
    error.errorType = 'TIMEOUT';
    return error;
  }

  if (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('invalid api key') ||
    msg.includes('unauthenticated') ||
    msg.includes('permission_denied') ||
    status === 401 ||
    status === 403 ||
    (status === 400 && msg.includes('key'))
  ) {
    const error = new Error('Invalid Gemini API key. Please check your key in .env and restart.');
    error.statusCode = 401;
    error.errorType = 'INVALID_API_KEY';
    return error;
  }

  if (
    status === 429 ||
    status === 503 ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('high demand')
  ) {
    const error = new Error('Gemini API rate limit or high demand. Please wait a moment and try again.');
    error.statusCode = 429;
    error.errorType = 'RATE_LIMIT_EXCEEDED';
    return error;
  }

  if (status === 404 || msg.includes('not found') || msg.includes('not_found') || msg.includes('models/')) {
    const error = new Error(`The configured Gemini model (${modelName}) was not found. Please verify GEMINI_MODEL in .env`);
    error.statusCode = 502;
    error.errorType = 'MODEL_NOT_FOUND';
    return error;
  }

  if (
    msg.includes('schema validation') ||
    msg.includes('invalid json') ||
    msg.includes('empty response') ||
    msg.includes('failed to generate valid analysis')
  ) {
    const error = new Error('The AI service generated an invalid response. Please retry.');
    error.statusCode = 502;
    error.errorType = 'INVALID_AI_RESPONSE';
    return error;
  }

  const error = new Error(err?.message || 'Failed to analyze decision with AI companion. Please try again.');
  error.statusCode = status >= 400 && status < 600 ? status : 502;
  error.errorType = 'AI_SERVICE_ERROR';
  return error;
}

/**
 * Wraps a promise with a timeout.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} [operationName='Operation']
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
 * Calls the Gemini API with structured output and executes 1 retry on malformed JSON or schema invalidity.
 *
 * @param {Object} params
 * @param {string} params.prompt
 * @param {Object} params.responseSchema
 * @param {Function} params.zodValidator
 * @param {number} [params.maxRetries=1]
 * @returns {Promise<any>}
 */
export async function callGeminiStructured({
  prompt,
  responseSchema,
  zodValidator,
  maxRetries = 1,
}) {
  const modelName = getModelName();
  let client;
  try {
    client = getGeminiClient();
  } catch (clientErr) {
    throw classifyGeminiError(clientErr, modelName);
  }

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const apiCall = client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2,
        },
      });

      const response = await withTimeout(apiCall, REQUEST_TIMEOUT_MS, 'Gemini request');

      const rawText = response?.text;
      if (!rawText) {
        throw new Error('Received empty response from AI model');
      }

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (jsonErr) {
        throw new Error(`AI generated invalid JSON: ${jsonErr.message}`, { cause: jsonErr });
      }

      const validation = zodValidator(parsed);
      if (!validation.success) {
        throw new Error(`AI response failed schema validation: ${validation.error}`);
      }

      return validation.data;
    } catch (err) {
      lastError = err;

      // Classify error to check if retryable
      const classified = classifyGeminiError(err, modelName);

      // Do not retry on non-retryable auth / config errors
      if (classified.errorType === 'MISSING_API_KEY' || classified.errorType === 'INVALID_API_KEY' || classified.errorType === 'MODEL_NOT_FOUND') {
        throw classified;
      }

      if (attempt < maxRetries) {
        // Will retry once on transient/schema failures
        continue;
      }

      throw classified;
    }
  }

  throw classifyGeminiError(lastError, modelName);
}

/**
 * Analyzes initial decision text.
 *
 * @param {string} text
 * @returns {Promise<Object>}
 */
export async function analyzeDecision(text) {
  const prompt = buildAnalyzePrompt(text);
  return callGeminiStructured({
    prompt,
    responseSchema: GEMINI_ANALYZE_SCHEMA,
    zodValidator: validateAiAnalyzeOutput,
  });
}

/**
 * Updates analysis with user's follow-up answer.
 *
 * @param {Object} params
 * @param {string} params.originalText
 * @param {Array<{question: string, answer: string}>} params.answers
 * @param {Object} params.previousAnalysis
 * @param {string} params.question
 * @param {string} params.answer
 * @returns {Promise<Object>}
 */
export async function updateAnalysis(params) {
  const prompt = buildUpdatePrompt(params);
  return callGeminiStructured({
    prompt,
    responseSchema: GEMINI_UPDATE_SCHEMA,
    zodValidator: validateAiUpdateOutput,
  });
}

/**
 * Generates final thinking summary.
 *
 * @param {Object} params
 * @param {string} params.originalText
 * @param {Array<{question: string, answer: string}>} params.answers
 * @param {Object} params.analysis
 * @returns {Promise<Object>}
 */
export async function summarizeAnalysis(params) {
  const prompt = buildSummaryPrompt(params);
  return callGeminiStructured({
    prompt,
    responseSchema: GEMINI_SUMMARY_SCHEMA,
    zodValidator: validateAiSummaryOutput,
  });
}
