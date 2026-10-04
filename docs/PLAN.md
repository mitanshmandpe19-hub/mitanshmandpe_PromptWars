# BLIND SPOT — Architecture & Implementation Plan

## 1. Overview & Architecture

Stateless full-stack app: Node.js/Express backend + React 18/Vite SPA in `/client`. In development, Vite proxies `/api` to Express (`:8080`). In production, Express statically serves `/client/dist` with cache headers. Compatible with Google Cloud Run, Render, and Vercel.

## 2. Code Structure & Modules

- **Backend (`/server/src`):**
  - `config/`: Validated startup configuration (`port`, `geminiModel`, `rateLimits`, `corsOrigin`).
  - `constants/`: Shared enums (`BLIND_SPOT_STATUSES`, `BLIND_SPOT_TYPES`, `ERROR_CODES`, `LIMITS`).
  - `errors/`: Standardized `AppError` class with HTTP status codes and error types.
  - `services/`: `gemini.js` (orchestrator with `maxOutputTokens`), `analyzeCache.js` (in-memory SHA-256 LRU cache), `retry.js` (429/503 exponential backoff), `errorClassifier.js`, `quoteVerifier.js` (deterministic quote verifier), `validation.js` (Zod schemas).
  - `middleware/`: `security.js` (strict production CORS & Helmet), `rateLimit.js`, `errorHandler.js`.
  - `routes/`: `analyze.js`, `update.js`, `summary.js`.
- **Frontend (`/client/src`):**
  - `App.jsx`: Global stage state machine (`WRITE` → `UNDERSTOOD` → `EXAMINE` → `SUMMARY`), code-split with `React.lazy` and `Suspense`.
  - `components/`: `Header.jsx`, `InputStage.jsx`, `DemoChips.jsx`, `UnderstoodStage.jsx`, `ExamineStage.jsx`, `SummaryStage.jsx`, `BlindSpotCard.jsx`, `EvidenceBadge.jsx`, `ProgressTracker.jsx`, `QuestionCard.jsx`, `Timeline.jsx`, `HighlightedText.jsx`, `Confetti.jsx`.
  - `api/client.js`: Fetch client supporting `VITE_API_URL` and `AbortSignal` cancellation.
  - `hooks/useDecisionSession.js`: Stage transitions, quote highlighting, AbortController lifecycle.
  - `utils/exportHelpers.js`: Receipt text formatting, download, and clipboard copy utilities.

## 3. Design System: "The Thinking Board"

- **Colors:** Paper bg `#FFF8EC`, ink `#1B2340`, coral `#FF6B57` (Risk), yellow `#FFC93C` (Assumption), sky `#4D9DE0` (Missing Factor), teal `#1FB5A3`, pink `#FF9ECD`.
- **Typography & Borders:** Optimized Bricolage Grotesque (headings) & Figtree (body) with `font-display: swap`. Chunky 2.5px ink borders with 3px hard offset shadows (`3px 3px 0 #1B2340`).
- **Cards & Animations:** Sticky notes rotated ±1°, rubber stamp animations for status transitions ("RESOLVED", "PARTIAL"), verified quote badges.

## 4. 4 Stages & State Flow

1. **WRITE:** Sticky note textarea, char counter (1500 max), typewriter demo chips.
2. **UNDERSTOOD:** Extracted decision/assumption, solid "Focused on" vs dashed "Didn't mention" chips, synchronized highlighted text.
3. **EXAMINE:** Up to 3 tilt-cards, evidence badge (shape+text+color), spotlight question, previous Q&A timeline, skip/finish.
4. **SUMMARY:** Keepsake receipt card (checked, unknown, next checks), copy/download/print actions, exact thinking aid disclaimer.

## 5. Performance & Quality Benchmarks

- **Code-Splitting:** Dynamic imports for heavy later stages reduce initial entry JS size by ~19% (~160 kB initial chunk).
- **Caching & Efficiency:** In-memory SHA-256 analyze cache, 1y immutable static asset caching, rate limiting, and token-bounded prompts.
- **Coverage & A11y:** >80% backend coverage, 0 ESLint warnings, WCAG AA compliance with `prefers-reduced-motion` fallbacks.
