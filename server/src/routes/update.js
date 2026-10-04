import express from 'express';
import { UpdateRequestSchema, validateRequest } from '../services/validation.js';
import { updateAnalysis } from '../services/gemini.js';
import { verifyBlindSpotQuotes, buildUserCorpus } from '../services/quoteVerifier.js';

const router = express.Router();

/**
 * POST /api/update
 * Updates reasoning analysis based on user's answer to the top follow-up question.
 */
router.post('/', async (req, res, next) => {
  try {
    const validation = validateRequest(UpdateRequestSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { originalText, answers, previousAnalysis, question, answer } = validation.data;

    // Call Gemini API with updated context
    const aiResult = await updateAnalysis({
      originalText,
      answers,
      previousAnalysis,
      question,
      answer,
    });

    // Build the complete corpus of all user words to verify quotes
    const userCorpus = buildUserCorpus(originalText, answers, answer);
    const verifiedBlindSpots = verifyBlindSpotQuotes(aiResult.blind_spots, userCorpus);

    const responsePayload = {
      needs_more_input: Boolean(aiResult.needs_more_input),
      decision: aiResult.decision || null,
      stated_reason: aiResult.stated_reason || null,
      assumption: aiResult.assumption || null,
      focused_on: Array.isArray(aiResult.focused_on) ? aiResult.focused_on : [],
      not_mentioned: Array.isArray(aiResult.not_mentioned) ? aiResult.not_mentioned : [],
      blind_spots: verifiedBlindSpots.slice(0, 3),
      top_question: aiResult.top_question || null,
      status_change_notes: Array.isArray(aiResult.status_change_notes)
        ? aiResult.status_change_notes
        : [],
    };

    return res.status(200).json(responsePayload);
  } catch (err) {
    return next(err);
  }
});

export default router;
