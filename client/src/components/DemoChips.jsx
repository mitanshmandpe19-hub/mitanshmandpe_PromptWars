import React, { memo } from 'react';

const DEMO_CHIPS = [
  {
    icon: '🎓',
    label: 'Quit internship',
    text: "I am thinking of quitting my internship because I don't have enough time to study for finals.",
    bg: 'var(--coral-light)',
    accent: 'var(--coral)',
  },
  {
    icon: '🏛️',
    label: 'Choose a college',
    text: 'I want to choose College A over College B purely because it has a higher national ranking.',
    bg: 'var(--yellow-light)',
    accent: 'var(--yellow)',
  },
  {
    icon: '💻',
    label: 'Buy a laptop',
    text: 'I am planning to buy the most expensive laptop because better specs always mean faster daily work.',
    bg: 'var(--sky-light)',
    accent: 'var(--sky)',
  },
];

/**
 * Demo suggestion chips row component with accessible keyboard navigation.
 */
export const DemoChips = memo(function DemoChips({ onSelect, disabled = false }) {
  return (
    <div className="demo-chips-container" role="region" aria-label="Example decision templates">
      <span className="demo-chips-label">Try a quick example:</span>
      <div className="demo-chips-list">
        {DEMO_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className="demo-chip-btn"
            style={{
              '--chip-bg': chip.bg,
              '--chip-accent': chip.accent,
            }}
            onClick={() => onSelect(chip.text)}
            disabled={disabled}
            aria-label={`Try example: ${chip.label}`}
          >
            <span className="demo-chip-icon" aria-hidden="true">
              {chip.icon}
            </span>
            <span className="demo-chip-text">{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
