import React, { useState, useEffect, useRef } from 'react';

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

export function InputStage({
  onSubmit,
  isLoading = false,
  loadingMessage = '',
  error = null,
  needsMoreInput = false,
  needsMoreInputMessage = '',
}) {
  const [inputText, setInputText] = useState('');
  const [isTypingDemo, setIsTypingDemo] = useState(false);
  const typewriterTimeoutRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    // Move focus to heading for accessibility
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  const handleDemoClick = (text) => {
    if (isLoading) return;

    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setInputText(text);
      return;
    }

    setIsTypingDemo(true);
    setInputText('');
    let idx = 0;

    const typeNext = () => {
      if (idx < text.length) {
        setInputText(text.slice(0, idx + 1));
        idx++;
        typewriterTimeoutRef.current = setTimeout(typeNext, 18);
      } else {
        setIsTypingDemo(false);
      }
    };

    typeNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim().length < 10 || isLoading) return;
    onSubmit(inputText.trim());
  };

  const charCount = inputText.length;
  const isTooShort = charCount > 0 && charCount < 10;
  const isTooLong = charCount > 1500;
  const isValid = charCount >= 10 && charCount <= 1500;

  return (
    <section className="input-stage-section" aria-labelledby="write-stage-title">
      <div className="hero-banner">
        <h2 id="write-stage-title" ref={headingRef} tabIndex={-1} className="hero-heading">
          What decision are you weighing?
        </h2>
        <p className="hero-subheading">
          Share your dilemma, choice, or reasoning. We will spot the unexamined assumptions and risks
          <strong> without telling you what to decide</strong>.
        </p>
      </div>

      {/* Demo Example Chips */}
      <div className="demo-chips-section">
        <span className="demo-chips-label">Try a sample decision:</span>
        <div className="demo-chips-group">
          {DEMO_CHIPS.map((chip, i) => (
            <button
              key={i}
              type="button"
              className="demo-chip-btn"
              style={{ backgroundColor: chip.bg, borderColor: 'var(--ink)' }}
              onClick={() => handleDemoClick(chip.text)}
              disabled={isLoading}
              title={`Load: ${chip.text}`}
            >
              <span className="chip-icon" aria-hidden="true">{chip.icon}</span>
              <span className="chip-label">{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sticky Note Form */}
      <form onSubmit={handleSubmit} className="sticky-note sticky-yellow input-sticky-card">
        <label htmlFor="decision-text" className="textarea-label">
          Your reasoning or dilemma:
        </label>

        <textarea
          id="decision-text"
          className="decision-textarea"
          rows={5}
          maxLength={1500}
          value={inputText}
          onChange={(e) => {
            if (isTypingDemo && typewriterTimeoutRef.current) {
              clearTimeout(typewriterTimeoutRef.current);
              setIsTypingDemo(false);
            }
            setInputText(e.target.value);
          }}
          placeholder="e.g. I am thinking of quitting my internship because I don't have enough time to study for finals..."
          disabled={isLoading}
          required
        />

        {/* Character Count & Validation Hints */}
        <div className="textarea-footer">
          <div className="validation-hints">
            {isTooShort && (
              <span className="hint-text hint-error">Needs at least 10 characters</span>
            )}
            {isTooLong && (
              <span className="hint-text hint-error">Cannot exceed 1500 characters</span>
            )}
          </div>
          <span className="char-counter" aria-live="polite">
            {charCount} / 1500
          </span>
        </div>

        {/* Needs More Input Notice */}
        {needsMoreInput && (
          <div className="alert-box alert-warning" role="alert">
            <span className="alert-icon">💡</span>
            <div>
              <strong>Let&apos;s get a bit more detail:</strong>
              <p>{needsMoreInputMessage || 'Please add a few more words about your decision and reason.'}</p>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="alert-box alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Oops!</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button / Loading Indicator */}
        <div className="submit-row">
          <button
            type="submit"
            className="btn-coral submit-btn"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner-content">
                <span className="spinner-icon">🔄</span> Analyzing...
              </span>
            ) : (
              'Poke at this reasoning 🔍'
            )}
          </button>
        </div>

        {/* Playful Loading Status Banner */}
        {isLoading && (
          <div className="loading-status-banner" aria-live="polite">
            <span className="mascot-loading">✏️</span>
            <span className="loading-msg">{loadingMessage}</span>
          </div>
        )}
      </form>

      <style>{`
        .input-stage-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .hero-banner {
          text-align: center;
          margin-bottom: 8px;
        }
        .hero-heading {
          margin-bottom: 8px;
        }
        .hero-subheading {
          font-size: 1.15rem;
          color: var(--ink-muted);
          max-width: 680px;
          margin: 0 auto;
        }
        .demo-chips-section {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .demo-chips-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--ink-muted);
        }
        .demo-chips-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .demo-chip-btn {
          font-size: 0.85rem;
          font-weight: 700;
          padding: 6px 14px;
          min-height: 38px;
          box-shadow: 2px 2px 0 var(--ink);
          border-radius: var(--radius-full);
        }
        .demo-chip-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 3px 3px 0 var(--ink);
        }
        .input-sticky-card {
          box-shadow: var(--shadow-lg);
          padding: 28px;
        }
        .textarea-label {
          display: block;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 8px;
          color: var(--ink);
        }
        .decision-textarea {
          width: 100%;
          border: 2px solid var(--ink);
          border-radius: var(--radius-sm);
          padding: 16px;
          font-family: inherit;
          font-size: 1.1rem;
          line-height: 1.5;
          background: #fff;
          resize: vertical;
          min-height: 140px;
        }
        .textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .char-counter {
          color: var(--ink-muted);
        }
        .hint-error {
          color: var(--red);
        }
        .alert-box {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--ink);
          margin-top: 14px;
          font-size: 0.95rem;
        }
        .alert-warning {
          background: var(--yellow-light);
        }
        .alert-error {
          background: var(--red-light);
        }
        .submit-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }
        .submit-btn {
          font-size: 1.1rem;
          padding: 12px 28px;
        }
        .loading-status-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #fff;
          border: 2px dashed var(--ink);
          border-radius: var(--radius-sm);
          padding: 12px;
          margin-top: 16px;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--ink);
        }
      `}</style>
    </section>
  );
}
