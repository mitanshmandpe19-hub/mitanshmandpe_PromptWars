import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/index.js';

/**
 * Classifies raw errors from Gemini API / network / schema validation into standardized AppError instances.
 *
 * @param {Error|any} err - The captured error
 * @param {string} [modelName='gemini-3.5-flash-lite'] - Configured model name
 * @returns {AppError}
 */
export function classifyGeminiError(err, modelName = 'gemini-3.5-flash-lite') {
  if (err instanceof AppError) {
    return err;
  }

  const msg = (err?.message || '').toLowerCase();
  const status = err?.status || err?.statusCode || 0;

  if (
    err?.errorType === ERROR_CODES.MISSING_API_KEY ||
    msg.includes('gemini_api_key is not configured') ||
    msg.includes('gemini_api_key is not set')
  ) {
    return AppError.missingApiKey();
  }

  if (err?.code === 'TIMEOUT' || status === 504 || msg.includes('timed out')) {
    return AppError.timeout();
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
    return AppError.invalidApiKey();
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
    return AppError.rateLimit();
  }

  if (
    status === 404 ||
    msg.includes('not found') ||
    msg.includes('not_found') ||
    msg.includes('models/')
  ) {
    return AppError.modelNotFound(modelName);
  }

  if (
    msg.includes('schema validation') ||
    msg.includes('invalid json') ||
    msg.includes('empty response') ||
    msg.includes('failed to generate valid analysis')
  ) {
    return AppError.invalidAiResponse();
  }

  const error = new AppError(
    err?.message || 'Failed to analyze decision with AI companion. Please try again.',
    status >= 400 && status < 600 ? status : 502,
    ERROR_CODES.AI_SERVICE_ERROR,
  );
  return error;
}
