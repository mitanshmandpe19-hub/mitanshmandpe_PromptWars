import React, { useState } from 'react';

/**
 * Collapsible timeline showing previous rounds of questions and answers.
 *
 * @param {Object} props
 * @param {Array<{question: string, answer: string}>} props.answers
 */
export function Timeline({ answers = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!answers || answers.length === 0) return null;

  return (
    <section className="timeline-container" aria-label="Previous thinking rounds">
      <button
        type="button"
        className="timeline-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="timeline-toggle-title">
          📖 Your thinking so far ({answers.length} {answers.length === 1 ? 'round' : 'rounds'} explored)
        </span>
        <span className="timeline-toggle-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="timeline-content">
          <ol className="timeline-rounds-list">
            {answers.map((qa, index) => (
              <li key={index} className="timeline-round-item">
                <div className="round-marker">{index + 1}</div>
                <div className="round-details">
                  <p className="round-question">
                    <strong>Q:</strong> {qa.question}
                  </p>
                  <p className="round-answer">
                    <strong>A:</strong> {qa.answer}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <style>{`
        .timeline-container {
          margin-top: 24px;
          border: 2px solid var(--ink);
          border-radius: var(--radius-md);
          background: #fff;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .timeline-toggle-btn {
          width: 100%;
          background: var(--bg-paper-alt);
          border: none;
          border-radius: 0;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--ink);
          box-shadow: none;
          min-height: 48px;
        }
        .timeline-toggle-btn:hover {
          transform: none;
          background: var(--yellow-light);
        }
        .timeline-content {
          padding: 18px 20px;
          border-top: 1.5px solid var(--ink);
        }
        .timeline-rounds-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .timeline-round-item {
          display: flex;
          gap: 14px;
          position: relative;
        }
        .round-marker {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--teal);
          color: #fff;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--ink);
          flex-shrink: 0;
        }
        .round-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.925rem;
        }
        .round-question {
          color: var(--ink);
          font-weight: 600;
        }
        .round-answer {
          color: var(--ink-muted);
          background: var(--bg-paper);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--teal);
        }
      `}</style>
    </section>
  );
}
