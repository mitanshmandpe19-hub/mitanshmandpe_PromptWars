import React, { lazy, Suspense } from 'react';
import { useDecisionSession, STAGES } from './hooks/useDecisionSession.js';
import { Header } from './components/Header.jsx';
import { InputStage } from './components/InputStage.jsx';

// Code-split stages and heavy animation components
const UnderstoodStage = lazy(() => import('./components/UnderstoodStage.jsx'));
const ExamineStage = lazy(() => import('./components/ExamineStage.jsx'));
const SummaryStage = lazy(() => import('./components/SummaryStage.jsx'));
const Confetti = lazy(() => import('./components/Confetti.jsx'));

/**
 * Minimal accessible stage loading fallback.
 */
function StageFallback() {
  return (
    <div className="stage-suspense-fallback" aria-live="polite" aria-busy="true">
      <div className="fallback-card sticky-note sticky-yellow">
        <span className="mascot-loading" aria-hidden="true">
          ✏️
        </span>
        <p className="fallback-text">Setting up the thinking board...</p>
      </div>
      <style>{`
        .stage-suspense-fallback {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
        }
        .fallback-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 28px;
        }
        .fallback-text {
          font-weight: 700;
          font-size: 1.1rem;
          margin: 0;
          color: var(--ink);
        }
      `}</style>
    </div>
  );
}

/**
 * Main Application Component for Blind Spot.
 */
export function App() {
  const {
    stage,
    originalText,
    analysis,
    answers,
    statusChangeNotes,
    summary,
    activeHighlightQuote,
    setActiveHighlightQuote,
    isLoading,
    loadingMessage,
    error,
    needsMoreInput,
    needsMoreInputMessage,
    confettiTrigger,
    setConfettiTrigger,
    handleAnalyze,
    proceedToExamine,
    handleAnswerQuestion,
    handleFinish,
    resetSession,
  } = useDecisionSession();

  return (
    <div className="app-shell">
      {/* Top Header */}
      <Header currentStage={stage} onReset={resetSession} />

      {/* Celebratory Confetti (Lazy Loaded) */}
      <Suspense fallback={null}>
        <Confetti trigger={confettiTrigger} onComplete={() => setConfettiTrigger(false)} />
      </Suspense>

      {/* Screen Reader Live Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading && loadingMessage}
        {error && `Error: ${error}`}
        {stage === STAGES.WRITE && 'Write stage active.'}
        {stage === STAGES.UNDERSTOOD && 'Understood stage active.'}
        {stage === STAGES.EXAMINE && 'Examine blind spots stage active.'}
        {stage === STAGES.SUMMARY && 'Summary receipt stage active.'}
      </div>

      {/* Main Content Area */}
      <main id="main-content" className="container main-content-wrapper">
        <Suspense fallback={<StageFallback />}>
          {stage === STAGES.WRITE && (
            <InputStage
              onSubmit={handleAnalyze}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
              needsMoreInput={needsMoreInput}
              needsMoreInputMessage={needsMoreInputMessage}
            />
          )}

          {stage === STAGES.UNDERSTOOD && (
            <UnderstoodStage
              originalText={originalText}
              analysis={analysis}
              activeHighlightQuote={activeHighlightQuote}
              onHoverQuote={setActiveHighlightQuote}
              onLeaveQuote={() => setActiveHighlightQuote(null)}
              onProceed={proceedToExamine}
              onStartOver={resetSession}
            />
          )}

          {stage === STAGES.EXAMINE && (
            <ExamineStage
              analysis={analysis}
              answers={answers}
              statusChangeNotes={statusChangeNotes}
              activeHighlightQuote={activeHighlightQuote}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
              onAnswer={handleAnswerQuestion}
              onSkip={() => handleAnswerQuestion('I am skipping this question for now.')}
              onFinish={handleFinish}
              onHoverQuote={setActiveHighlightQuote}
              onLeaveQuote={() => setActiveHighlightQuote(null)}
            />
          )}

          {stage === STAGES.SUMMARY && (
            <SummaryStage
              summary={summary}
              originalText={originalText}
              answers={answers}
              onStartOver={resetSession}
            />
          )}
        </Suspense>
      </main>

      {/* Site Footer */}
      <footer className="site-footer no-print">
        <div className="container footer-inner">
          <p className="footer-note">
            <strong>BLIND SPOT</strong> — An evidence-aware critical thinking companion. We never
            make the decision for you.
          </p>
          <p className="footer-privacy">
            🔒 Do not enter sensitive personal information in this demo.
          </p>
        </div>
      </footer>

      <style>{`
        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content-wrapper {
          flex: 1;
          padding-top: 40px;
          padding-bottom: 60px;
        }
        .site-footer {
          border-top: var(--border-ink);
          background: var(--bg-paper);
          padding: 20px 0;
          margin-top: auto;
          text-align: center;
        }
        .footer-note {
          font-size: 0.85rem;
          color: var(--ink-muted);
          margin-bottom: 4px;
        }
        .footer-privacy {
          font-size: 0.8rem;
          color: var(--ink-muted);
          font-style: italic;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}

export default App;
