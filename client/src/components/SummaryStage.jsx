import React, { useState, useEffect, useRef } from 'react';
import {
  formatSummaryReceiptText,
  copyTextToClipboard,
  downloadTextFile,
} from '../utils/exportHelpers.js';

/**
 * Stage 4: Keepsake thinking receipt summary and export options.
 */
export function SummaryStage({ summary, originalText, answers = [], onStartOver }) {
  const [copied, setCopied] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  if (!summary) return null;

  const {
    decision,
    checked = [],
    still_unknown = [],
    next_checks = [],
    disclaimer = 'This is a thinking aid, not advice. The decision is yours.',
  } = summary;

  const receiptText = formatSummaryReceiptText({
    decision,
    originalText,
    checked,
    still_unknown,
    next_checks,
    disclaimer,
  });

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(receiptText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownload = () => {
    downloadTextFile(
      receiptText,
      `blind-spot-summary-${new Date().toISOString().slice(0, 10)}.txt`,
    );
  };

  return (
    <section className="summary-stage-section" aria-labelledby="summary-stage-title">
      <div className="stage-header no-print">
        <h2 id="summary-stage-title" ref={headingRef} tabIndex={-1} className="stage-title">
          Your Thinking Receipt 🧾
        </h2>
        <p className="stage-subtitle">
          Here is your personalized summary of explored assumptions, remaining risks, and next
          steps.
        </p>
      </div>

      {/* Keepsake Receipt Card */}
      <div className="receipt-card" id="printable-receipt">
        <div className="receipt-header">
          <span className="receipt-brand font-display">BLIND SPOT</span>
          <span className="receipt-date">
            {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-section">
          <span className="receipt-label">DECISION EXPLORED</span>
          <h3 className="receipt-decision">{decision}</h3>
        </div>

        {/* Checked Section */}
        {checked.length > 0 && (
          <div className="receipt-section">
            <span className="receipt-label-green">✓ WHAT YOU CHECKED & CLARIFIED</span>
            <ul className="receipt-list">
              {checked.map((item, idx) => (
                <li key={idx} className="receipt-list-item checked-item">
                  <span className="item-icon">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Still Unknown Section */}
        {still_unknown.length > 0 && (
          <div className="receipt-section">
            <span className="receipt-label-yellow">? WHAT REMAINS UNCERTAIN</span>
            <ul className="receipt-list">
              {still_unknown.map((item, idx) => (
                <li key={idx} className="receipt-list-item unknown-item">
                  <span className="item-icon">?</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Checks Section */}
        {next_checks.length > 0 && (
          <div className="receipt-section">
            <span className="receipt-label-coral">★ CONCRETE NEXT OBSERVATIONS / CHECKS</span>
            <ul className="receipt-list">
              {next_checks.map((item, idx) => (
                <li key={idx} className="receipt-list-item next-check-item">
                  <span className="item-icon">★</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="receipt-divider" />

        <div className="receipt-disclaimer-box">
          <p className="disclaimer-text">{disclaimer}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="receipt-actions no-print">
        <button type="button" className="btn-secondary action-btn" onClick={handleCopy}>
          {copied ? '✓ Copied to clipboard!' : '📋 Copy Summary'}
        </button>

        <button type="button" className="btn-secondary action-btn" onClick={handleDownload}>
          💾 Download .txt
        </button>

        <button type="button" className="btn-secondary action-btn" onClick={() => window.print()}>
          🖨️ Print Receipt
        </button>

        <button type="button" className="btn-coral action-btn restart-btn" onClick={onStartOver}>
          Explore Another Decision ↵
        </button>
      </div>
    </section>
  );
}

export default SummaryStage;
