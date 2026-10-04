import React from 'react';
import { STAGES } from '../hooks/useDecisionSession.js';

export function Header({ currentStage, onReset }) {
  const stageLabels = [
    { key: STAGES.WRITE, label: '1. Write' },
    { key: STAGES.UNDERSTOOD, label: '2. Understood' },
    { key: STAGES.EXAMINE, label: '3. Examine' },
    { key: STAGES.SUMMARY, label: '4. Summary' },
  ];

  return (
    <header className="site-header no-print">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="container header-inner">
        <div
          className="brand-group"
          onClick={onReset}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onReset()}
        >
          <div className="mascot-badge" aria-hidden="true">
            {/* Friendly Hand-drawn Lightbulb / Magnifier Mascot */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="14" r="9" fill="#FFC93C" stroke="#1B2340" strokeWidth="2.5" />
              <path d="M12 23H18" stroke="#1B2340" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M13.5 26H16.5" stroke="#1B2340" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="1.5" fill="#1B2340" />
              <circle cx="18" cy="12" r="1.5" fill="#1B2340" />
              <path
                d="M13 16C14 17 16 17 17 16"
                stroke="#1B2340"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="21.5"
                y1="20.5"
                x2="28"
                y2="27"
                stroke="#1B2340"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">BLIND SPOT</h1>
            <p className="brand-tagline">The Thinking Companion</p>
          </div>
        </div>

        {/* Step Navigation Indicator */}
        <nav aria-label="Exploration Stages" className="stage-nav">
          <ol className="stage-list">
            {stageLabels.map((item, idx) => {
              const isCurrent = currentStage === item.key;
              const isPast = stageLabels.findIndex((s) => s.key === currentStage) > idx;

              return (
                <li
                  key={item.key}
                  className={`stage-pill ${isCurrent ? 'active' : ''} ${isPast ? 'completed' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="stage-text">{item.label}</span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <style>{`
        .site-header {
          padding: 18px 0;
          border-bottom: var(--border-ink);
          background: var(--bg-paper);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .brand-title {
          font-size: 1.5rem;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .brand-tagline {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--ink-muted);
          margin: 0;
        }
        .mascot-badge {
          background: #fff;
          border: var(--border-ink);
          border-radius: var(--radius-sm);
          padding: 4px;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stage-nav {
          overflow-x: auto;
        }
        .stage-list {
          display: flex;
          gap: 8px;
          list-style: none;
        }
        .stage-pill {
          padding: 6px 12px;
          font-size: 0.825rem;
          font-weight: 700;
          border: 2px solid var(--ink);
          border-radius: var(--radius-full);
          background: #fff;
          color: var(--ink-muted);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .stage-pill.active {
          background: var(--yellow);
          color: var(--ink);
          box-shadow: 2px 2px 0 var(--ink);
        }
        .stage-pill.completed {
          background: var(--teal-light);
          color: var(--ink);
          border-color: var(--ink);
        }
        @media (max-width: 640px) {
          .stage-nav {
            width: 100%;
          }
          .stage-list {
            justify-content: space-between;
          }
        }
      `}</style>
    </header>
  );
}
