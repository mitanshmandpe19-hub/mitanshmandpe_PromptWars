import express from 'express';
import { AnalyzeRequestSchema, validateRequest } from '../services/validation.js';
import { analyzeDecision } from '../services/gemini.js';
import { verifyBlindSpotQuotes } from '../services/quoteVerifier.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyzes the user's initial decision text for hidden blind spots and missing factors.
 */
router.post('/', async (req, res, next) => {
  try {
    const validation = validateRequest(AnalyzeRequestSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { text } = validation.data;

    // Call Gemini API (with single retry on invalid output)
    const aiResult = await analyzeDecision(text);

    // Verify evidence quotes against user text using backend verifier
    const verifiedBlindSpots = verifyBlindSpotQuotes(aiResult.blind_spots, text);

    const responsePayload = {
      needs_more_input: Boolean(aiResult.needs_more_input),
      decision: aiResult.decision || null,
      stated_reason: aiResult.stated_reason || null,
      assumption: aiResult.assumption || null,
      focused_on: Array.isArray(aiResult.focused_on) ? aiResult.focused_on : [],
      not_mentioned: Array.isArray(aiResult.not_mentioned) ? aiResult.not_mentioned : [],
      blind_spots: verifiedBlindSpots.slice(0, 3),
      top_question: aiResult.top_question || null,
    };

    return res.status(200).json(responsePayload);
  } catch (err) {
    return next(err);
  }
});

export default router;
