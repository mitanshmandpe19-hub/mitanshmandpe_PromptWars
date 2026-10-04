import React from 'react';

/**
 * Progress tracker showing resolved, partial, and open counts and segmented visual bar.
 *
 * @param {Object} props
 * @param {Array<Object>} props.blindSpots
 */
export function ProgressTracker({ blindSpots = [] }) {
  const total = blindSpots.length || 1;
  const resolved = blindSpots.filter((b) => b.status === 'resolved').length;
  const partial = blindSpots.filter((b) => b.status === 'partial').length;
  const open = blindSpots.filter((b) => b.status === 'open' || !b.status).length;

  const resolvedPct = (resolved / total) * 100;
  const partialPct = (partial / total) * 100;
  const openPct = (open / total) * 100;

  return (
    <div className="progress-tracker-card" aria-label="Reasoning examination progress">
      <div className="tracker-header">
        <span className="tracker-title">Thinking Board Progress</span>
        <div className="tracker-metrics">
          <span className="metric-pill metric-resolved">
            <strong>{resolved}</strong> resolved
          </span>
          <span className="metric-pill metric-partial">
            <strong>{partial}</strong> partial
          </span>
          <span className="metric-pill metric-open">
            <strong>{open}</strong> open
          </span>
        </div>
      </div>

      {/* Segmented bar */}
      <div
        className="progress-bar-track"
        role="progressbar"
        aria-valuenow={resolved}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="segment segment-resolved"
          style={{ width: `${resolvedPct}%` }}
          title={`${resolved} resolved`}
        />
        <div
          className="segment segment-partial"
          style={{ width: `${partialPct}%` }}
          title={`${partial} partial`}
        />
        <div
          className="segment segment-open"
          style={{ width: `${openPct}%` }}
          title={`${open} open`}
        />
      </div>

      <style>{`
        .progress-tracker-card {
          background: #fff;
          border: var(--border-ink);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }
        .tracker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 12px;
        }
        .tracker-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--ink);
        }
        .tracker-metrics {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .metric-pill {
          font-size: 0.8rem;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--ink);
          font-weight: 500;
        }
        .metric-resolved {
          background: var(--green-light);
          color: #0d5e3f;
        }
        .metric-partial {
          background: var(--yellow-light);
          color: #8c4c00;
        }
        .metric-open {
          background: var(--coral-light);
          color: #9e1a24;
        }
        .progress-bar-track {
          width: 100%;
          height: 12px;
          background: #EAEBF0;
          border: 2px solid var(--ink);
          border-radius: var(--radius-full);
          display: flex;
          overflow: hidden;
        }
        .segment {
          height: 100%;
          transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .segment-resolved {
          background: var(--green);
        }
        .segment-partial {
          background: var(--yellow);
        }
        .segment-open {
          background: var(--coral);
        }
      `}</style>
    </div>
  );
}
