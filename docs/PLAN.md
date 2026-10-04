# BLIND SPOT — Architecture & Frontend Implementation Plan

## Overview & Architecture
Stateless full-stack app: Node.js/Express backend + React 18/Vite SPA in `/client`. In development, Vite proxies `/api` to Express (`:8080`). In production, Express statically serves `/client/dist`.

## Frontend Component Structure
- `App.jsx`: Global stage state machine (`WRITE` → `UNDERSTOOD` → `EXAMINE` → `SUMMARY`), error boundary, live announcer.
- `src/components/`: `Header.jsx`, `InputStage.jsx`, `UnderstoodStage.jsx`, `ExamineStage.jsx`, `SummaryStage.jsx`, `BlindSpotCard.jsx`, `EvidenceBadge.jsx`, `ProgressTracker.jsx`, `QuestionCard.jsx`, `Timeline.jsx`, `HighlightedText.jsx`, `Confetti.jsx`.
- `src/api/client.js`: Isolated fetch client for `/api/analyze`, `/api/update`, `/api/summary`.
- `src/hooks/useDecisionSession.js`: Stage transitions, card updates, answer accumulation.

## Design System: "The Thinking Board"
- **Colors:** Paper bg `#FFF8EC`, ink `#1B2340`, coral `#FF6B57` (Risk), yellow `#FFC93C` (Assumption), sky `#4D9DE0` (Missing Factor), teal `#1FB5A3`, pink `#FF9ECD`.
- **Typography & Borders:** Bricolage Grotesque (headings), Figtree (body). Chunky 2.5px ink borders with 3px hard offset shadows (`3px 3px 0 #1B2340`).
- **Cards & Animations:** Sticky notes rotated ±1°, rubber stamp animations for status transitions ("RESOLVED", "PARTIAL"), highlighter marks.

## 4 Stages & State Flow
1. **WRITE:** Sticky note textarea, char counter (1500 max), demo typewriter chips.
2. **UNDERSTOOD:** Extracted decision/assumption, solid "Focused on" vs dashed "Didn't mention" chips, synchronized highlighted text.
3. **EXAMINE:** Up to 3 tilt-cards, evidence badge (shape+text+color), spotlight question, previous Q&A timeline, skip/finish.
4. **SUMMARY:** Receipt-style card (checked, unknown, next checks), copy/download/print actions, exact thinking aid disclaimer.

## Accessibility (WCAG AA) & Testing Strategy
- **A11y:** Semantic HTML, skip-link, programmatic stage focus shifting, `aria-live="polite"` announcements, 44px touch targets, `prefers-reduced-motion` fallbacks.
- **Testing:** Vitest + React Testing Library unit tests verifying EvidenceBadge (shape+text), BlindSpotCard (stamp/quote gating), ProgressTracker, and HighlightedText.
