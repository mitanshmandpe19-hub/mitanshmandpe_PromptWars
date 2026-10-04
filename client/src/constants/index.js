/**
 * Centralized client constants for Blind Spot.
 */

export const STAGES = Object.freeze({
  WRITE: 'write',
  UNDERSTOOD: 'understood',
  EXAMINE: 'examine',
  SUMMARY: 'summary',
});

export const BLIND_SPOT_STATUSES = Object.freeze({
  OPEN: 'open',
  PARTIAL: 'partial',
  RESOLVED: 'resolved',
});

export const BLIND_SPOT_TYPES = Object.freeze({
  ASSUMPTION: 'Assumption',
  RISK: 'Risk',
  MISSING_FACTOR: 'Missing Factor',
});

export const EVIDENCE_STATUSES = Object.freeze({
  DIRECT: 'direct',
  INDIRECT: 'indirect',
  NONE: 'none',
});

export const DEMO_EXAMPLES = Object.freeze([
  {
    id: 'internship',
    label: 'Quit internship',
    text: "I am thinking of quitting my internship because I don't have enough time to study.",
  },
  {
    id: 'ai-startup',
    label: 'Launch AI startup',
    text: 'I want to drop out of university and build an AI startup because AI is growing rapidly right now.',
  },
  {
    id: 'relocate',
    label: 'Move to London',
    text: 'I am moving to London next month for better networking, even though rent will cost 70% of my current savings.',
  },
]);
