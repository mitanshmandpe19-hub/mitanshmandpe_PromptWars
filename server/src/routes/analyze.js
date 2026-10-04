import express from 'express';
import { AnalyzeRequestSchema, validateRequest } from '../services/validation.js';
import { analyzeDecision } from '../services/gemini.js';
import { verifyBlindSpotQuotes } from '../services/quoteVerifier.js';
import { analyzeCache } from '../services/analyzeCache.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyzes the user's initial decision text for hidden blind spots and missing factors.
 * Results for identical input are cached in-memory using a secure SHA-256 hash.
 */
router.post('/', async (req, res, next) => {
  try {
    const validation = validateRequest(AnalyzeRequestSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { text } = validation.data;

    // Check in-memory cache
    const cachedResponse = analyzeCache.get(text);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    // Call Gemini API
    const aiResult = await analyzeDecision(text);

    // Verify evidence quotes against user text using backend deterministic verifier
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

    // Store in cache
    analyzeCache.set(text, responsePayload);

    return res.status(200).json(responsePayload);
  } catch (err) {
    return next(err);
  }
});

export default router;
