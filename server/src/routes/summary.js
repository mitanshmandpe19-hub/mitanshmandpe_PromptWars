import express from 'express';
import { SummaryRequestSchema, validateRequest } from '../services/validation.js';
import { summarizeAnalysis } from '../services/gemini.js';

const router = express.Router();

const REQUIRED_DISCLAIMER = 'This is a thinking aid, not advice. The decision is yours.';

/**
 * POST /api/summary
 * Generates final thinking summary with checked points, still unknown uncertainties, and next checks.
 */
router.post('/', async (req, res, next) => {
  try {
    const validation = validateRequest(SummaryRequestSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { originalText, answers, analysis } = validation.data;

    // Call Gemini API for summary
    const aiResult = await summarizeAnalysis({
      originalText,
      answers,
      analysis,
    });

    // Ensure disclaimer is exactly the required string
    const responsePayload = {
      decision: aiResult.decision || analysis.decision || 'Decision under evaluation',
      checked: Array.isArray(aiResult.checked) ? aiResult.checked : [],
      still_unknown: Array.isArray(aiResult.still_unknown) ? aiResult.still_unknown : [],
      next_checks: Array.isArray(aiResult.next_checks) ? aiResult.next_checks : [],
      disclaimer: REQUIRED_DISCLAIMER,
    };

    return res.status(200).json(responsePayload);
  } catch (err) {
    return next(err);
  }
});

export default router;
