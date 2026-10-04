import React, { useEffect, useRef } from 'react';
import { BlindSpotCard } from './BlindSpotCard.jsx';
import { ProgressTracker } from './ProgressTracker.jsx';
import { QuestionCard } from './QuestionCard.jsx';
import { Timeline } from './Timeline.jsx';

export function ExamineStage({
  analysis,
  answers,
  statusChangeNotes,
  activeHighlightQuote,
  isLoading,
  loadingMessage,
  error,
  onAnswer,
  onSkip,
  onFinish,
  onHoverQuote,
  onLeaveQuote,
}) {
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  if (!analysis) return null;

  const blindSpots = analysis.blind_spots || [];
  const topQuestion = analysis.top_question;

  return (
    <section className="examine-stage-section" aria-labelledby="examine-stage-title">
      <div className="stage-header">
        <h2 id="examine-stage-title" ref={headingRef} tabIndex={-1} className="stage-title">
          Let&apos;s poke at these blind spots together
        </h2>
        <p className="stage-subtitle">
          We found {blindSpots.length} potential blind {blindSpots.length === 1 ? 'spot' : 'spots'}.
          Answer the questions below to stress-test your thinking.
        </p>
      </div>

      {/* Progress Tracker Bar */}
      <ProgressTracker blindSpots={blindSpots} />

      {/* Blind Spot Cards Grid */}
      <div className="blind-spots-grid">
        {blindSpots.map((spot, index) => {
          const changeNote = (statusChangeNotes || []).find(
            (n) => n.id === spot.id
          );
          const isHighlighted =
            activeHighlightQuote &&
            spot.evidence_quote &&
            spot.evidence_quote.toLowerCase().includes(activeHighlightQuote.toLowerCase());

          return (
            <BlindSpotCard
              key={spot.id || index}
              spot={spot}
              index={index}
              isHighlighted={Boolean(isHighlighted)}
              statusChangeNote={changeNote}
              onHoverQuote={onHoverQuote}
              onLeaveQuote={onLeaveQuote}
            />
          );
        })}
      </div>

      {/* Active Question Spotlight or All Resolved Banner */}
      {topQuestion ? (
        <QuestionCard
          question={topQuestion}
          isLoading={isLoading}
          onAnswer={onAnswer}
          onSkip={onSkip}
          onFinish={onFinish}
        />
      ) : (
        <div className="all-cleared-banner sticky-note sticky-teal">
          <h3>🎉 Nice, the main blind spots have been explored!</h3>
          <p>
            You have answered the critical follow-up questions. Ready to view your final thinking summary?
          </p>
          <div className="cleared-actions">
            <button
              type="button"
              className="btn-teal summary-btn"
              onClick={onFinish}
              disabled={isLoading}
            >
              Generate Final Summary 🏁
            </button>
          </div>
        </div>
      )}

      {/* Error notification if update fails */}
      {error && (
        <div className="alert-box alert-error" role="alert" style={{ marginTop: '16px' }}>
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>Update Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading Banner */}
      {isLoading && (
        <div className="loading-status-banner" aria-live="polite">
          <span className="mascot-loading">✏️</span>
          <span className="loading-msg">{loadingMessage}</span>
        </div>
      )}

      {/* Collapsible Timeline of Previous Q&As */}
      <Timeline answers={answers} />

      <style>{`
        .examine-stage-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .stage-header {
          text-align: center;
          margin-bottom: 4px;
        }
        .stage-title {
          margin-bottom: 6px;
        }
        .stage-subtitle {
          font-size: 1.1rem;
          color: var(--ink-muted);
        }
        .blind-spots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 20px;
          margin-bottom: 8px;
        }
        .all-cleared-banner {
          margin-top: 24px;
          text-align: center;
          padding: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .cleared-actions {
          margin-top: 8px;
        }
        .summary-btn {
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
