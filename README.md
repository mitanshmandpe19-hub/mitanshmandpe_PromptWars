# BLIND SPOT 🔍

> Live demo: (add Cloud Run link here after deployment)
> 
> 📄 **Architecture & Implementation Plan:** [docs/PLAN.md](file:///docs/PLAN.md)

---

## 💡 What It Does

**Blind Spot** is an AI thinking companion built for the cognitive challenge **"THE BLIND SPOT"**: when people make important decisions, they naturally fixate on the first reasons that come to mind while overlooking hidden assumptions, systemic risks, unconsidered alternatives, and missing factors.

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
│   │   │   └── client.js         # Fetch client for /api endpoints
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
│   │   ├── App.jsx               # Main application shell
│   │   ├── index.css             # Thinking Board design system & tokens
│   │   └── main.jsx              # React entry point
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
│   │   └── index.js              # Server entry & shutdown handlers
│   └── tests/                    # Vitest & Supertest backend suites
├── docs/
│   └── PLAN.md                   # Architecture & Implementation Plan
├── Dockerfile                    # Multi-stage container build
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore specifications
├── eslint.config.js              # ESLint 9 configuration
├── .prettierrc                   # Prettier formatting rules
├── vitest.config.js              # Vitest server test configuration
└── package.json                  # Root npm scripts & workspace config
```

---

## 📸 Interface Preview ("The Thinking Board")

```
+-------------------------------------------------------------------------+
|  💡 BLIND SPOT                  [1. Write] [2. Understood] [3. Examine] |
+-------------------------------------------------------------------------+
|                                                                         |
|   ┌───────────────────────────┐    ┌────────────────────────────────┐  |
|   │ 🎓 Unnegotiated Schedule  │    │ 💡 Active Consideration        │  |
|   │ [● Direct Evidence]       │    │ "What would happen if you      │  |
|   │ "don't have enough time"  │    │  requested 10h/week during     │  |
|   │ ★ QUOTE VERIFIED          │    │  finals?"                      │  |
|   │ [✓ RESOLVED]              │    │ ______________________________ │  |
|   └───────────────────────────┘    │ [Update Reasoning ↵]           │  |
|                                    └────────────────────────────────┘  |
+-------------------------------------------------------------------------+
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

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd promptwar
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` and provide your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=8080
NODE_ENV=development
CORS_ORIGIN=*
```

3. Run locally:
```bash
# Start development server with auto-reload
npm run dev

# Or run standard start
npm start
```
The server will be available at `http://localhost:8080`.

---

## 📡 API Endpoints

### 1. Health Check
`GET /api/health`
- **Response:** `{ "status": "ok" }`

### 2. Analyze Initial Decision
`POST /api/analyze`
- **Request Body:**
```json
{
  "text": "I am thinking of quitting my internship because I don't have enough time to study."
}
```
- **Response:**
```json
{
  "needs_more_input": false,
  "decision": "Quitting internship",
  "stated_reason": "Not having enough time to study",
  "assumption": "Internship hours cannot be negotiated or restructured",
  "focused_on": ["Study hours", "Academic performance"],
  "not_mentioned": ["Manager conversation", "Reduced hours option", "Remote work"],
  "blind_spots": [
    {
      "id": "bs-1",
      "title": "Rigid Schedule Assumption",
      "type": "Assumption",
      "why_flagged": "Have you verified whether your employer offers flexible or reduced hours during exams?",
      "evidence_quote": "don't have enough time to study",
      "evidence_status": "direct",
      "quote_verified": true,
      "confidence": "high",
      "status": "open"
    }
  ],
  "top_question": "What would happen if you requested a temporary reduction to 10-15 hours per week during exam season?"
}
```

### 3. Update Analysis with Follow-Up Answer
`POST /api/update`
- **Request Body:**
```json
{
  "originalText": "I am thinking of quitting my internship because I don't have enough time to study.",
  "answers": [],
  "previousAnalysis": { "..." : "..." },
  "question": "What would happen if you requested a temporary reduction to 10-15 hours per week during exam season?",
  "answer": "I asked my manager and they immediately approved 10 hours a week for the next month."
}
```
- **Response:**
Same shape as `/api/analyze` with updated statuses (`"open"`, `"partial"`, `"resolved"`), verified quotes across all answers, new `top_question` (or `null`), and `status_change_notes: [{ "id": "bs-1", "from": "open", "to": "resolved", "reason": "Manager approved 10h/week" }]`.

### 4. Final Summary
`POST /api/summary`
- **Request Body:**
```json
{
  "originalText": "I am thinking of quitting my internship because I don't have enough time to study.",
  "answers": [{ "question": "...", "answer": "..." }],
  "analysis": { "..." : "..." }
}
```
- **Response:**
```json
{
  "decision": "Adjusting internship schedule to 10h/week instead of quitting",
  "checked": [
    "Manager confirmed availability of 10-hour exam schedule",
    "Gained 20 additional weekly study hours"
  ],
  "still_unknown": [
    "Whether 10 hours pay impacts short-term living expenses"
  ],
  "next_checks": [
    "Review monthly expenses against reduced earnings"
  ],
  "disclaimer": "This is a thinking aid, not advice. The decision is yours."
}
```

---

## 🧪 Testing & Code Quality

Run tests and quality checks:
```bash
# Run all Vitest unit and integration test suites
npm test

# Run Vitest in interactive watch mode
npm run test:watch

# Run ESLint
npm run lint

# Automatically fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

---

## ☁️ Google Cloud Run Deployment

Blind Spot is containerized via a multi-stage `Dockerfile` that builds the frontend and serves both API and static assets on a single Cloud Run URL.

### 1. Build and Deploy with Google Cloud CLI

```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build and push container to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/blind-spot:latest .

# 3. Deploy to Cloud Run
gcloud run deploy blind-spot \
  --image gcr.io/YOUR_GCP_PROJECT_ID/blind-spot:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-2.5-flash \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### 2. Managing Secrets in Google Secret Manager (Recommended)
```bash
# Create secret for Gemini API key
echo -n "your-gemini-api-key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Grant Secret Accessor role to the Cloud Run service account
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 📄 License
MIT
