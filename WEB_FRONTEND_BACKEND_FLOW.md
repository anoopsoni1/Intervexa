# ResumeAI Full Web Frontend-Backend Flow

Last updated: 2026-04-14

This document describes the complete request/response and feature flow across the ResumeAI frontend and backend.

---

## 1) System Architecture (High Level)

### Frontend (React + Vite)

- Entry: `Frontend/src/main.jsx`
- Routing: `react-router-dom` with nested routes
- State/data:
  - Redux store (`Provider`)
  - TanStack Query (`QueryClientProvider`)
  - Toast context (`ToastProvider`)
- Auth guards:
  - `RequireAuth` for signed-in only pages
  - `RequirePremium` for premium-only template sections

### Backend (Express)

- Entry: `Backend/src/server.js`
- App setup + middlewares: `Backend/src/app.js`
- Main API groups:
  - `/api/v1/user` (core product APIs)
  - `/api/v1/auth` (Google OAuth)
  - `/api/resume` (resume download record endpoint group)
  - `/api/v1/job/:jobId` (async queue job status)

### Infrastructure

- MongoDB (via `connectDB()`)
- Redis + BullMQ queue/worker for async heavy tasks
- Socket.IO signaling attached to same HTTP server
- Cloudinary (resume uploads, interview recording storage as `raw`)
- Docker compose services:
  - `redis`
  - `api`
  - `worker`

### AI / LLM layer (`Backend/src/utils/aiClient.js`)

Single module used by ATS, resume optimize (`aiedit`), coding interview AI, roadmap, AI interview questions, and **post-interview evaluation** (after transcription).

| Piece | Role |
|--------|------|
| **API1 (primary)** | `GROQ_API_KEY` → Groq OpenAI-compatible chat at `https://api.groq.com/openai/v1`, default chat model `llama-3.3-70b-versatile`. |
| **API2 / API3 (fallback)** | Optional `API2_API_KEY`, `API3_API_KEY` (same Groq base URL in current config). Models: `llama-3.3-70b-versatile` / `llama-3.1-8b-instant`. |
| **Retries** | Up to **2 retries** per provider on 429, 5xx, and common network/timeout error codes. |
| **Chat timeout** | `Promise.race` — default **9s** per chat request (`API_TIMEOUT_MS`). |
| **API1 cooldown** | If API1 exhausts retries, it is skipped for **5 minutes**; traffic goes to API2 → API3. |
| **Transcription (interviews)** | Groq **Whisper** via `audio.transcriptions` (default model `whisper-large-v3`, overridable with `GROQ_WHISPER_MODEL`; longer timeout via `GROQ_TRANSCRIPTION_TIMEOUT_MS`, default 120s). Requires `GROQ_API_KEY` (`canTranscribeWithGroq` / primary `aiClient`). |
| **Helpers** | `getAiResponse(prompt)` (chat + fallback), `transcribeRecordingBuffer(...)`, `hasAnyAiProvider()` (any chat client), `canTranscribeWithGroq()` (Whisper available). |

Controllers gate **chat** features with `hasAnyAiProvider()`. Live interview **recording processing** requires Groq for STT plus any working chat provider for the scoring JSON.

---

## 2) Application Boot Flow

### Backend Startup Flow

1. Load environment variables.
2. Create HTTP server from Express app.
3. Connect MongoDB (`connectDB()`).
4. If worker is not skipped:
  - Check Redis connectivity.
  - Start in-process queue worker.
5. Attach Socket.IO/WebRTC signaling server.
6. Listen on `PORT` (default `5000`).

### Frontend Startup Flow

1. React app renders from `main.jsx`.
2. Providers are mounted (Query, Redux, Toast).
3. Browser router initializes all routes.
4. Route guards enforce auth/premium access.
5. Vercel analytics and PWA update handling are activated.

---

## 3) Core Request Pipeline (Backend)

For most API requests:

1. **Global API rate limit**
  Applied to `/api/v1/*` and `/api/resume/*` (60 req/min per IP).
2. **CORS check**
  Allows `http://localhost:5173` and `https://ansoyal-ai.co-vid.in`.
3. **Route-level middleware chain**
  Common stack includes:
  - `verifyJWT` (auth required)
  - `requireEmailVerified` (verified account gate)
  - feature-specific rate/usage middleware
4. **Controller execution**
  - Reads/writes DB
  - Sometimes enqueues background jobs
  - Returns JSON response
5. **Queue pattern (when async)**
  - API enqueues job and returns `jobId`
  - Frontend polls `/api/v1/job/:jobId`
  - Worker processes job and stores final result

---

## 4) Frontend Route and Access Flow

### Public Routes

- `/`, `/login`, `/register`, `/price`, `/about`, `/contact`, `/verify-email`, etc.

### Auth-Protected Routes (`RequireAuth`)

- Template design/view pages
- User-specific dashboard actions
- Interview and profile workflows

### Premium-Protected Routes (`RequirePremium`)

- Classic, Minimal, Premium resume template groups
- Free users are redirected/blocked at UI guard level

---

## 5) Main Product Flows

## A) Authentication Flow

### Email/Password

1. User submits register/login form.
2. Frontend calls:
  - `POST /api/v1/user/register`
  - `POST /api/v1/user/login`
3. Backend validates + rate limits auth endpoints.
4. On success, token/session data is used by frontend.
5. Protected routes then work with `verifyJWT`.

### Google OAuth

1. Frontend opens backend OAuth endpoint.
2. Backend route: `GET /api/v1/auth/google`
3. Google callback: `GET /api/v1/auth/google/callback`
4. Backend finalizes auth and redirects to frontend.

### Email Verification / Recovery

- Verify email: `GET /api/v1/user/verify-email`
- Resend verification: `POST /api/v1/user/resend-verification-email`
- Forgot password:
  - `POST /api/v1/user/forgot-password`
  - `POST /api/v1/user/verify-forgot-otp`
  - `POST /api/v1/user/reset-password`

---

## B) Resume Data + Rendering Flow

1. User updates detail data:
  - `POST /api/v1/user/create-detail`
  - `POST /api/v1/user/save-user-data`
  - `PUT /api/v1/user/update-detail/:id`
2. User opens template list page.
3. Frontend fetches templates from backend.
4. User opens selected resume template view.
5. Frontend fetches:
  - selected template layout
  - user detail payload (`/get-detail`)
6. Renderer mode decision:
  - if dynamic layout exists -> JSON layout renderer
  - else -> legacy component fallback

---

## C) ATS + AI Resume Edit Flow

### ATS Check

1. User submits resume/job context.
2. Frontend calls `POST /api/v1/user/atscheck` (queue-based endpoint).
3. Backend enqueues ATS job.
4. Frontend polls `/api/v1/job/:jobId`.
5. Result appears in ATS UI and can be persisted (`create-atsscore`, `update-atsscore`).

### AI Edit/Optimize

1. User requests AI improvements.
2. Frontend calls `POST /api/v1/user/aiedit` (queued when Redis is available).
3. Backend executes `aiEditResume` and calls `getAiResponse` (API1 -> API2 -> API3 fallback).
4. Frontend polls `GET /api/v1/job/:jobId` and reads `result.data.optimizedDetail` / `result.data.editedText`.
5. Output can be saved/retrieved using:
  - `POST /api/v1/user/save-user-data`
  - `POST /api/v1/user/save-edited-resume`
  - `GET /api/v1/user/get-edited-resume`

---

## D) Resume Export / Download Tracking Flow

1. Frontend triggers resume export/print/download UX.
2. Export endpoint: `POST /api/v1/user/docx`
3. Download recording endpoint:
  - `POST /api/v1/user/record-resume-download`
  - also available at `/api/resume/record-download`
4. Middleware chain enforces:
  - auth + verified email
  - anti-abuse per-minute rate limit
  - daily usage quota checks
5. Backend increments user usage counters.

---

## E) Interview Flows

### Live Video Interview

1. Create interview: `POST /api/v1/user/interviews`
2. Join call page: `/dashboard/interviews/:id/call` (Socket.IO/WebRTC signaling).

### AI Interview (record + evaluate)

1. Join AI call page: `/dashboard/interviews/:id/ai-call`.
2. Next question endpoint: `POST /api/v1/user/interviews/:id/ai-question` (uses `getAiResponse` fallback flow).
3. End call -> recording upload endpoint: `POST /api/v1/user/interviews/:id/upload-recording`.
4. Backend sets `status=processing`, uploads recording to Cloudinary, and runs background processing:
   - download recording
   - transcribe with Groq Whisper (`transcribeRecordingBuffer`)
   - evaluate transcript via `getAiResponse`
   - save `transcript`, `aiReport`, `status=completed`
5. Interview detail page polls while status is `processing` and renders report when completed.

### Coding Interview

1. Generate question(s):
  - `POST /api/v1/user/interview-question`
  - `POST /api/v1/user/interview-questions`
2. Execute/review/follow-up:
  - `/run-code`, `/code-review`, `/follow-up`
3. Persist interview sessions:
  - create/update/delete coding interview endpoints
4. View leaderboard:
  - `GET /api/v1/user/leaderboard`

---

## F) Career Roadmap Flow

1. User opens roadmap page (premium feature path).
2. Frontend calls `POST /api/v1/user/generate-roadmap`.
3. Backend enforces plan/usage middleware.
4. Roadmap generation is queued.
5. Frontend polls job status and renders roadmap result.

---

## G) Portfolio Deploy Flow

1. User selects portfolio template/design.
2. Frontend requests deployment via `POST /api/v1/user/deploy-portfolio`.
3. Backend checks plan + daily deploy quota.
4. Deployment metadata is stored and returned.
5. User can list and delete deployments:
  - `GET /api/v1/user/get-deployments`
  - `DELETE /api/v1/user/delete-deployment/:id`

---

## 6) Quotas, Limits, and Protection Layers

### Layer 1: Global API limiter

- 60 requests/minute/IP for `/api/v1` and `/api/resume` groups.

### Layer 2: Endpoint-specific anti-abuse limiters

- Additional per-minute caps for sensitive routes (auth, coding actions, downloads).

### Layer 3: Feature daily limits (UTC reset)

- Downloads, interviews, roadmap, and portfolio deploy are capped via usage middlewares.
- Frontend reads `GET /api/v1/user/usage-status` for remaining counts and reset time.

### Layer 4: UI route guards

- `RequireAuth` and `RequirePremium` prevent unauthorized page access at client layer.

---

## 7) Error and Fallback Behavior

- Missing/invalid JWT -> auth error from `verifyJWT`.
- Unverified user -> blocked by `requireEmailVerified`.
- Rate exceeded -> limiter error response.
- Daily quota exceeded -> feature limit middleware response.
- Queue disabled or Redis unavailable -> sync paths still run; async capability may be reduced.
- Legacy template records without dynamic layout -> frontend falls back to legacy render components.
- If all chat providers fail, AI endpoints can return fallback errors (for example: "All LLM APIs failed").
- If `GROQ_API_KEY` is missing, interview transcription cannot run and interview may complete without report.

---

## 8) End-to-End Sequence (Typical User Journey)

1. User registers/logs in.
2. User verifies email.
3. User fills profile/resume details.
4. User selects template and previews rendered resume.
5. User runs ATS and AI edit.
6. User downloads/exports resume (usage tracked).
7. User practices interviews (live/coding).
8. User generates roadmap and deploys portfolio (premium path).
9. User monitors usage status and daily resets.

---

## 9) Key Source References

- Frontend routes: `Frontend/src/main.jsx`
- Backend app/mounting: `Backend/src/app.js`
- Backend startup/runtime: `Backend/src/server.js`
- User API routes: `Backend/src/routes/user.routes.js`
- Auth routes: `Backend/src/routes/auth.routes.js`
- Resume routes: `Backend/src/routes/resume.routes.js`
- LLM + Whisper client: `Backend/src/utils/aiClient.js`
- Queue + jobs: `Backend/src/controller/queue.controller.js`, `Backend/src/queue/worker.js`, `Backend/src/queue/handlers/index.js`
- AI optimize handler: `Backend/src/controller/Uploadresume.controller.js`
- AI interview question handler: `Backend/src/controller/aiInterview.controller.js`
- Interview recording pipeline: `Backend/src/middleware/audio.middleware.js`, `Backend/src/services/interviewProcessing.service.js`
- Frontend optimize polling: `Frontend/src/pages/EditResumePage.jsx`
- Frontend interview pages: `Frontend/src/pages/AIInterviewCall.jsx`, `Frontend/src/pages/VideoCallInterviewDetail.jsx`
- Existing feature matrix: `FEATURES.md`
- Existing template flow: `TEMPLATE_FLOW.md`

