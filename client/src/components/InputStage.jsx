import React, { useState, useEffect, useRef } from 'react';
import { DemoChips } from './DemoChips.jsx';

/**
 * Stage 1: Input stage for writing or selecting a decision dilemma.
 */
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
          Share your dilemma, choice, or reasoning. We will spot the unexamined assumptions and
          risks
          <strong> without telling you what to decide</strong>.
        </p>
      </div>

      {/* Modular Demo Example Chips */}
      <DemoChips onSelect={handleDemoClick} disabled={isLoading} />

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
              <p>
                {needsMoreInputMessage ||
                  'Please add a few more words about your decision and reason.'}
              </p>
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

        {/* Submit Button */}
        <div className="submit-row">
          <button type="submit" className="btn-coral submit-btn" disabled={!isValid || isLoading}>
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
    </section>
  );
}
