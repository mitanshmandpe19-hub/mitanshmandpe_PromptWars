import React, { useEffect, useRef } from 'react';
import { HighlightedText } from './HighlightedText.jsx';

export function UnderstoodStage({
  originalText,
  analysis,
  activeHighlightQuote,
  onHoverQuote,
  onLeaveQuote,
  onProceed,
  onStartOver,
}) {
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  if (!analysis) return null;

  const {
    decision,
    stated_reason,
    assumption,
    focused_on = [],
    not_mentioned = [],
    blind_spots = [],
  } = analysis;

  return (
    <section className="understood-stage-section" aria-labelledby="understood-stage-title">
      <div className="stage-header">
        <h2 id="understood-stage-title" ref={headingRef} tabIndex={-1} className="stage-title">
          Here is what we caught in your reasoning:
        </h2>
        <p className="stage-subtitle">
          Let&apos;s map out your focus and the assumptions beneath the surface before we dive into the blind spots.
        </p>
      </div>

      {/* Extracted Core Cards */}
      <div className="extracted-grid">
        <div className="sticky-note sticky-coral tilt-left extracted-card">
          <span className="card-mini-tag">Your Stated Goal / Choice</span>
          <h3>{decision || 'Decision under evaluation'}</h3>
        </div>

        <div className="sticky-note sticky-yellow tilt-right extracted-card">
          <span className="card-mini-tag">Primary Reason Given</span>
          <p className="extracted-text">{stated_reason || 'Not specified'}</p>
        </div>

        <div className="sticky-note sticky-sky tilt-left extracted-card">
          <span className="card-mini-tag">Underlying Assumption</span>
          <p className="extracted-text">{assumption || 'Assumes circumstances are fixed'}</p>
        </div>
      </div>

      {/* Two Columns: Focused on vs Didn't Mention */}
      <div className="comparison-grid">
        <div className="comparison-box focus-box">
          <h3 className="comparison-heading">🎯 What you focused on</h3>
          <div className="chip-cloud">
            {focused_on.length > 0 ? (
              focused_on.map((item, i) => (
                <span key={i} className="chip chip-solid">
                  {item}
                </span>
              ))
            ) : (
              <span className="empty-text">None explicitly specified</span>
            )}
          </div>
        </div>

        <div className="comparison-box missed-box">
          <h3 className="comparison-heading">❓ What you didn&apos;t mention</h3>
          <div className="chip-cloud">
            {not_mentioned.length > 0 ? (
              not_mentioned.map((item, i) => (
                <span key={i} className="chip chip-dashed">
                  <span className="chip-q-mark" aria-hidden="true">?</span> {item}
                </span>
              ))
            ) : (
              <span className="empty-text">None flagged</span>
            )}
          </div>
        </div>
      </div>

      {/* Your Sentence, Highlighted */}
      <div className="sentence-highlight-section">
        <h3 className="section-label">📌 Your original words, verified & highlighted:</h3>
        <p className="section-subtext">
          Hover over highlighted words to see the linked evidence.
        </p>
        <HighlightedText
          text={originalText}
          blindSpots={blind_spots}
          activeQuote={activeHighlightQuote}
          onHoverQuote={onHoverQuote}
          onLeaveQuote={onLeaveQuote}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="stage-actions-row">
        <button type="button" className="btn-ghost" onClick={onStartOver}>
          ← Edit decision
        </button>
        <button type="button" className="btn-teal proceed-btn" onClick={onProceed}>
          Next: Examine Blind Spots ({blind_spots.length}) ➔
        </button>
      </div>

      <style>{`
        .understood-stage-section {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .stage-header {
          text-align: center;
        }
        .stage-title {
          margin-bottom: 6px;
        }
        .stage-subtitle {
          font-size: 1.1rem;
          color: var(--ink-muted);
        }
        .extracted-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }
        .extracted-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .card-mini-tag {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-muted);
        }
        .extracted-text {
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.4;
        }
        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }
        .comparison-box {
          background: #fff;
          border: var(--border-ink);
          border-radius: var(--radius-md);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        .comparison-heading {
          font-size: 1.15rem;
          margin-bottom: 14px;
        }
        .chip-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.9rem;
          font-weight: 700;
          border-radius: var(--radius-full);
        }
        .chip-solid {
          background: var(--ink);
          color: #fff;
          border: 1.5px solid var(--ink);
        }
        .chip-dashed {
          background: var(--bg-paper-alt);
          color: var(--ink);
          border: 2px dashed var(--ink);
        }
        .chip-q-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--coral);
          color: #fff;
          font-size: 0.75rem;
        }
        .sentence-highlight-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .section-label {
          font-size: 1.15rem;
        }
        .section-subtext {
          font-size: 0.9rem;
          color: var(--ink-muted);
          margin-bottom: 4px;
        }
        .stage-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 10px;
        }
        .proceed-btn {
          font-size: 1.1rem;
          padding: 12px 28px;
        }
      `}</style>
    </section>
  );
}
