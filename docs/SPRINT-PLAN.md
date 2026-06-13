# PlacementOS — Sprint Plan

## Sprint Overview

```
Sprint  0:  Foundation       ✅  (Week 1)     Setup & ship skeleton
Sprint  1:  Identity         ✅  (Week 2)     Auth + Onboarding
Sprint  2:  Infrastructure   ✅  (Week 3)     BYOK + Dashboard + Settings
─────────────────────────────────────────  BUILD FREEZE 1 — usable product with auth
Sprint  3:  Resume Core      ✅  (Week 4)     Chat engine + builder canvas
Sprint  4:  Resume Sections     (Week 5)     All 6 sections + live preview
Sprint  5:  Resume Polish       (Week 6)     JD analyzer + ATS + PDF export
─────────────────────────────────────────  BUILD FREEZE 2 — ship Resume Builder
Sprint  6:  Interview Prep      (Week 7)     Mode select + pre-flight + MediaPipe
Sprint  7:  Interview Live      (Week 8)     Session screen + speech + scoring
Sprint  8:  Interview Ship      (Week 9)     Reports + JD mode + typed fallback
─────────────────────────────────────────  BUILD FREEZE 3 — ship Interview Coach
Sprint  9:  Roadmap Core        (Week 10)    Generation + timeline + week view
Sprint 10:  Roadmap Smart       (Week 11)    Adaptive engine + crunch + progress
─────────────────────────────────────────  BUILD FREEZE 4 — ship Roadmap
Sprint 11:  The Flywheel        (Week 12)    Skill Graph + cross-module sync
Sprint 12:  Launch Prep         (Week 13)    Testing, SEO, analytics, docs
─────────────────────────────────────────  SHIP v1 🚀
```

**Total: 13 Sprints = 13 weeks**

---

## Sprint 0 — Foundation (Week 1) ✅

**Theme:** Get the project standing on all three legs — Vercel, Supabase, Upstash — with CI/CD.

**Goal:** A developer can clone the repo, run `npm run dev`, see a blank Next.js app, and have Prisma migrations + first deploy working.

| Task | Hours | Details |
|---|---|---|
| 0.1 Scaffold Next.js 14 | 2 | `create-next-app` with TypeScript, Tailwind, App Router, ESLint |
| 0.2 Install core deps | 1 | Shadcn/ui init + all components, Zustand, TanStack Query, RHF, Zod, Framer Motion, Lucide |
| 0.3 Install infra deps | 1 | Prisma, Supabase client, Upstash Redis, Vercel AI SDK, AI provider SDKs |
| 0.4 Configure Tailwind | 1 | Extended theme: colors, fonts, spacing, animations from DESIGN-SYSTEM.md |
| 0.5 Set up Supabase project | 2 | Create project, get connection string, enable Auth (magic link + Google) |
| 0.6 Write Prisma schema | 4 | Full schema from DATA-ARCHITECTURE.md, run `prisma migrate dev` |
| 0.7 Set up Upstash Redis | 1 | Create Redis database, get REST URL + token, test basic read/write |
| 0.8 Write `.env.example` | 0.5 | All env vars documented with placeholder values |
| 0.9 Create project README | 1 | Setup instructions, architecture overview, links to docs |
| 0.10 Git init + first commit | 0.5 | `.gitignore`, initial commit to `main` |
| 0.11 Deploy to Vercel | 1 | Import repo, set env vars, verify deploy succeeds |
| 0.12 Set up GitHub Actions | 1 | `test.yml` workflow: lint, typecheck, test on PR |

**Definition of Done:**
- `npm run dev` starts the app on localhost:3000
- `npx prisma db push` creates all tables in Supabase
- Vercel deploy succeeds with a blank Next.js app
- GitHub Actions runs on PR (lint + typecheck)
- All env vars documented

**Dependencies:** None

---

## Sprint 1 — Identity (Week 2) ✅

**Theme:** Authentication + onboarding assessment + layout shell.

**Goal:** A user can sign up via magic link, complete the assessment, and land on a dashboard skeleton.

| Task | Hours | Details |
|---|---|---|
| 1.1 Root layout + providers | 2 | Wrap app with: QueryClient, Supabase listener, UI store provider |
| 1.2 Landing page | 4 | Hero, feature cards, CTA, footer — fully responsive |
| 1.3 Auth pages | 4 | `/login`, `/signup` — email input, magic link, Google OAuth button, error states |
| 1.4 Auth middleware | 2 | Protect `/dashboard/*` routes via middleware; redirect unauthenticated users |
| 1.5 Dashboard layout shell | 3 | Sidebar (240px) + header (64px) + main content area, responsive collapse |
| 1.6 Sidebar navigation | 2 | Links: Dashboard, Resume, Roadmap, Interview, Skills, Settings — active state |
| 1.7 Onboarding step 1 | 3 | Goal setting: role picker, company tier, timeline selector — form validation |
| 1.8 Onboarding step 2 | 3 | Skill check: role-specific questions, hours/day slider |
| 1.9 POST /api/onboarding | 2 | Save assessment to User table, create initial SkillGraphEntry rows |
| 1.10 Auth guard redirect | 1 | Authenticated users visiting `/login` → redirect to `/dashboard` |

**Definition of Done:**
- User signs up with email → receives magic link → clicks → authenticated
- User goes through onboarding steps 1-2 → data saved to Supabase
- Authenticated user sees sidebar with nav links
- Unauthenticated user redirected to `/login`
- Landing page shows on production URL

**Dependencies:** Sprint 0

---

## Sprint 2 — Infrastructure (Week 3) ✅

**Theme:** BYOK setup, trial quota, rate limiting, settings page, dashboard populated.

**Goal:** A user can paste their API key, see it validated, and see a dashboard with their readiness score (even if some cards are empty).

| Task | Hours | Details |
|---|---|---|
| 2.1 Onboarding step 3 (BYOK) | 4 | Provider selector with recommendations, key input field with format detection, validate button |
| 2.2 POST /api/ai/validate-key | 3 | Test call against provider, return valid/invalid/model name |
| 2.3 localStorage key storage | 2 | Encrypt key via Web Crypto API, save per provider, clear on logout |
| 2.4 Trial quota hooks | 2 | `useTrialQuota()` hook: check remaining, consume, show warning at low count |
| 2.5 Trial banner component | 1 | Header chip showing "Trial: 15/20" with upgrade CTA |
| 2.6 POST /api/ai/proxy (BYOK) | 4 | Generic proxy: extract key from header, create provider client, forward request, return response |
| 2.7 Rate limiter middleware | 3 | Upstash sliding window counter, per-endpoint limits from SECURITY.md |
| 2.8 Rate limit error component | 1 | 429 page with retry countdown and cool-down timer |
| 2.9 Settings page | 4 | Profile edit (name, college, degree), API key management (add/change/remove), provider switch |
| 2.10 Dashboard populated | 4 | Readiness score card (0 if no data), skill gaps card (empty state), upcoming tasks card (empty state) |
| 2.11 User menu dropdown | 1 | Avatar + name dropdown: Settings, Logout |

**Definition of Done:**
- User enters Groq key → validated → saved to localStorage encrypted
- Trial counter decrements on each AI call, shows remaining in header
- Rate limits enforced (429 returned when exceeded)
- Settings page shows profile + API key management
- Dashboard shows card layout with empty states
- Logout clears session + removes key from localStorage

**Dependencies:** Sprint 1

---

## Sprint 3 — Resume Core (Week 4) ✅

**Theme:** Resume list page, builder split-panel layout, AI chat engine.

**Goal:** A user can create a new resume, see the chat + preview panels, and have a conversation with the AI about their personal info and education.

| Task | Hours | Details |
|---|---|---|
| 3.1 Resume list page ✅ | 3 | `/resume` — card grid, create button, free tier limit display, empty state |
| 3.2 POST /api/resume ✅ | 2 | Create resume with default template, return with empty sections |
| 3.3 Resume builder layout ✅ | 4 | Split panel (40/60), resizable divider, section indicator bar |
| 3.4 AI chat panel ✅ | 4 | Message list (user + AI bubbles), streaming text display, input with send button |
| 3.5 Live preview panel ✅ | 3 | Template renderer (stub), updates as data fills, scrollable |
| 3.6 Section state machine ✅ | 3 | States: personal → education → skills → projects → experience → achievements → review |
| 3.7 /api/ai/chat endpoint ✅ | 6 | Full resume builder prompt, section context, BYOK proxy, SSE streaming |
| 3.8 Personal info extraction ✅ | 2 | Name, college, degree, grad year — AI probes, extracts, updates preview |
| 3.9 Education section ✅ | 2 | College details, GPA, coursework — AI extracts and structures |
| 3.10 Auto-save (debounced) ✅ | 3 | 30-second debounce on data change, "Saved" badge, network error retry |

**Definition of Done:**
- User creates resume → sees split-panel layout
- AI greets and asks about personal info
- User responds → AI extracts data → preview updates
- Education section works same way
- Auto-save shows "Saving..." → "Saved" badge
- Page refresh preserves conversation + data

**Dependencies:** Sprint 2 (BYOK proxies, trial, rate limiting)

---

## Sprint 4 — Resume Sections (Week 5)

**Theme:** All remaining resume sections — skills, projects, experience, achievements — with AI probing for impact metrics.

**Goal:** A user can complete a full conversation covering all sections and see their complete resume in the preview.

| Task | Hours | Details |
|---|---|---|
| 4.1 Skills section | 4 | AI: "List your skills" → categorizes into Languages/Frameworks/Databases/Tools/Cloud → preview updates |
| 4.2 JD cross-reference (skills) | 3 | If JD exists, ask "The JD mentions Node.js — do you have any experience?" |
| 4.3 Projects section (core) | 8 | AI probing loop: "What did you build?" → "What was the hardest part?" → "How many users?" → "What measurable impact?" → generates 3 bullets |
| 4.4 Experience section | 6 | Same probing pattern as projects: day-to-day → shipped outcomes → quantified impact |
| 4.5 Achievements section | 4 | AI asks about: CP ratings, hackathons, research papers, PoRs, open source |
| 4.6 Preview real-time update | 3 | Every extraction instantly renders in the preview panel |
| 4.7 Section completion indicators | 2 | Progress dots per section (●●●○○○), section navigation |
| 4.8 Resume store (Zustand) | 2 | Full state management: messages, sections, metadata, saving status |

**Definition of Done:**
- User can complete all 6 sections via conversation
- Skills are auto-categorized in the preview
- Projects have 3 bullets with measurable impact
- Preview shows complete resume after all sections
- Users can navigate between sections

**Dependencies:** Sprint 3 (chat engine + personal/education)

---

## Sprint 5 — Resume Polish (Week 6)

**Theme:** JD analyzer, ATS score engine, review step with before/after diff, PDF export.

**Goal:** A user can paste a JD, see keyword match, improve their ATS score, review AI-enhanced bullets, and download a PDF.

| Task | Hours | Details |
|---|---|---|
| 5.1 JD analyzer UI | 4 | Tab in builder, paste textarea, analyze button, keyword match cards |
| 5.2 POST /api/ai/analyze | 4 | JD → skill extraction, keyword matching against resume, suggestions |
| 5.3 ATS score engine (rule-based) | 6 | 4 dimensions: keyword (35%), format (20%), content (30%), readability (15%) |
| 5.4 ATS score display | 3 | Score ring, per-dimension bars, matched/missing keyword lists, suggestions |
| 5.5 Review step | 4 | All bullets shown with before/after, accept/reject/edit per bullet, inline edit mode |
| 5.6 3 resume templates | 6 | Classic, Modern, Technical — React-PDF components, ATS-safe (no images/tables) |
| 5.7 PDF export | 4 | Template selector modal, React-PDF rendering, download trigger, loading state |
| 5.8 Version history | 2 | Snapshot on significant changes, version list, restore previous version |
| 5.9 "Add missing skills to roadmap" | 2 | Button in JD analysis → creates skill graph entries → triggers roadmap recalc (soft) |

**Definition of Done:**
- Paste JD → analysis shows keyword match %, matched/missing lists, suggestions
- ATS score updates live as resume changes
- Review step shows before/after with accept/reject per bullet
- All 3 templates render correctly in PDF
- PDF downloads as ATS-safe single-column
- Missing skills can be pushed to roadmap

**Dependencies:** Sprint 4 (all sections complete)

---

## Sprint 6 — Interview Prep (Week 7)

**Theme:** Mode selection, pre-flight camera/mic check, MediaPipe face tracking.

**Goal:** A user can select an interview mode, pass the pre-flight check, and have their face tracked for eye contact.

| Task | Hours | Details |
|---|---|---|
| 6.1 Interview mode selection | 4 | 3 mode cards (Topic/Role/JD), session config (duration, persona), Pro gates |
| 6.2 POST /api/interview | 2 | Create session with config, return session ID |
| 6.3 Pre-flight check screen | 3 | Camera preview, mic test, permission handling, privacy notice |
| 6.4 MediaPipe Face Mesh setup | 6 | Install `@mediapipe/face_mesh`, WASM loading, face detection, eye landmark tracking |
| 6.5 Eye contact tracker | 4 | Calculate % time looking at camera vs away (check every 500ms) |
| 6.6 Camera denial fallback | 2 | "No camera" state → proceed with typed answers, no eye contact metrics |
| 6.7 Pre-flight "all good" flow | 2 | Visual checkmarks, "Start Interview" button, transition to session |
| 6.8 Interview store (Zustand) | 2 | Session state: questions, answers, metrics, timer |

**Definition of Done:**
- User selects Topic mode → configures duration → sees pre-flight screen
- Camera shows preview with face detection overlay
- Face mesh detects when user looks at camera vs away
- Pre-flight shows "Face detected ✅ | Mic level good ✅"
- No camera → typed mode with clear message
- "Start Interview" → navigates to session page

**Dependencies:** Sprint 2 (BYOK, trial, rate limiting)

---

## Sprint 7 — Interview Live (Week 8)

**Theme:** Live interview screen, question bank, speech-to-text, answer scoring, adaptive difficulty.

**Goal:** A user can take a full AI-conducted interview with real-time metrics and adaptive questioning.

| Task | Hours | Details |
|---|---|---|
| 7.1 Live session layout | 4 | Webcam (small, top-left), metrics sidebar, question + captions center, controls bottom |
| 7.2 Web Speech API integration | 4 | Real-time speech-to-text, filler word detection ("um", "uh", "basically", etc.) |
| 7.3 Web Audio API pace analysis | 3 | WPM calculation from transcript timing, flag if <110 or >170 WPM |
| 7.4 Question bank (seed) | 6 | 300 DSA questions, 50 System Design, 90 Core CS, 40 Behavioral |
| 7.5 Question selection logic | 3 | Random selection weighted by difficulty, no repeats in session |
| 7.6 POST /api/ai/score | 6 | Score answer on correctness/depth/structure, generate follow-up |
| 7.7 Answer scoring integration | 3 | Display score briefly, update question counter, adapt next difficulty |
| 7.8 Adaptive difficulty logic | 4 | If score ≥4 → harder next question; if ≤2 → hint question; track per-topic |
| 7.9 Session timer | 2 | Countdown, auto-end at 0, "5 minutes remaining" warning |
| 7.10 "I need a moment" | 1 | 30s pause, timer pause, resume button |

**Definition of Done:**
- Live session shows question → student speaks → captions appear → "I'm done" → next question
- Filler words counted and displayed
- Speech pace displayed as WPM
- AI scores each answer, adapts next question difficulty
- Eye contact % updates in sidebar
- Timer counts down, auto-ends session
- "I need a moment" pauses everything for 30s

**Dependencies:** Sprint 6 (pre-flight + MediaPipe)

---

## Sprint 8 — Interview Ship (Week 9)

**Theme:** Coaching reports, typed fallback mode, JD mode, end-to-end polish.

**Goal:** A user completes an interview and sees a full coaching report. Firefox users can type answers. JD mode generates company-specific interviews.

| Task | Hours | Details |
|---|---|---|
| 8.1 POST /api/ai/generate-report | 6 | Full report generation: overall score, per-question, communication, top 3 weaknesses |
| 8.2 Report page | 6 | Score ring (0-100), per-question breakdown (star ratings), communication metrics with gauges |
| 8.3 Communication metrics display | 3 | Eye contact %, WPM gauge, filler word list with timeline, confidence score |
| 8.4 Top 3 weaknesses + drills | 2 | Specific, actionable improvement suggestions with practice drills |
| 8.5 Comparison to previous session | 2 | Trend arrows: ↑ +5%, ↓ -2%, "First session" if no history |
| 8.6 Typed answer fallback | 4 | Text input replaces mic, enter to submit, no communication metrics |
| 8.7 JD mode | 4 | JD → AI generates tailored questions → session proceeds normally |
| 8.8 Report actions | 2 | [Retry] [Update Roadmap] [Share Report] — all functional |
| 8.9 End-to-end flow test | 3 | Full session: pre-flight → 6 questions → report → actions work |

**Definition of Done:**
- Completed interview → report with overall score, per-question breakdown, communication metrics
- Firefox users can complete typed interview (no mic/cam)
- JD mode generates relevant questions from pasted job description
- "Update Roadmap" triggers recalc with weak areas
- Comparison shows improvement trend
- All edge cases handled (mid-session refresh, disconnected, etc.)

**Dependencies:** Sprint 7 (live session + scoring)

---

## Sprint 9 — Roadmap Core (Week 10)

**Theme:** Roadmap generation from assessment data, timeline view, week view, task check-off.

**Goal:** A user sees their personalized roadmap with phases, weeks, daily tasks, and can check off completed work.

| Task | Hours | Details |
|---|---|---|
| 9.1 POST /api/ai/roadmap (generate) | 6 | Assessment data → AI generates phases/weeks/tasks with resources |
| 9.2 POST /api/roadmap | 2 | Save generated roadmap to DB, return ID |
| 9.3 Roadmap page layout | 3 | Phase timeline bar, week list, "Today's Plan" sticky card |
| 9.4 Phase progress visualization | 3 | Progress bars per phase (Foundation/Building/Placement) |
| 9.5 Week view (expanded) | 4 | Day-by-day breakdown, task cards with resource links, estimated hours |
| 9.6 Task card component | 3 | Title, resource link (new tab), hours, status indicator, checkbox |
| 9.7 Task check-off flow | 3 | Checkbox → micro-celebration → progress update → Skill Graph confidence + |
| 9.8 Resource curation (seed 50) | 4 | Hard-code 50 resources: DSA playlists, System Design articles, Core CS videos |
| 9.9 PATCH /api/roadmap | 2 | Update progress, task statuses, week completion |
| 9.10 Empty/generating states | 2 | Loading skeleton, "Complete assessment" prompt, generation progress |

**Definition of Done:**
- Completed assessment → roadmap generated with 3 phases
- Phase bars show progress percentage
- Week view shows daily tasks with resources and time estimates
- Checking a task updates progress, shows micro-feedback
- "Today's Plan" shows current day's tasks
- Refresh preserves roadmap data

**Dependencies:** Sprint 1 (assessment data), Sprint 2 (BYOK for AI generation)

---

## Sprint 10 — Roadmap Smart (Week 11)

**Theme:** Adaptive engine, crunch mode, progress dashboard.

**Goal:** The roadmap automatically adjusts based on interview performance and deadline proximity.

| Task | Hours | Details |
|---|---|---|
| 10.1 Soft recalc trigger | 3 | Reprioritize existing tasks when skills update (resume/JD/interview) |
| 10.2 POST /api/ai/roadmap (recalculate) | 6 | AI regenerates remaining weeks based on latest skill graph + progress |
| 10.3 Recalc banner | 2 | "Your roadmap was updated because: [reason]" — dismissible |
| 10.4 "Behind schedule" detection | 3 | Compare completed tasks vs planned, flag if >20% behind |
| 10.5 Manual recalculate button | 1 | "Recalculate" button in header, confirmation, loading state |
| 10.6 Crunch mode | 4 | Auto-activates at 3 weeks to deadline: high-frequency topics only, daily mocks |
| 10.7 Progress dashboard | 4 | Topics mastered count, mocks done, average score, projected ready date vs deadline |
| 10.8 Weak areas display | 2 | Top 3 weakest skills (from interview data), deep-link to each |
| 10.9 Task snooze + lock | 3 | Snooze: push to next week; Lock: don't reschedule this task |
| 10.10 Weekly drift check | 2 | Every Monday: check ahead/behind, auto-trigger soft recalc if >1 week drift |

**Definition of Done:**
- Interview weak areas → roadmap recalculates (weak topics moved earlier)
- Recalc banner appears with reason
- Behind schedule → yellow warning + recalc button
- 3 weeks to deadline → crunch mode activates
- Progress dashboard shows accurate metrics
- Tasks can be snoozed or locked
- Weekly auto-check runs

**Dependencies:** Sprint 9 (roadmap core), Sprint 8 (interview reports for recalc)

---

## Sprint 11 — The Flywheel (Week 12)

**Theme:** Skill Graph connecting all modules, readiness score, cross-module sync.

**Goal:** Resume changes, interview results, and roadmap completions all influence each other. The dashboard accurately answers "Am I ready?"

| Task | Hours | Details |
|---|---|---|
| 11.1 Skill Graph schema implementation | 4 | Seed skill nodes (50+), graph traversal, prerequisite resolution |
| 11.2 Resume → Skill Graph sync | 3 | When resume skills updated → upsert SkillGraphEntry with confidence |
| 11.3 Interview → Skill Graph sync | 3 | Per-question scores → update confidence, flag weak areas for recalc |
| 11.4 Roadmap → Skill Graph sync | 3 | Task completion → confidence +0.05, lastPracticed updated |
| 11.5 JD → Skill Graph sync | 2 | Missing skills added as nodes with low confidence |
| 11.6 Readiness score composite | 4 | Weighted: Resume ATS (20%) + Roadmap progress (30%) + Interview avg (30%) + Skill coverage (20%) |
| 11.7 Dashboard finalization | 4 | All cards wired to real data: resume score, roadmap progress, interview trend, skill gaps |
| 11.8 "Top 3 things to work on" | 3 | Algorithm: lowest confidence skill in most frequently interviewed topic |
| 11.9 Cross-module event bus | 3 | Typed events: `resume.updated`, `interview.completed`, `roadmap.task_done` → subscribers react |
| 11.10 End-to-end flywheel test | 4 | Create resume → skills appear in graph → take interview → weak areas update roadmap → complete task → interview difficulty scales |

**Definition of Done:**
- Resume skills → Skill Graph confidence updates
- Interview weaknesses → roadmap recalculates
- Roadmap completions → interview difficulty scales up
- Readiness score responds to all three modules
- Dashboard shows accurate, live data from all sources
- "Top 3 things to work on" matches actual skill gaps

**Dependencies:** Sprint 5 (resume), Sprint 8 (interview), Sprint 10 (roadmap)

---

## Sprint 12 — Launch Prep (Week 13)

**Theme:** Testing, bug fixes, SEO, analytics, documentation, production hardening.

**Goal:** Ship a production-quality v1 that real students can use reliably.

| Task | Hours | Details |
|---|---|---|
| 12.1 E2E test suite | 8 | Playwright: auth → onboarding → resume → interview → roadmap (critical path) |
| 12.2 Manual QA pass | 4 | All pages, all states, Chrome + Edge + Firefox |
| 12.3 Bug fixes from QA | 8 | Priority P0/P1 bugs only |
| 12.4 Performance optimization | 4 | Lighthouse audit, bundle size, image optimization, code splitting |
| 12.5 SEO | 3 | Meta tags, OG image, sitemap.xml, robots.txt |
| 12.6 Analytics events | 3 | Supabase analytics_events table, key events instrumented |
| 12.7 Privacy policy + ToS pages | 3 | Standard templates customized for the app |
| 12.8 Load test | 2 | 10 concurrent users hitting AI + CRUD endpoints |
| 12.9 Production env check | 2 | Verify all env vars set, RLS policies applied, rate limiting active |
| 12.10 Marketing page final pass | 2 | Landing page copy review, CTA clarity, mobile responsiveness |
| 12.11 Launch checklist sign-off | 1 | All items from DEPLOYMENT.md verified |
| 12.12 Ship v1 🚀 | — | Merge to main, deploy to production, announce |

**Definition of Done:**
- All critical E2E tests pass
- Lighthouse scores >90 (Performance), >95 (Accessibility)
- Privacy policy + Terms of Service live
- Analytics tracking key events
- Production env fully configured
- V1 is live at placementos.app (or your domain)

**Dependencies:** Sprint 11 (flywheel complete)

---

## Sprint Dependency Graph

```
Sprint 0 (Foundation)
   └── Sprint 1 (Identity) ──┐
        └── Sprint 2 (Infra) ─┤
             ├── Sprint 3 (Resume Core) ──┐
             │    └── Sprint 4 (Sections) ─┤
             │         └── Sprint 5 (Polish) ─┐
             │                                │
             ├── Sprint 6 (Interview Prep) ──┤
             │    └── Sprint 7 (Live Sesh) ──┤
             │         └── Sprint 8 (Ship) ──┐
             │                                │
             └── Sprint 9 (Roadmap Core) ────┤
                  └── Sprint 10 (Smart) ─────┐
                                              │
                             Sprint 11 (Flywheel) ◄── all three
                                  │
                             Sprint 12 (Launch)
```

**Parallelizable paths** (if you have multiple developers):
- Resume track (Sprint 3-5) and Interview track (Sprint 6-8) can run in parallel after Sprint 2
- Roadmap track (Sprint 9-10) depends on Sprint 1 (assessment) but not on Resume/Interview details

---

## Sprint 0 Details — Quick Start

This is the only sprint with all tasks specified. For detailed task specs beyond Sprint 0, reference:
- **PRD.md** — feature behavior and user-facing requirements
- **TRD.md** — technical implementation details per component
- **DATA-ARCHITECTURE.md** — exact Prisma schema and API spec
- **AI-ARCHITECTURE.md** — prompt templates and provider setup
- **UX-FLOW.md** — exact screen layouts and state transitions

**Sprint 0 day-by-day (recommended pace):**

```
Mon:  0.1 + 0.2 + 0.4  (scaffold + deps + tailwind)    5h
Tue:  0.5 + 0.3 + 0.6  (Supabase + infra deps + schema)  7h
Wed:  0.7 + 0.8 + 0.9  (Upstash + env + README)          3h
Thu:  0.10 + 0.11      (git + Vercel deploy)              2h
Fri:  0.12             (GitHub Actions)                    1h
     ─────────────────────────────────────────────
     Total: ~18 hours
```
