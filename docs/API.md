# Blind Spot API Reference 📡

Complete specification for the Blind Spot cognitive thinking backend.

---

## 🌐 Overview & Base URL

- **Base Path:** `/api`
- **Default Local URL:** `http://localhost:8080/api`
- **Format:** All requests must include `Content-Type: application/json` and valid JSON payloads.
- **Maximum Request Size:** `10kb` (enforced by security middleware).

---

## 🛡️ Authentication & CORS

- **Authentication:** All Gemini AI calls are handled securely on the server using `GEMINI_API_KEY`. No client authentication or tokens are required.
- **CORS:** Configured via `CORS_ORIGIN`. In production (`NODE_ENV=production`), wildcard `*` is disallowed and origins must be explicitly whitelisted.

---

## 🚦 Rate Limiting

The API applies an IP-based rate limiter to all `/api/*` endpoints except `/api/health`:

- **Default Window:** `60000ms` (1 minute)
- **Default Max Requests:** `20` requests per IP per window
- **Standard Headers Returned:**
  - `RateLimit-Limit`: Maximum allowed requests in window
  - `RateLimit-Remaining`: Remaining requests in current window
  - `RateLimit-Reset`: Seconds until window resets
- **Rate Limit Exceeded Response:** HTTP `429 Too Many Requests`

---

## ⚠️ Error Codes & Format

All error responses return a standardized JSON object:

```json
{
  "error": "Descriptive user-friendly error message"
}
```

| HTTP Status | Error Code            | Description                                                                     |
| ----------- | --------------------- | ------------------------------------------------------------------------------- |
| `400`       | `VALIDATION_ERROR`    | Request payload failed schema validation (e.g. text too short or invalid type). |
| `401`       | `INVALID_API_KEY`     | The configured `GEMINI_API_KEY` is rejected by Google AI Studio.                |
| `404`       | `NOT_FOUND`           | The requested route does not exist.                                             |
| `413`       | `PayloadTooLarge`     | Request payload exceeds the strict 10kb body limit.                             |
| `429`       | `RATE_LIMIT_EXCEEDED` | Client rate limit exceeded or Gemini API quota/spikes in demand.                |
| `500`       | `MISSING_API_KEY`     | `GEMINI_API_KEY` was not configured on the server.                              |
| `502`       | `MODEL_NOT_FOUND`     | Configured `GEMINI_MODEL` does not exist or is deprecated.                      |
| `502`       | `INVALID_AI_RESPONSE` | The AI response failed internal schema validation.                              |
| `504`       | `TIMEOUT`             | AI reasoning analysis exceeded the 45-second deadline.                          |

---

## 📡 Endpoints

### 1. Health Check

Checks server liveness. Exempt from rate limits.

- **Method:** `GET`
- **Path:** `/api/health`
- **Response `200 OK`:**

```json
{
  "status": "ok"
}
```

---

### 2. Analyze Initial Decision

Analyzes the user's initial decision text for hidden blind spots and unexamined factors. Results for identical inputs are cached in-memory.

- **Method:** `POST`
- **Path:** `/api/analyze`
- **Request Body:**

```json
{
  "text": "I am thinking of quitting my internship because I don't have enough time to study."
}
```

- **Response `200 OK`:**

```json
{
  "needs_more_input": false,
  "decision": "Whether to quit the internship.",
  "stated_reason": "Not having enough time to study.",
  "assumption": "Quitting is the only way to get enough study time.",
  "focused_on": ["study time", "internship"],
  "not_mentioned": ["negotiating hours", "career impact", "financial trade-offs"],
  "blind_spots": [
    {
      "id": "bs_1",
      "title": "All-or-Nothing Approach",
      "type": "Assumption",
      "why_flagged": "What if quitting is treated as the only option before checking if hours can be reduced?",
      "evidence_quote": "quitting my internship because I don't have enough time to study",
      "evidence_status": "direct",
      "quote_verified": true,
      "confidence": "high",
      "status": "open"
    }
  ],
  "top_question": "What possibilities exist between keeping the internship as-is and quitting entirely?"
}
```

---

### 3. Update Analysis with Follow-Up Answer

Re-evaluates reasoning after the user reflects on the spotlight question.

- **Method:** `POST`
- **Path:** `/api/update`
- **Request Body:**

```json
{
  "originalText": "I am thinking of quitting my internship because I don't have enough time to study.",
  "answers": [],
  "previousAnalysis": {
    "decision": "Whether to quit the internship.",
    "blind_spots": [
      {
        "id": "bs_1",
        "title": "All-or-Nothing Approach",
        "type": "Assumption",
        "status": "open"
      }
    ]
  },
  "question": "What possibilities exist between keeping the internship as-is and quitting entirely?",
  "answer": "The internship takes 15 hours a week. My exam prep needs 25 hours and I only study 10 now."
}
```

- **Response `200 OK`:**

```json
{
  "needs_more_input": false,
  "decision": "Whether to quit the internship.",
  "stated_reason": "Not having enough time to study.",
  "assumption": null,
  "focused_on": ["internship hours", "study hours"],
  "not_mentioned": ["negotiating hours with employer"],
  "blind_spots": [
    {
      "id": "bs_1",
      "title": "All-or-Nothing Approach",
      "type": "Assumption",
      "why_flagged": "The response quantifies weekly hours but has not yet explored flexible hours.",
      "evidence_quote": "The internship takes 15 hours a week.",
      "evidence_status": "indirect",
      "quote_verified": true,
      "confidence": "high",
      "status": "partial"
    }
  ],
  "top_question": "What prevents discussing a temporary reduction with your internship manager?",
  "status_change_notes": [
    {
      "id": "bs_1",
      "from": "open",
      "to": "partial",
      "reason": "Quantified time breakdown provided without exploring schedule negotiation."
    }
  ]
}
```

---

### 4. Generate Final Summary

Generates a structured thinking receipt synthesizing explored assumptions and concrete next checks.

- **Method:** `POST`
- **Path:** `/api/summary`
- **Request Body:**

```json
{
  "originalText": "I am thinking of quitting my internship because I don't have enough time to study.",
  "answers": [
    {
      "question": "What possibilities exist between keeping the internship as-is and quitting entirely?",
      "answer": "The internship takes 15 hours a week. My exam prep needs 25 hours and I only study 10 now."
    }
  ],
  "analysis": {
    "decision": "Whether to quit the internship.",
    "blind_spots": []
  }
}
```

- **Response `200 OK`:**

```json
{
  "decision": "Whether to quit the current internship to create more study time.",
  "checked": ["Specific time allocation needed for the internship versus exam preparation."],
  "still_unknown": [
    "Whether the 15-hour internship commitment is flexible or negotiable with the employer."
  ],
  "next_checks": [
    "Explore whether the internship supervisor would be open to a temporary reduction in weekly hours."
  ],
  "disclaimer": "This is a thinking aid, not advice. The decision is yours."
}
```
