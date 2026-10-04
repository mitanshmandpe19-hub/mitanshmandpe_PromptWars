import React from 'react';

/**
 * Accessible evidence badge utilizing Shape + Text + Color.
 *
 * @param {Object} props
 * @param {'direct'|'indirect'|'none'} props.status
 */
export function EvidenceBadge({ status = 'none' }) {
  const configs = {
    direct: {
      shape: '●',
      iconSvg: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <circle cx="6" cy="6" r="5" />
        </svg>
      ),
      text: 'Direct evidence',
      className: 'badge-direct',
    },
    indirect: {
      shape: '▲',
      iconSvg: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <polygon points="6,1 11,11 1,11" />
        </svg>
      ),
      text: 'Indirect evidence',
      className: 'badge-indirect',
    },
    none: {
      shape: '■',
      iconSvg: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <rect x="2" y="2" width="8" height="8" rx="1" />
        </svg>
      ),
      text: 'No evidence found',
      className: 'badge-none',
    },
  };

  const current = configs[status] || configs.none;

  return (
    <span className={`evidence-badge ${current.className}`} title={current.text}>
      <span className="badge-shape" aria-hidden="true">
        {current.iconSvg}
      </span>
      <span className="badge-text">{current.text}</span>

      <style>{`
        .evidence-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--ink);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          box-shadow: 1.5px 1.5px 0 var(--ink);
        }
        .badge-shape {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-direct {
          background: var(--green-light);
          color: #0d5e3f;
          border-color: #0d5e3f;
        }
        .badge-indirect {
          background: var(--yellow-light);
          color: #8c4c00;
          border-color: #8c4c00;
        }
        .badge-none {
          background: var(--red-light);
          color: #9e1a24;
          border-color: #9e1a24;
        }
      `}</style>
    </span>
  );
}
