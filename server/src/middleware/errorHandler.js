/**
 * Global error handling middleware.
 * - Never logs user input or secrets
 * - Logs error TYPE and message to console
 * - Returns specific, user-friendly JSON error messages to the client
 */
export function errorHandler(err, req, res, _next) {
  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(
      '[Error 400] Type: SyntaxError | Message: Malformed JSON payload in request body',
    );
    return res.status(400).json({
      error: 'Malformed JSON payload in request body',
    });
  }

  // Handle entity too large errors (payload > 10kb)
  if (err.type === 'entity.too.large') {
    console.error(
      '[Error 413] Type: PayloadTooLarge | Message: Request payload exceeds 10kb limit',
    );
    return res.status(413).json({
      error: 'Request payload exceeds 10kb limit',
    });
  }

  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
  const errorType = err.errorType || err.name || 'Error';

  // Log error TYPE and message to console (never logs user text or API keys)
  console.error(
    `[Error ${statusCode}] Type: ${errorType} | Message: ${err.message || 'Internal error'}`,
  );

  // Return the specific friendly message
  const clientMessage = err.message || 'An unexpected error occurred. Please try again.';

  return res.status(statusCode).json({
    error: clientMessage,
  });
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req, res) {
  const fullPath = req.originalUrl || req.path;
  return res.status(404).json({
    error: `Cannot ${req.method} ${fullPath}`,
  });
}
