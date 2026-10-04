import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeText, updateSession, getSummary } from '../api/client.js';
import { STAGES } from '../constants/index.js';

export { STAGES };

const LOADING_MESSAGES = [
  "Looking for what's hiding...",
  'Spotting overlooked assumptions...',
  'Checking for hidden risks and missing factors...',
  'Verifying quotes against your exact words...',
  'Preparing a thoughtful follow-up question...',
];

/**
 * Custom hook coordinating multi-stage critical thinking exploration.
 * Features built-in AbortController cancellation for stale/duplicate requests.
 *
 * @returns {Object} Session state and action handlers
 */
export function useDecisionSession() {
  const [stage, setStage] = useState(STAGES.WRITE);
  const [originalText, setOriginalText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [statusChangeNotes, setStatusChangeNotes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeHighlightQuote, setActiveHighlightQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState(null);
  const [needsMoreInput, setNeedsMoreInput] = useState(false);
  const [needsMoreInputMessage, setNeedsMoreInputMessage] = useState('');
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const abortControllerRef = useRef(null);

  // Clean up any ongoing request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper to rotate loading messages
  const startLoading = useCallback(() => {
    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    let msgIndex = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[msgIndex]);
    }, 2500);

    return {
      signal: controller.signal,
      stop: () => clearInterval(interval),
    };
  }, []);

  /**
   * Stage 1: Analyze user initial dilemma text
   */
  const handleAnalyze = useCallback(
    async (text) => {
      const { signal, stop } = startLoading();
      try {
        const result = await analyzeText(text, signal);
        setOriginalText(text);
        setAnalysis(result);

        if (result.needs_more_input) {
          setNeedsMoreInput(true);
          setNeedsMoreInputMessage(
            result.top_question ||
              'Could you tell us a bit more about the choice you are considering and why?',
          );
          setStage(STAGES.WRITE);
        } else {
          setNeedsMoreInput(false);
          setNeedsMoreInputMessage('');
          setStage(STAGES.UNDERSTOOD);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Could not analyze your decision. Please try again.');
      } finally {
        stop();
        setIsLoading(false);
      }
    },
    [startLoading],
  );

  /**
   * Transition from UNDERSTOOD to EXAMINE stage
   */
  const proceedToExamine = useCallback(() => {
    setStage(STAGES.EXAMINE);
  }, []);

  /**
   * Stage 3: Answer active question and update analysis
   */
  const handleAnswerQuestion = useCallback(
    async (answerText) => {
      if (!analysis?.top_question) return;

      const currentQuestion = analysis.top_question;
      const { signal, stop } = startLoading();

      try {
        const updatedResult = await updateSession(
          {
            originalText,
            answers,
            previousAnalysis: analysis,
            question: currentQuestion,
            answer: answerText,
          },
          signal,
        );

        // Record round in local history
        const newAnswers = [...answers, { question: currentQuestion, answer: answerText }];
        setAnswers(newAnswers);
        setAnalysis(updatedResult);
        setStatusChangeNotes(updatedResult.status_change_notes || []);

        // Check if all blind spots are resolved or no question remains
        const allResolved =
          updatedResult.blind_spots &&
          updatedResult.blind_spots.length > 0 &&
          updatedResult.blind_spots.every((bs) => bs.status === 'resolved');

        if (allResolved || !updatedResult.top_question) {
          setConfettiTrigger(true);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Could not update your analysis. Please try again.');
      } finally {
        stop();
        setIsLoading(false);
      }
    },
    [analysis, originalText, answers, startLoading],
  );

  /**
   * Stage 3 -> 4: Finish exploration and get final summary
   */
  const handleFinish = useCallback(async () => {
    const { signal, stop } = startLoading();
    try {
      const summaryResult = await getSummary(
        {
          originalText,
          answers,
          analysis,
        },
        signal,
      );

      setSummary(summaryResult);
      setConfettiTrigger(true);
      setStage(STAGES.SUMMARY);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Could not generate summary. Please try again.');
    } finally {
      stop();
      setIsLoading(false);
    }
  }, [originalText, answers, analysis, startLoading]);

  /**
   * Reset the whole session to start a new decision
   */
  const resetSession = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStage(STAGES.WRITE);
    setOriginalText('');
    setAnalysis(null);
    setAnswers([]);
    setStatusChangeNotes([]);
    setSummary(null);
    setActiveHighlightQuote(null);
    setError(null);
    setNeedsMoreInput(false);
    setNeedsMoreInputMessage('');
    setConfettiTrigger(false);
  }, []);

  return {
    stage,
    setStage,
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
    setError,
    needsMoreInput,
    needsMoreInputMessage,
    confettiTrigger,
    setConfettiTrigger,
    handleAnalyze,
    proceedToExamine,
    handleAnswerQuestion,
    handleFinish,
    resetSession,
  };
}
