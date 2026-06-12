# PlacementOS — Technical Requirements Document

## 1. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (Client)                   │
│                                                      │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Next.js │  │  Zustand  │  │  Browser APIs     │  │
│  │  App    │  │  (UI)     │  │  ┌─────────────┐  │  │
│  │  Router │  │          │  │  │ MediaPipe    │  │  │
│  │         │  │ TanStack │  │  │ Web Speech   │  │  │
│  │ Shadcn  │  │  Query   │  │  │ Web Audio    │  │  │
│  │ /ui     │  │ (Server) │  │  │ @react-pdf   │  │  │
│  └─────────┘  └──────────┘  │  └─────────────┘  │  │
│                              └───────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Vercel)             │
│                                                      │
│  ┌────────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ AI Proxy   │  │ Resume   │  │ Interview     │   │
│  │ (BYOK)     │  │ CRUD     │  │ Session CRUD  │   │
│  ├────────────┤  ├──────────┤  ├───────────────┤   │
│  │ Roadmap    │  │ Auth     │  │ Trial Quota   │   │
│  │ Engine     │  │ (validate)│  │ Check         │   │
│  └────────────┘  └──────────┘  └───────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Vercel AI SDK (provider-agnostic)            │   │
│  │ Streams responses, handles retry/error       │   │
│  └──────────────────────────────────────────────┘   │
└────────┬──────────┬─────────────────────────────────┘
         │          │
         ▼          ▼
┌────────────┐  ┌────────────┐
│  Supabase  │  │  Upstash   │
│  (Postgres │  │  Redis     │
│  + Auth +  │  │  (Rate     │
│  Storage)  │  │  Limit +   │
│            │  │  Cache)    │
└────────────┘  └────────────┘
```

### Key Architectural Decisions

1. **Monolith first** — Single Next.js app. No separate backend. When/if webcam analysis gets complex, extract to worker. Until then, Next.js API routes handle everything.

2. **BYOK proxy pattern** — Student's API key is sent per-request as a header (`x-api-key`). The API route extracts it, injects into the AI provider client, and streams the response. **The key is never stored in the database, never logged, never persisted server-side.**

3. **Client-side processing for interviews** — MediaPipe Face Mesh, Web Speech API, and Web Audio API all run in the browser. Zero server cost for compute-intensive operations.

4. **Client-side PDF generation** — `@react-pdf/renderer` renders resumes in the browser. No server rendering cost.

---

## 2. Tech Stack (Justified)

### 2.1 Frontend

| Technology | Version | Purpose | Why It's the Best Free Option |
|---|---|---|---|
| **Next.js** | 14 (App Router) | Framework | Best SSR React framework; file-based routing; API routes built-in; free on Vercel |
| **TypeScript** | 5.x | Language | Type safety, better DX, catches bugs at compile time |
| **Tailwind CSS** | 3.x | Styling | Fastest way to build consistent UI; zero-cost; utility-first |
| **Shadcn/ui** | Latest | Component primitives | Copy-paste components on Radix UI; full control; no dependency cost |
| **Framer Motion** | 11.x | Animations | Best React animation library; generous free tier; students notice polish |
| **Zustand** | 4.x | Client state | 1KB bundle; simpler than Redux; TypeScript-native |
| **TanStack Query** | 5.x | Server state | Automatic caching, retry, pagination; industry standard |
| **React Hook Form** | 7.x | Forms | Performant (uncontrolled inputs); minimal re-renders |
| **Zod** | 3.x | Validation | Best TypeScript validation; inferred types; composable schemas |
| **@react-pdf/renderer** | 4.x | PDF generation | Client-side render; full layout control; zero server cost |
| **MediaPipe Face Mesh** | Via `@mediapipe/face_mesh` | Face tracking | WASM-based; on-device; free; actively maintained |

### 2.2 Backend / Infrastructure

| Technology | Purpose | Free Tier Limits | Why |
|---|---|---|---|
| **Next.js API Routes** | Backend logic | 100GB bandwidth, 6000 build min/mo | No separate backend needed; co-located with frontend |
| **Supabase** | DB + Auth + Storage | 500MB DB, 50k users, 2GB storage | Best BaaS free tier; PostgreSQL; built-in auth; real-time |
| **Prisma** | ORM | Free & open source | Auto-generated types; migration system; best TS ORM |
| **Upstash Redis** | Rate limiting + session cache | 10k commands/day, 256MB | Serverless-native; REST API; no persistent connection needed |
| **Vercel AI SDK** | AI integration | Free | Provider-agnostic; streaming built-in; retry/error handling |
| **Vercel (Hosting)** | Deployment | 100GB bandwidth, 6000 build min/mo | One-click deploy from GitHub; edge functions; zero config |
| **Cloudflare** | DNS + CDN + DDoS | Free | Fast DNS; global CDN; DDoS protection |

### 2.3 AI Providers (Student's Key)

| Provider | Free Tier Model | Why Include |
|---|---|---|
| **Groq** | Llama 3.3 70B (fast, generous rate limits) | Primary recommendation: fastest inference, most generous free tier |
| **OpenRouter** | Multiple free models (Mistral, Gemma, DeepSeek) | Fallback: variety of models, good quality |
| **Gemini (Google AI Studio)** | Gemini 2.0 Flash (60 req/min free) | Fallback: Google quality, good for analysis tasks |

---

## 3. Directory Structure

```
placement-os/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, providers
│   │   ├── page.tsx                      # Landing page
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── callback/                 # OAuth callback
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # Dashboard layout + sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── onboarding/
│   │   │   │   ├── page.tsx             # Multi-step wizard
│   │   │   │   └── steps/
│   │   │   ├── resume/
│   │   │   │   ├── page.tsx             # Resume list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Resume builder workspace
│   │   │   ├── roadmap/
│   │   │   │   └── page.tsx
│   │   │   ├── interview/
│   │   │   │   ├── page.tsx             # Mode selection
│   │   │   │   ├── session/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Live interview
│   │   │   │   └── report/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx     # Coaching report
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── ai/
│   │       │   ├── chat/route.ts        # Resume builder conversation
│   │       │   ├── analyze/route.ts     # JD analysis
│   │       │   ├── score/route.ts       # Interview answer scoring
│   │       │   ├── roadmap/route.ts     # Roadmap generation/recalc
│   │       │   └── validate-key/route.ts # Test student's API key
│   │       ├── resume/route.ts          # Resume CRUD
│   │       ├── interview/route.ts       # Interview sessions
│   │       ├── roadmap/route.ts         # Roadmap CRUD
│   │       └── trial/route.ts           # Trial quota management
│   │
│   ├── components/
│   │   ├── ui/                          # Shadcn/ui components
│   │   ├── resume/
│   │   │   ├── chat-panel.tsx
│   │   │   ├── preview-panel.tsx
│   │   │   ├── ats-score.tsx
│   │   │   ├── jd-analyzer.tsx
│   │   │   └── templates/
│   │   ├── interview/
│   │   │   ├── mode-selector.tsx
│   │   │   ├── preflight-check.tsx
│   │   │   ├── live-session.tsx
│   │   │   ├── metrics-sidebar.tsx
│   │   │   ├── eye-contact-tracker.tsx
│   │   │   ├── filler-detector.tsx
│   │   │   └── report-view.tsx
│   │   ├── roadmap/
│   │   │   ├── timeline-view.tsx
│   │   │   ├── week-view.tsx
│   │   │   ├── task-card.tsx
│   │   │   └── progress-dashboard.tsx
│   │   ├── dashboard/
│   │   │   ├── readiness-score.tsx
│   │   │   ├── skill-gaps.tsx
│   │   │   └── upcoming-tasks.tsx
│   │   └── shared/
│   │       ├── providers.tsx            # All providers wrapper
│   │       ├── auth-guard.tsx
│   │       ├── trial-banner.tsx
│   │       └── api-key-setup.tsx
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── provider.ts             # Provider factory (Groq/OpenRouter/Gemini)
│   │   │   ├── prompts.ts              # All prompt templates
│   │   │   └── models.ts               # Model config per provider
│   │   ├── db/
│   │   │   └── client.ts               # Prisma client singleton
│   │   ├── rate-limit.ts               # Upstash rate limiter
│   │   ├── trial.ts                     # Trial quota logic
│   │   └── utils.ts                     # Shared utilities
│   │
│   ├── hooks/
│   │   ├── use-resume-chat.ts
│   │   ├── use-interview-session.ts
│   │   ├── use-webcam.ts
│   │   ├── use-speech-recognition.ts
│   │   ├── use-eye-contact.ts
│   │   └── use-roadmap.ts
│   │
│   ├── store/
│   │   ├── resume-store.ts
│   │   ├── interview-store.ts
│   │   └── ui-store.ts
│   │
│   └── types/
│       ├── resume.ts
│       ├── interview.ts
│       ├── roadmap.ts
│       └── skill-graph.ts
│
├── .env.local                           # Local env vars
├── .env.example                         # Template
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. API Route Design

### 4.1 AI Routes

#### `POST /api/ai/chat`
**Purpose:** Resume builder conversational AI
**Request:**
```json
{
  "section": "projects",
  "message": "I built a food delivery app",
  "resumeState": { /* current resume JSON */ }
}
```
**Headers:** `x-api-key: <student-key>`, `x-provider: groq|openrouter|gemini`
**Response:** Server-Sent Events (streaming)
**Rate limit:** 30 req/min per user

#### `POST /api/ai/analyze`
**Purpose:** JD analysis + keyword extraction
**Request:**
```json
{
  "jd": "We are looking for...",
  "resume": { /* current resume sections */ }
}
```
**Response:** JSON
```json
{
  "requiredSkills": ["Python", "React", ...],
  "matchedSkills": ["Python", "React"],
  "missingSkills": ["Docker"],
  "keywords": ["full-stack", "agile", ...],
  "matchScore": 72,
  "suggestions": ["Add Node.js experience", "Mention CI/CD"]
}
```

#### `POST /api/ai/score`
**Purpose:** Score an interview answer
**Request:**
```json
{
  "question": "Explain database indexing",
  "answer": "It's like a book index...",
  "difficulty": "medium",
  "topic": "dbms"
}
```
**Response:** JSON
```json
{
  "correctness": 4,
  "depth": 3,
  "structure": 5,
  "feedback": "Good analogy. Missed B-tree vs hash discussion.",
  "followUp": "What happens with a composite index?"
}
```

#### `POST /api/ai/roadmap`
**Purpose:** Generate or recalculate roadmap
**Request:**
```json
{
  "action": "generate" | "recalculate",
  "assessment": { /* assessment answers */ },
  "skillGraph": { /* current skill states */ },
  "reason": "initial" | "interview" | "jd_gaps"
}
```
**Response:** JSON (the full roadmap weeks)

#### `POST /api/ai/validate-key`
**Purpose:** Test if the student's API key is valid
**Headers:** `x-api-key: <student-key>`, `x-provider: groq|openrouter|gemini`
**Response:** `{ "valid": true, "model": "llama-3.3-70b" }`

### 4.2 CRUD Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/resume` | GET | List user's resumes |
| `/api/resume` | POST | Create new resume |
| `/api/resume/[id]` | GET | Get resume with version |
| `/api/resume/[id]` | PATCH | Update resume |
| `/api/resume/[id]` | DELETE | Delete resume |
| `/api/interview` | GET | List sessions |
| `/api/interview` | POST | Create session |
| `/api/interview/[id]` | GET | Get session + report |
| `/api/interview/[id]` | PATCH | Update (metrics, scores) |
| `/api/roadmap` | GET | Get user's roadmap |
| `/api/roadmap` | POST | Create/generate |
| `/api/roadmap/[id]` | PATCH | Update progress |
| `/api/trial` | GET | Check remaining quota |
| `/api/trial` | POST | Consume quota |

---

## 5. State Management Strategy

### 5.1 Zustand Stores

**UI Store:**
```typescript
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light';
  activeModal: string | null;
  toasts: Toast[];
}
```

**Resume Store:**
```typescript
interface ResumeStore {
  currentSection: ChatSection;
  messages: Message[];
  resumeData: ResumeData;
  isSaving: boolean;
  lastSaved: Date | null;
}
```

### 5.2 TanStack Query (Server State)

All API data goes through TanStack Query:
- Resume list + individual resumes
- Interview sessions + reports
- Roadmap + progress
- Trial quota

**Cache invalidation:** After interview → invalidate roadmap + skill graph. After resume edit → invalidate ATS score.

---

## 6. Data Flow Diagrams

### 6.1 Resume Builder Flow

```
User types message
  → Zustand (optimistic update chat UI)
  → POST /api/ai/chat (streaming)
  → Server:
      1. Check auth (Supabase session)
      2. Check trial quota (if no BYOK key)
      3. Forward to AI provider via Vercel AI SDK
      4. Stream response
  → Client:
      1. Parse streaming response
      2. Extract structured resume data (if AI generates it)
      3. Update live preview
      4. Auto-save to Supabase (debounced 30s)
```

### 6.2 Interview Session Flow

```
User starts session
  → Pre-flight check (camera, mic, face detection)
  → POST /api/interview (create session)
  → Loop:
      1. AI asks question (from question bank or generated)
      2. User answers (speech-to-text or typed)
      3. Client-side metrics update (fillers, eye contact, pace)
      4. POST /api/ai/score (score the answer)
      5. AI adapts next question based on score
  → End session
  → POST /api/ai/score (generate full report)
  → PATCH /api/interview/[id] (save metrics + report)
  → PATCH /api/roadmap (trigger recalc if weak areas found)
```

### 6.3 BYOK Proxy Flow

```
Student enters key in settings
  → Key stored in localStorage (never sent to server)
  → On AI request:
      1. Client reads key from localStorage
      2. Sends as x-api-key header (HTTPS encrypted in transit)
      3. Server:
          a. Validates key format
          b. Checks rate limit (Upstash)
          c. Checks trial quota if no key
          d. Creates AI provider client with key
          e. Executes request
          f. Returns response
          g. Key is garbage-collected (never stored)
      4. Client receives response
```

---

## 7. AI Integration Details

### 7.1 Provider Factory

```typescript
// src/lib/ai/provider.ts

import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

type Provider = 'groq' | 'openrouter' | 'gemini';

function getProvider(provider: Provider, apiKey: string) {
  switch (provider) {
    case 'groq':
      return createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey,
      });
    case 'openrouter':
      return createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
      });
    case 'gemini':
      return createGoogleGenerativeAI({ apiKey });
  }
}

// Model configuration per provider
const MODEL_CONFIG = {
  groq: { model: 'llama-3.3-70b-versatile', temperature: 0.7 },
  openrouter: { model: 'mistralai/mixtral-8x22b-instruct', temperature: 0.7 },
  gemini: { model: 'gemini-2.0-flash', temperature: 0.7 },
};
```

### 7.2 Streaming Architecture

All AI chat responses use Server-Sent Events (SSE) via Vercel AI SDK's `streamText`. This gives:
- Real-time token-by-token display (student sees AI "typing")
- Abort support (student can stop generation)
- Built-in retry with exponential backoff

### 7.3 Prompt Templates

Prompts are stored in `src/lib/ai/prompts.ts` and organized by feature. Each prompt:
- Uses template literals with structured sections
- Includes system context + conversation history
- Forces JSON output where needed (via `response_format: { type: 'json_object' }`)

**Example: Resume Builder System Prompt:**
```
You are PlacementOS AI, a resume building assistant for college students.

Current section: {section}
Resume so far: {resumeState}

Rules:
1. Ask one question at a time
2. Extract structured data from responses
3. Probe for measurable impact (numbers, % improvements)
4. Categorize skills automatically
5. Cross-reference with JD if available
6. Format bullets as: Action Verb + Task + Measurable Impact
7. Keep responses under 3 sentences. Be concise.
```

---

## 8. Performance Budget

| Asset | Budget | Notes |
|---|---|---|
| **First Contentful Paint** | <1.5s | SSR pages (landing, auth) |
| **Time to Interactive** | <3s | Dashboard after auth |
| **Lighthouse Performance** | >90 | All pages |
| **Lighthouse Accessibility** | >95 | All pages |
| **JS bundle (initial)** | <150KB | Excluding framework |
| **AI response latency** | <3s first token | On Groq (fastest provider) |
| **Resume PDF export** | <2s | Client-side render |
| **Face tracking rate** | >15fps | MediaPipe on modern laptops |

---

## 9. Error Handling Strategy

### 9.1 AI Error Handling

```
AI Request
  ├── 200 → Return response
  ├── 401 (invalid key) → "Your API key seems invalid. Check it in Settings."
  ├── 429 (rate limited) → "You're being rate limited. Wait a moment and try again."
  ├── 500 (provider down) → "Groq seems down. Try a different provider or try again later."
  └── Timeout (>15s) → "The AI is taking longer than expected. Try again."
```

### 9.2 Non-AI Fallbacks

| Feature | AI Mode | Fallback Mode |
|---|---|---|
| Resume Builder | Chat-driven editing | Manual form editing (all fields) |
| ATS Score | AI analysis | Rule-based scoring (structure only) |
| Interview Questions | AI-generated | Static question bank |
| Answer Scoring | AI evaluation | Self-evaluation (student rates own answer) |
| Roadmap Generation | AI-planned | Template-based from assessment config |

### 9.3 Graceful Degradation Hierarchy

1. **With valid BYOK key** → Full AI features
2. **With trial quota remaining** → Limited AI features (max 20 requests total)
3. **No key + no quota** → All manual/fallback modes work; AI features show "Add your API key" CTA
4. **Offline** → Cached resume data; interview can't start (needs API); roadmap viewable from cache

---

## 10. Testing Strategy

### 10.1 Unit Tests (Vitest)

- All utility functions
- AI prompt construction (snapshot testing)
- State store logic
- Data transformation helpers

### 10.2 Integration Tests (Vitest + MSW)

- API route handlers (mock AI provider)
- Database CRUD operations (test Supabase via Prisma)
- Rate limiter logic

### 10.3 E2E Tests (Playwright)

- Auth flow (signup → magic link → dashboard)
- Onboarding flow (assessment → BYOK setup → dashboard populated)
- Resume builder (chat interaction → preview updates → PDF export)
- Interview session (pre-flight → Q&A loop → report generated)
- Roadmap (generation → task check-off → progress update)

### 10.4 Manual QA Checklist

- Chrome, Edge, Firefox (typed fallback mode for Firefox)
- Desktop only (no mobile testing for v1)
- Slow network (3G throttling)
- API key rotation (revoke → re-enter)
- Trial quota exhaustion mid-session
- Multiple browser tabs (Supabase real-time sync)
