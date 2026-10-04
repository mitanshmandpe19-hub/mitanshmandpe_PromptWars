import React, { useState, useEffect, useRef } from 'react';

export function SummaryStage({
  summary,
  originalText,
  answers = [],
  onStartOver,
}) {
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

  const formattedSummaryText = `BLIND SPOT — THINKING SUMMARY
=========================================
DECISION:
${decision}

ORIGINAL REASONING:
${originalText}

WHAT WAS CHECKED:
${checked.map((c) => `• ${c}`).join('\n')}

WHAT REMAINS UNKNOWN:
${still_unknown.map((u) => `• ${u}`).join('\n')}

ACTIONABLE NEXT CHECKS:
${next_checks.map((n) => `• ${n}`).join('\n')}

-----------------------------------------
${disclaimer}
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedSummaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blind-spot-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="summary-stage-section" aria-labelledby="summary-stage-title">
      <div className="stage-header no-print">
        <h2 id="summary-stage-title" ref={headingRef} tabIndex={-1} className="stage-title">
          Your Thinking Receipt 🧾
        </h2>
        <p className="stage-subtitle">
          Here is your personalized summary of explored assumptions, remaining risks, and next steps.
        </p>
      </div>

      {/* Keepsake Receipt Card */}
      <div className="receipt-card" id="printable-receipt">
        <div className="receipt-header">
          <span className="receipt-brand font-display">BLIND SPOT</span>
          <span className="receipt-date">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
        </div>

        <div className="receipt-divider" />

        {/* Decision Title */}
        <div className="receipt-section">
          <span className="receipt-label">DECISION EXPLORED</span>
          <h3 className="receipt-decision">{decision}</h3>
        </div>

        {/* Checked Section */}
        <div className="receipt-section">
          <span className="receipt-label checked-label">✓ WHAT YOU CHECKED & CLARIFIED</span>
          <ul className="receipt-list">
            {checked.length > 0 ? (
              checked.map((item, i) => (
                <li key={i} className="receipt-item checked-item">
                  <span className="check-icon">✓</span> {item}
                </li>
              ))
            ) : (
              <li className="receipt-item empty-item">No points marked fully resolved</li>
            )}
          </ul>
        </div>

        {/* Still Unknown Section */}
        <div className="receipt-section">
          <span className="receipt-label unknown-label">~ STILL UNKNOWN / OPEN RISKS</span>
          <ul className="receipt-list">
            {still_unknown.length > 0 ? (
              still_unknown.map((item, i) => (
                <li key={i} className="receipt-item unknown-item">
                  <span className="unknown-icon">?</span> {item}
                </li>
              ))
            ) : (
              <li className="receipt-item empty-item">All flagged uncertainties were explored</li>
            )}
          </ul>
        </div>

        {/* Next Checks Section */}
        <div className="receipt-section">
          <span className="receipt-label next-label">🔍 WHAT YOU COULD CHECK NEXT</span>
          <ul className="receipt-list">
            {next_checks.length > 0 ? (
              next_checks.map((item, i) => (
                <li key={i} className="receipt-item next-item">
                  <span className="next-icon">➔</span> {item}
                </li>
              ))
            ) : (
              <li className="receipt-item empty-item">No further immediate checks recommended</li>
            )}
          </ul>
        </div>

        <div className="receipt-divider" />

        {/* Mandatory Disclaimer */}
        <div className="receipt-disclaimer">
          <p className="disclaimer-text">
            <strong>Disclaimer:</strong> {disclaimer}
          </p>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="summary-actions-toolbar no-print">
        <div className="utility-buttons">
          <button type="button" className="btn-outline" onClick={handleCopy}>
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Summary'}
          </button>
          <button type="button" className="btn-outline" onClick={handleDownload}>
            💾 Download .TXT
          </button>
          <button type="button" className="btn-ghost" onClick={handlePrint}>
            🖨️ Print
          </button>
        </div>

        <button type="button" className="btn-coral start-over-btn" onClick={onStartOver}>
          ✨ Start a New Decision
        </button>
      </div>

      <style>{`
        .summary-stage-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
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
        .receipt-card {
          max-width: 720px;
          margin: 0 auto;
          width: 100%;
          border: 3px solid var(--ink);
          background: #ffffff;
        }
        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .receipt-brand {
          font-size: 1.35rem;
          letter-spacing: -0.02em;
        }
        .receipt-date {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--ink-muted);
        }
        .receipt-divider {
          border-top: 2px dashed var(--ink);
          margin: 16px 0;
        }
        .receipt-section {
          margin-bottom: 20px;
        }
        .receipt-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .checked-label { color: #0d5e3f; }
        .unknown-label { color: #8c4c00; }
        .next-label { color: #0d4b75; }

        .receipt-decision {
          font-size: 1.35rem;
          color: var(--ink);
        }
        .receipt-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .receipt-item {
          font-size: 0.975rem;
          font-weight: 600;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .check-icon {
          color: var(--green);
          font-weight: 800;
        }
        .unknown-icon {
          color: #B45309;
          font-weight: 800;
        }
        .next-icon {
          color: var(--sky);
          font-weight: 800;
        }
        .empty-item {
          color: var(--ink-muted);
          font-style: italic;
        }
        .receipt-disclaimer {
          background: var(--bg-paper);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--ink);
        }
        .disclaimer-text {
          font-size: 0.875rem;
          color: var(--ink);
          margin: 0;
        }
        .summary-actions-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          max-width: 720px;
          margin: 0 auto;
          width: 100%;
        }
        .utility-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .start-over-btn {
          font-size: 1.05rem;
        }
      `}</style>
    </section>
  );
}
