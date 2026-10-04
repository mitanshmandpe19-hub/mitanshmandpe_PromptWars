import React, { useState } from 'react';
import { EvidenceBadge } from './EvidenceBadge.jsx';

/**
 * Interactive sticky-note card representing a single flagged blind spot.
 *
 * @param {Object} props
 * @param {Object} props.spot
 * @param {number} props.index
 * @param {boolean} [props.isHighlighted]
 * @param {Object} [props.statusChangeNote]
 * @param {Function} [props.onHoverQuote]
 * @param {Function} [props.onLeaveQuote]
 */
export function BlindSpotCard({
  spot,
  index = 0,
  isHighlighted = false,
  statusChangeNote = null,
  onHoverQuote,
  onLeaveQuote,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeClassMap = {
    Assumption: 'sticky-yellow',
    Risk: 'sticky-coral',
    'Missing Factor': 'sticky-sky',
  };

  const stickyTypeClass = typeClassMap[spot.type] || 'sticky-yellow';
  const tiltClass = index % 2 === 0 ? 'tilt-left' : 'tilt-right';

  const hasVerifiedQuote = spot.quote_verified && spot.evidence_quote;

  const handleMouseEnter = () => {
    if (hasVerifiedQuote && onHoverQuote) {
      onHoverQuote(spot.evidence_quote);
    }
  };

  const handleMouseLeave = () => {
    if (onLeaveQuote) {
      onLeaveQuote();
    }
  };

  return (
    <article
      className={`sticky-note ${stickyTypeClass} ${tiltClass} blind-spot-card ${
        isHighlighted ? 'highlighted-card' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
      aria-labelledby={`spot-title-${spot.id}`}
    >
      {/* Top Metadata Row */}
      <div className="card-top-row">
        <span className="type-tag">{spot.type}</span>

        <div className="status-stamps-group">
          {spot.status === 'resolved' && (
            <span className="rubber-stamp stamp-resolved" aria-label="Status: Resolved">
              ✓ RESOLVED
            </span>
          )}
          {spot.status === 'partial' && (
            <span className="rubber-stamp stamp-partial" aria-label="Status: Partly Addressed">
              ~ PARTIAL
            </span>
          )}
          {hasVerifiedQuote && (
            <span className="rubber-stamp stamp-verified" aria-label="Verified against user text">
              ★ QUOTE VERIFIED
            </span>
          )}
        </div>
      </div>

      {/* Main Title */}
      <h3 id={`spot-title-${spot.id}`} className="spot-title">
        {spot.title}
      </h3>

      {/* Evidence and Confidence Indicators */}
      <div className="card-meta-row">
        <EvidenceBadge status={spot.evidence_status} />

        <div className="confidence-meter" title={`Confidence: ${spot.confidence}`}>
          <span className="confidence-label">Impact:</span>
          <span className={`confidence-dot ${spot.confidence === 'high' || spot.confidence === 'medium' || spot.confidence === 'low' ? 'filled' : ''}`} />
          <span className={`confidence-dot ${spot.confidence === 'high' || spot.confidence === 'medium' ? 'filled' : ''}`} />
          <span className={`confidence-dot ${spot.confidence === 'high' ? 'filled' : ''}`} />
          <span className="confidence-text">{spot.confidence}</span>
        </div>
      </div>

      {/* Evidence Quote if Verified */}
      {hasVerifiedQuote && (
        <blockquote className="evidence-quote-box">
          <span className="quote-mark">“</span>
          <span className="quote-text">{spot.evidence_quote}</span>
          <span className="quote-mark">”</span>
        </blockquote>
      )}

      {/* Expand / Collapse Why Flagged Accordion */}
      <div className="why-flagged-section">
        <button
          type="button"
          className="why-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide perspective ▴' : 'Why we flagged this ▾'}</span>
        </button>

        {isExpanded && (
          <div className="why-content">
            <p>{spot.why_flagged}</p>
          </div>
        )}
      </div>

      {/* Status Change Note if just updated */}
      {statusChangeNote && (
        <div className="status-note-banner">
          <span className="note-icon">💬</span>
          <span className="note-text">{statusChangeNote.reason}</span>
        </div>
      )}

      <style>{`
        .blind-spot-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .highlighted-card {
          box-shadow: 0 0 0 4px var(--coral), var(--shadow-lg) !important;
          transform: scale(1.02) !important;
        }
        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .type-tag {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--ink);
          color: #fff;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }
        .status-stamps-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .spot-title {
          font-size: 1.25rem;
          line-height: 1.3;
          margin: 0;
        }
        .card-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .confidence-meter {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--ink-muted);
        }
        .confidence-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid var(--ink);
          background: #e2e4ea;
        }
        .confidence-dot.filled {
          background: var(--ink);
        }
        .confidence-text {
          text-transform: capitalize;
          margin-left: 2px;
        }
        .evidence-quote-box {
          background: rgba(255, 255, 255, 0.75);
          border-left: 3.5px solid var(--ink);
          padding: 8px 12px;
          border-radius: 4px;
          font-style: italic;
          font-size: 0.9rem;
          color: var(--ink);
          margin: 0;
        }
        .why-toggle-btn {
          background: transparent;
          border: none;
          box-shadow: none;
          color: var(--ink);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 4px 0;
          min-height: auto;
          min-width: auto;
          cursor: pointer;
          text-decoration: underline;
        }
        .why-toggle-btn:hover {
          transform: none;
          color: var(--coral);
        }
        .why-content {
          margin-top: 8px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid var(--ink);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .status-note-banner {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          background: var(--bg-paper);
          border: 1.5px solid var(--ink);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          font-size: 0.825rem;
          font-weight: 600;
          margin-top: 4px;
        }
      `}</style>
    </article>
  );
}
