/**
 * Normalizes text for tolerant substring matching:
 * - Case-insensitive
 * - Whitespace-normalized (multiple spaces, newlines collapsed)
 * - Punctuation-tolerant (smart quotes, dashes, punctuation stripped/standardized)
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeForQuoteMatch(text) {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\w\s]/g, '') // remove remaining punctuation/symbols
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether a quote is a verified substring within the aggregated user text.
 *
 * @param {string|null|undefined} quote
 * @param {string} userCorpus
 * @returns {boolean}
 */
export function isQuoteInText(quote, userCorpus) {
  if (!quote || typeof quote !== 'string') return false;
  const normalizedQuote = normalizeForQuoteMatch(quote);
  if (!normalizedQuote) return false;

  const normalizedCorpus = normalizeForQuoteMatch(userCorpus);
  return normalizedCorpus.includes(normalizedQuote);
}

/**
 * Extracts and concatenates all user text (original text + all answers) into a single corpus.
 *
 * @param {string} originalText
 * @param {Array<{answer: string}>|Array<string>} [answers=[]]
 * @param {string} [latestAnswer='']
 * @returns {string}
 */
export function buildUserCorpus(originalText = '', answers = [], latestAnswer = '') {
  const parts = [originalText];

  if (Array.isArray(answers)) {
    for (const item of answers) {
      if (typeof item === 'string') {
        parts.push(item);
      } else if (item && typeof item.answer === 'string') {
        parts.push(item.answer);
      }
    }
  }

  if (latestAnswer && typeof latestAnswer === 'string') {
    parts.push(latestAnswer);
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Pure function to verify and sanitize quotes in blind spots.
 * For each blind spot with an evidence_quote:
 * - Checks if evidence_quote is a substring of all user text so far.
 * - If found: quote_verified = true, evidence_status = direct/indirect
 * - If not found: quote_verified = false, evidence_status = "none", evidence_quote = null
 *
 * @param {Array<Object>} blindSpots
 * @param {string} userCorpus - Concatenated text from user
 * @returns {Array<Object>}
 */
export function verifyBlindSpotQuotes(blindSpots = [], userCorpus = '') {
  if (!Array.isArray(blindSpots)) return [];

  return blindSpots.map((spot) => {
    const rawQuote = spot.evidence_quote;

    if (!rawQuote || typeof rawQuote !== 'string' || !rawQuote.trim()) {
      return {
        ...spot,
        evidence_quote: null,
        evidence_status: 'none',
        quote_verified: false,
      };
    }

    const verified = isQuoteInText(rawQuote, userCorpus);

    if (verified) {
      return {
        ...spot,
        evidence_quote: rawQuote.trim(),
        evidence_status:
          spot.evidence_status === 'none' ? 'direct' : spot.evidence_status || 'direct',
        quote_verified: true,
      };
    }

    return {
      ...spot,
      evidence_quote: null,
      evidence_status: 'none',
      quote_verified: false,
    };
  });
}
