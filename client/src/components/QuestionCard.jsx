import React, { useState } from 'react';

/**
 * Spotlight question card where user reflects and provides answers to follow-up questions.
 *
 * @param {Object} props
 * @param {string} props.question
 * @param {boolean} props.isLoading
 * @param {Function} props.onAnswer
 * @param {Function} props.onSkip
 * @param {Function} props.onFinish
 */
export function QuestionCard({
  question,
  isLoading = false,
  onAnswer,
  onSkip,
  onFinish,
}) {
  const [answerInput, setAnswerInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerInput.trim() || isLoading) return;
    onAnswer(answerInput.trim());
    setAnswerInput('');
  };

  return (
    <section className="sticky-note sticky-white spotlight-card" aria-labelledby="spotlight-question-title">
      <div className="spotlight-badge-row">
        <span className="spotlight-badge">💡 Active Consideration</span>
      </div>

      <h3 id="spotlight-question-title" className="spotlight-question-text">
        {question}
      </h3>

      <form onSubmit={handleSubmit} className="answer-form">
        <label htmlFor="answer-input" className="answer-label">
          Your thoughts, adjustments, or clarifications:
        </label>
        <textarea
          id="answer-input"
          className="answer-textarea"
          rows={3}
          maxLength={1500}
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          placeholder="For example: I hadn't thought about that, but I could check if..."
          disabled={isLoading}
          required
        />

        <div className="form-action-row">
          <button
            type="submit"
            className="btn-coral submit-answer-btn"
            disabled={!answerInput.trim() || isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Reasoning ↵'}
          </button>

          <div className="auxiliary-buttons">
            <button
              type="button"
              className="btn-ghost"
              onClick={onSkip}
              disabled={isLoading}
            >
              Skip this question
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={onFinish}
              disabled={isLoading}
            >
              Finish & Summary 🏁
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .spotlight-card {
          margin-top: 24px;
          border: 3px solid var(--ink);
          box-shadow: var(--shadow-lg);
          background: #ffffff;
        }
        .spotlight-badge-row {
          margin-bottom: 8px;
        }
        .spotlight-badge {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          background: var(--yellow);
          color: var(--ink);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--ink);
        }
        .spotlight-question-text {
          font-size: clamp(1.2rem, 3vw, 1.45rem);
          line-height: 1.35;
          margin-bottom: 16px;
          color: var(--ink);
        }
        .answer-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .answer-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--ink-muted);
        }
        .answer-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid var(--ink);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          background: #FAFAFC;
        }
        .answer-textarea:focus {
          background: #fff;
        }
        .form-action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 6px;
        }
        .auxiliary-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
      `}</style>
    </section>
  );
}
