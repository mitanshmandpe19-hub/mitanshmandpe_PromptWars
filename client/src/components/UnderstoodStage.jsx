import React, { useEffect, useRef, memo } from 'react';
import { HighlightedText } from './HighlightedText.jsx';

/**
 * Stage 2: Understood stage presenting extracted choice, reasons, assumptions, and focus comparison.
 */
export const UnderstoodStage = memo(function UnderstoodStage({
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
          Let&apos;s map out your focus and the assumptions beneath the surface before we dive into
          the blind spots.
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
                  <span className="chip-q-mark" aria-hidden="true">
                    ?
                  </span>{' '}
                  {item}
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
        <p className="section-subtext">Hover over highlighted words to see the linked evidence.</p>
        <HighlightedText
          text={originalText}
          blindSpots={blind_spots}
          activeQuote={activeHighlightQuote}
          onHoverQuote={onHoverQuote}
          onLeaveQuote={onLeaveQuote}
        />
      </div>

      {/* Bottom CTA Row */}
      <div className="stage-cta-row">
        <button type="button" className="btn-secondary" onClick={onStartOver}>
          ← Edit reasoning
        </button>
        <button type="button" className="btn-coral" onClick={onProceed}>
          Examine {blind_spots.length} Blind Spots →
        </button>
      </div>

      <style>{`
        .understood-stage-section { display: flex; flex-direction: column; gap: 28px; }
        .extracted-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .extracted-card { padding: 18px 22px; display: flex; flex-direction: column; gap: 8px; }
        .card-mini-tag { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); }
        .extracted-text { font-size: 1.05rem; line-height: 1.4; color: var(--ink); margin: 0; }
        .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .comparison-box { background: rgba(255, 255, 255, 0.75); border: var(--border-ink); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm); }
        .comparison-heading { font-size: 1.1rem; margin-top: 0; margin-bottom: 12px; }
        .chip-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { display: inline-flex; align-items: center; gap: 4px; font-size: 0.875rem; font-weight: 600; padding: 5px 12px; border-radius: 999px; border: var(--border-ink); }
        .chip-solid { background: var(--coral-light); color: var(--ink); }
        .chip-dashed { background: var(--bg-paper); border-style: dashed; color: var(--ink); }
        .chip-q-mark { color: var(--coral); font-weight: 800; }
        .empty-text { font-style: italic; color: var(--ink-muted); font-size: 0.9rem; }
        .sentence-highlight-section { background: rgba(255, 255, 255, 0.9); border: var(--border-ink); border-radius: var(--radius-md); padding: 22px; box-shadow: var(--shadow-sm); }
        .section-label { font-size: 1.05rem; margin-top: 0; margin-bottom: 4px; }
        .section-subtext { font-size: 0.875rem; color: var(--ink-muted); margin-top: 0; margin-bottom: 14px; }
        .stage-cta-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 10px; }
      `}</style>
    </section>
  );
});

export default UnderstoodStage;
