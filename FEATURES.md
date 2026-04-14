# ResumeAI — Features, validation, and usage limits

Last updated: 2026-04-14

This document reflects **behavior implemented in the codebase** (backend limits, middleware, and key UI gates). Marketing copy on the pricing page may differ in places; where that happens, it is called out below. When in doubt, treat backend middleware/controller behavior as the source of truth.

## How “Premium” is determined

A user is treated as premium when **either**:

- `user.plan === "premium"`, or  
- `user.Premium === true`

(See `User` model and usage checks in controllers/middleware.)

---

## Validation and access (all tiers)

| Requirement | What it means |
|---------------|----------------|
| **Signed in** | Valid JWT (`verifyJWT`) on protected API routes. |
| **Verified email** | For most product APIs, `requireEmailVerified` is applied. Users who sign in with **Google** are treated as verified when `googleId` is set (same pattern as in the frontend). |
| **Anti-abuse rate limits** | Short **per-minute** caps on some endpoints (by user or IP) — separate from **daily** feature limits. See [Rate limits (anti-abuse)](#rate-limits-anti-abuse). |

Unauthenticated visitors can still browse some public/marketing pages; resume template **style** access (Classic / Minimal / Premium layouts) is **restricted in the UI** for free accounts — see [UI-only locks](#ui-only-locks).

---

## Daily usage limits (UTC calendar day)

Daily counters reset at **UTC midnight**. The API exposes `resetsAt` (next UTC midnight) via `GET /usage-status` for the UI.

Constants live in `Backend/src/config/featureLimits.js`:

| Feature | Free | Premium | Daily limit (UTC) | Notes |
|--------|------|---------|-------------------|--------|
| **Resume PDF download / print** (recorded download) | Yes | Yes | **5** | Same cap for free and premium (`RESUME_DOWNLOAD_DAILY_LIMIT`). |
| **Live (video) interviews** | No | Yes | **5** | Premium only; then daily cap (`LIVE_INTERVIEW_DAILY_LIMIT`). |
| **Coding interviews** | No | Yes | **5** | Premium only; then daily cap (`CODING_INTERVIEW_DAILY_LIMIT`). |
| **Career roadmap (AI generation)** | No | Yes | **15** | Premium only; then daily cap (`ROADMAP_DAILY_LIMIT`). |
| **Portfolio deploy (Vercel)** | No | Yes | **10** | Premium only; then daily cap (`PORTFOLIO_DEPLOY_DAILY_LIMIT_PREMIUM`). |

**Premium-only features (no daily quota until you upgrade):**  
For non-premium users, `GET /usage-status` marks `liveInterview`, `codingInterview`, `roadmap`, and `portfolioDeploy` with `premiumRequired: true` (used counts as 0 for those slots until premium).

---

## AI resume optimization & ATS

| Capability | Free | Premium | Enforced limit in code |
|------------|------|---------|-------------------------|
| **AI resume edit / optimize** (`/aiedit`) | Yes (with auth + verified email) | Yes | **No** per-plan daily cap in the backend. Usage is **counted** (`increment-optimize`) but not blocked by plan. |
| **ATS check** (`/atscheck`) | Yes (with auth + verified email) | Yes | **No** daily quota found in controllers. |
| **Pricing page** (`Frontend/src/Price.jsx`) | Claims “1 resume optimization” | Claims “Unlimited optimizations” | **Marketing only**; not enforced as a hard limit in the backend at the time of this document. |

---

## AI provider behavior (current backend)

- Shared AI module: `Backend/src/utils/aiClient.js`
- Primary provider (**API1**): Groq via `GROQ_API_KEY`
- Fallback providers: **API2** and **API3** (if configured)
- Retry policy: up to **2 retries per provider** for retryable failures (429, 5xx, timeout/network errors)
- Timeout: **9s** per chat request (`Promise.race`)
- Circuit breaker: when API1 fails after retries, it is skipped for **5 minutes**, then automatically retried
- Final failure: if API1/API2/API3 all fail, the operation fails with `"All LLM APIs failed"` (or a wrapped controller message)

### AI interview recording path (post-call)

- Recording upload: Cloudinary (`raw`)
- Transcription: Groq Whisper through `transcribeRecordingBuffer`
- Scoring/report generation: `getAiResponse` (same multi-provider fallback flow)
- If `GROQ_API_KEY` is missing, interview may complete without transcript/report

---

## UI-only locks

These are enforced in the **frontend**, not only by numeric quotas:

| Area | Free | Premium |
|------|------|---------|
| **Resume template styles** (`Templates.jsx`) | Only **Modern** is unlocked; Classic, Minimal, and Premium **styles** go to pricing when locked. | All four style groups available. |
| **Portfolio project templates** (`PortfolioDesignView.jsx`) | Page shows **upgrade**; designs are not usable without premium. | Full access; deploy still subject to **daily deploy limit** above. |
| **Dashboard shortcuts** (`Dashboard.jsx`) | Portfolio designs, career roadmap, coding interview, live interviews, leaderboard show **Premium only** unless `user.Premium`. | Unlocked (subject to email verification and daily limits where applicable). |

---

## Rate limits (anti-abuse)

Defined in `Backend/src/middleware/resumeGenerateRateLimit.middleware.js` (per **minute**, not per day):

| Limiter | Max / minute | Typical scope |
|---------|----------------|---------------|
| Resume download recording | 10 | Per user (or IP if no user) |
| Login / register | 10 | Per IP |
| Single coding question | 10 | Per IP |
| Bulk coding questions | 3 | Per IP |
| Run code | 20 | Per IP |
| Code review | 10 | Per IP |
| Follow-up question | 10 | Per IP |

---

## Notes for maintainers

- `Backend/src/routes/resume.routes.js` contains a **comment** that mentions different free vs premium download limits; the **actual** daily cap is **`RESUME_DOWNLOAD_DAILY_LIMIT` (5)** for everyone in `checkResumeDownloadLimit.middleware.js`. Update the comment if you change behavior.
- `GET /usage-status` is the single source for the dashboard/resume/interview pages to show **remaining** daily usage and **next reset** time.
