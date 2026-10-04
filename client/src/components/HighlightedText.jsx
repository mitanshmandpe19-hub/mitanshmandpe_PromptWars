import React from 'react';

/**
 * Renders user text with verified evidence quotes highlighted like a yellow marker.
 *
 * @param {Object} props
 * @param {string} props.text
 * @param {Array<Object>} props.blindSpots
 * @param {string|null} props.activeQuote
 * @param {Function} [props.onHoverQuote]
 * @param {Function} [props.onLeaveQuote]
 */
export function HighlightedText({
  text = '',
  blindSpots = [],
  activeQuote = null,
  onHoverQuote,
  onLeaveQuote,
}) {
  if (!text) return null;

  // Filter only verified quotes with valid text
  const verifiedQuotes = blindSpots
    .filter((bs) => bs.quote_verified && bs.evidence_quote && bs.evidence_quote.trim())
    .map((bs) => bs.evidence_quote.trim());

  if (verifiedQuotes.length === 0) {
    return (
      <div className="highlighted-text-box">
        <p className="original-sentence">{text}</p>
      </div>
    );
  }

  // Find occurrences of verified quotes in text
  // We can locate all occurrences safely with regex matching
  const escapedQuotes = verifiedQuotes.map((q) =>
    q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`(${escapedQuotes.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <div className="highlighted-text-box" tabIndex={0} aria-label="Original decision text with verified evidence highlights">
      <p className="original-sentence">
        {parts.map((part, index) => {
          const matchedQuote = verifiedQuotes.find(
            (q) => q.toLowerCase() === part.toLowerCase()
          );

          if (matchedQuote) {
            const isActive =
              activeQuote &&
              activeQuote.toLowerCase() === matchedQuote.toLowerCase();

            return (
              <mark
                key={index}
                className={`highlight-quote ${isActive ? 'active' : ''}`}
                onMouseEnter={() => onHoverQuote && onHoverQuote(matchedQuote)}
                onMouseLeave={() => onLeaveQuote && onLeaveQuote()}
                onFocus={() => onHoverQuote && onHoverQuote(matchedQuote)}
                onBlur={() => onLeaveQuote && onLeaveQuote()}
                tabIndex={0}
                role="button"
                aria-label={`Verified quote: "${part}"`}
              >
                {part}
              </mark>
            );
          }

          return <span key={index}>{part}</span>;
        })}
      </p>

      <style>{`
        .highlighted-text-box {
          background: #fff;
          border: var(--border-ink);
          border-radius: var(--radius-md);
          padding: 18px 22px;
          box-shadow: var(--shadow-sm);
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .original-sentence {
          color: var(--ink);
          font-weight: 500;
        }
        .highlight-quote {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
