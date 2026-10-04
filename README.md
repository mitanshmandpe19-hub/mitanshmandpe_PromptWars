# BLIND SPOT 🔍

[![CI](https://github.com/mitanshmandpe19-hub/mitanshmandpe_PromptWars/actions/workflows/ci.yml/badge.svg)](https://github.com/mitanshmandpe19-hub/mitanshmandpe_PromptWars/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live demo:** (add Render or Cloud Run link here after deployment)
> 
> 📄 **Architecture & Implementation Plan:** [docs/PLAN.md](file:///docs/PLAN.md)
> 
> ⚠️ **Privacy Notice:** *Do not enter sensitive personal information in this demo.*

---

## 💡 What It Does

**Blind Spot** is an evidence-aware critical thinking companion built for the cognitive challenge **"THE BLIND SPOT"**: when people make important decisions, they naturally fixate on the first reasons that come to mind while overlooking hidden assumptions, systemic risks, unconsidered alternatives, and missing factors.

Blind Spot helps users examine their own reasoning **WITHOUT making the decision for them**:
- 🚫 **Never decides or advises:** It will never recommend a decision, suggest what choice to make, or say *"you should"* or *"I recommend"*.
- ❓ **Questions over assertions:** Blind spots are framed as unresolved questions and considerations to explore rather than assumptions about the user's life.
- 🎯 **High-leverage focus:** Returns at most **3 high-impact blind spots** and asks **exactly ONE** focused follow-up question.
- 🛡️ **Evidence-Aware & Quote-Verified:** Every blind spot ties directly to the user's exact words, verified independently by backend deterministic code (not the AI).

---

## 🏛️ Architecture & Project Structure

```
promptwar/
├── client/                       # React 18 + Vite Frontend SPA
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Fetch client for /api endpoints (supports VITE_API_URL)
│   │   ├── components/
│   │   │   ├── BlindSpotCard.jsx # Sticky note card with tilt, stamps & badge
│   │   │   ├── Confetti.jsx       # Canvas confetti celebratory burst
│   │   │   ├── EvidenceBadge.jsx  # Shape + Text + Color accessible badge
│   │   │   ├── ExamineStage.jsx   # Stage 3: Card grid + spotlight question
│   │   │   ├── Header.jsx         # Mascot & stage step indicator
│   │   │   ├── HighlightedText.jsx# Verified quote highlighter & sync
│   │   │   ├── InputStage.jsx     # Stage 1: Hero sticky note & typewriter chips
│   │   │   ├── ProgressTracker.jsx# Segmented animated status bar
│   │   │   ├── QuestionCard.jsx   # Spotlight question reflection form
│   │   │   ├── SummaryStage.jsx   # Stage 4: Keepsake receipt & export tools
│   │   │   ├── Timeline.jsx       # Collapsible thinking history accordion
│   │   │   └── UnderstoodStage.jsx# Stage 2: Extracted cards & focus clouds
│   │   ├── hooks/
│   │   │   └── useDecisionSession.js # Stage machine & session coordinator
│   │   ├── tests/                # React Testing Library test suites
│   │   ├── App.jsx               # Main application shell with privacy footer
│   │   ├── index.css             # Thinking Board design system & tokens
│   │   └── main.jsx              # React entry point
│   ├── vercel.json               # Vercel SPA routing configuration
│   ├── index.html                # HTML template with Google Fonts
│   ├── package.json              # Client dependencies
│   └── vite.config.js            # Vite config with /api proxy & JSDOM
├── server/                       # Node.js + Express Backend
│   ├── src/
│   │   ├── routes/               # analyze.js, update.js, summary.js
│   │   ├── services/             # gemini.js, quoteVerifier.js, validation.js
│   │   ├── prompts/              # systemPrompt.js, schemas.js
│   │   ├── middleware/           # security.js, rateLimit.js, errorHandler.js
│   │   ├── app.js                # Express app & client/dist static server
│   │   └── index.js              # Server entry (0.0.0.0, PORT) & shutdown handlers
│   └── tests/                    # Vitest & Supertest backend suites
├── docs/
│   └── PLAN.md                   # Architecture & Implementation Plan
├── .github/
│   └── workflows/
│       └── ci.yml                # Automated CI pipeline (lint, test, build)
├── render.yaml                   # Render Blueprint infrastructure specification
├── Dockerfile                    # Multi-stage container build for Cloud Run
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore specifications
├── eslint.config.js              # ESLint 9 configuration
├── .prettierrc                   # Prettier formatting rules
├── vitest.config.js              # Vitest server test configuration
└── package.json                  # Root npm scripts & unified workspace build
```

---

## 🔍 How Evidence Verification Works

A core guarantee of Blind Spot is **evidence integrity**:
1. When the AI model flags an assumption, risk, or missing factor, it attempts to supply an verbatim substring in `evidence_quote`.
2. Rather than trusting the LLM's claim that the user said something, the backend service [`quoteVerifier.js`](file:///server/src/services/quoteVerifier.js) performs a deterministic, pure-function verification against the aggregated user corpus:
   - **Corpus Aggregation:** Combines `originalText`, all previous round `answers`, and the latest `answer`.
   - **Tolerant Normalization:** Strips punctuation, standardizes smart quotes (`“”` `’`), collapses multi-spaces/newlines, and converts to lowercase.
   - **Verification Rule:** If the normalized quote is found as a substring within the normalized corpus, `quote_verified` is set to `true`.
   - **Downgrade Rule:** If the quote is fabricated, hallucinated, or not found, the backend automatically downgrades the blind spot:
     - `evidence_quote` is set to `null`
     - `quote_verified` is set to `false`
     - `evidence_status` is set to `"none"`

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v20+ recommended)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### Installation & Local Run

1. Clone repository and install dependencies:
```bash
git clone https://github.com/mitanshmandpe19-hub/mitanshmandpe_PromptWars.git
cd mitanshmandpe_PromptWars
npm install
npm --prefix client install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` and configure your API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=8080
NODE_ENV=development
CORS_ORIGIN=*
```

3. Build and run:
```bash
# Build frontend and start server
npm run build
npm start

# Or run in development mode with auto-reload
npm run dev
```
Open **http://localhost:8080** in your browser.

---

## ☁️ Deployment Guide

### Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key from AI Studio. Never commit this key. |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Gemini model name (e.g. `gemini-3.5-flash-lite`, `gemini-2.5-flash-lite`). |
| `PORT` | No | `8080` (or host assigned) | Port the Express server listens on (binds to `0.0.0.0`). |
| `NODE_ENV` | No | `production` | Set to `production` in live deployments (disables `*` wildcard CORS). |
| `CORS_ORIGIN` | No | `*` (dev) / strict (prod) | Comma-separated list of allowed origins (e.g. `https://my-app.vercel.app`). |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` (1 min) | Rate limiter window in milliseconds. |
| `RATE_LIMIT_MAX` | No | `20` | Maximum API requests per IP per window. |
| `VITE_API_URL` | No | `""` (relative `/api`) | Optional API URL for standalone frontend deployments (e.g. Vercel). |

> [!NOTE]
> **Free Tier Sleep/Spin-up:** Free instances on Render and Cloud Run may spin down when idle. The very first request after inactivity may experience a 15–30 second cold start. Subsequent interactions are fast.

---

### Option A: Render (Full App Deployment — Recommended)

Render deploys both the backend API and compiled React SPA as a single web service.

#### 1. Via Render Blueprint (`render.yaml`)
1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** $\rightarrow$ **Blueprint**.
2. Connect your GitHub repository: `mitanshmandpe_PromptWars`.
3. Render will detect `render.yaml` automatically.
4. When prompted, enter your `GEMINI_API_KEY` secret.
5. Click **Apply**.

#### 2. Manual Web Service Setup on Render
If configuring manually without blueprint:
- **Environment:** `Node`
- **Branch:** `main`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Environment Variables:**
  - `GEMINI_API_KEY`: *(Your Secret Key)*
  - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
  - `NODE_ENV`: `production`

---

### Option B: Vercel (Frontend Only — Optional)

If you prefer hosting the React frontend on Vercel and the backend on Render/Cloud Run:

1. Import the repository in [Vercel](https://vercel.com/).
2. Set **Root Directory** to `client`.
3. Framework Preset will auto-detect **Vite**.
4. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`
5. On your backend service, set:
   - `CORS_ORIGIN`: `https://your-frontend.vercel.app`
6. Deploy! SPA routing is pre-configured via [`client/vercel.json`](file:///client/vercel.json).

---

### Option C: Google Cloud Run (Containerized Deployment)

Blind Spot includes a multi-stage [`Dockerfile`](file:///Dockerfile):

```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/blind-spot:latest .

gcloud run deploy blind-spot \
  --image gcr.io/YOUR_GCP_PROJECT_ID/blind-spot:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-3.5-flash-lite,NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 🧪 Testing & Code Quality

```bash
# Run all unit and integration test suites (Vitest + React Testing Library)
npm test

# Run ESLint validation
npm run lint

# Format codebase with Prettier
npm run format
```

---

## 📄 License
MIT
