/**
 * API client for the Blind Spot backend.
 */

const API_BASE = '/api';

/**
 * Helper to handle fetch responses safely.
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
 * @param {string} text
 * @returns {Promise<Object>}
 */
export async function analyzeText(text) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
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
 * @returns {Promise<Object>}
 */
export async function updateSession(params) {
  const response = await fetch(`${API_BASE}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
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
 * @returns {Promise<Object>}
 */
export async function getSummary(params) {
  const response = await fetch(`${API_BASE}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(response);
}
