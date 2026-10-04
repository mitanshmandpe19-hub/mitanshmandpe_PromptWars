/**
 * API client for the Blind Spot backend.
 * Reads backend URL from VITE_API_URL or defaults to relative '/api'.
 */
const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
export const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/$/, '')}/api` : '/api';

/**
 * Helper to handle fetch responses safely.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Analyzes the user's initial decision dilemma.
 *
 * @param {string} text - The decision text
 * @param {AbortSignal} [signal] - Optional abort signal to cancel in-flight request
 * @returns {Promise<Object>}
 */
export async function analyzeText(text, signal) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });
  return handleResponse(response);
}

/**
 * Updates the reasoning analysis with the user's follow-up answer.
 *
 * @param {Object} params
 * @param {string} params.originalText
 * @param {Array<{question: string, answer: string}>} params.answers
 * @param {Object} params.previousAnalysis
 * @param {string} params.question
 * @param {string} params.answer
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Object>}
 */
export async function updateSession(params, signal) {
  const response = await fetch(`${API_BASE}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });
  return handleResponse(response);
}

/**
 * Fetches the final thinking summary.
 *
 * @param {Object} params
 * @param {string} params.originalText
 * @param {Array<{question: string, answer: string}>} params.answers
 * @param {Object} params.analysis
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Object>}
 */
export async function getSummary(params, signal) {
  const response = await fetch(`${API_BASE}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });
  return handleResponse(response);
}
