import { ERROR_CODES } from '../constants/index.js';

/**
 * Standardized Application Error class with HTTP status codes and error types.
 */
export class AppError extends Error {
  /**
   * @param {string} message - User-friendly error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {string} [errorType=ERROR_CODES.AI_SERVICE_ERROR] - Machine-readable error code
   */
  constructor(message, statusCode = 500, errorType = ERROR_CODES.AI_SERVICE_ERROR) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory for validation errors (400)
   * @param {string} message
   * @returns {AppError}
   */
  static validation(message) {
    return new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR);
  }

  /**
   * Factory for missing API key error (500)
   * @returns {AppError}
   */
  static missingApiKey() {
    return new AppError(
      'GEMINI_API_KEY is not configured. Please add your key to .env and restart.',
      500,
      ERROR_CODES.MISSING_API_KEY,
    );
  }

  /**
   * Factory for invalid API key error (401)
   * @returns {AppError}
   */
  static invalidApiKey() {
    return new AppError(
      'Invalid Gemini API key. Please check your key in .env and restart.',
      401,
      ERROR_CODES.INVALID_API_KEY,
    );
  }

  /**
   * Factory for rate limit errors (429)
   * @returns {AppError}
   */
  static rateLimit() {
    return new AppError(
      'Gemini API rate limit or high demand. Please wait a moment and try again.',
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
    );
  }

  /**
   * Factory for timeout errors (504)
   * @returns {AppError}
   */
  static timeout() {
    return new AppError(
      'The AI thinking analysis took too long to complete. Please try again.',
      504,
      ERROR_CODES.TIMEOUT,
    );
  }

  /**
   * Factory for model not found errors (502)
   * @param {string} modelName
   * @returns {AppError}
   */
  static modelNotFound(modelName) {
    return new AppError(
      `The configured Gemini model (${modelName}) was not found. Please verify GEMINI_MODEL in .env`,
      502,
      ERROR_CODES.MODEL_NOT_FOUND,
    );
  }

  /**
   * Factory for invalid AI response schema (502)
   * @returns {AppError}
   */
  static invalidAiResponse() {
    return new AppError(
      'The AI service generated an invalid response. Please retry.',
      502,
      ERROR_CODES.INVALID_AI_RESPONSE,
    );
  }
}
