# PlacementOS — Product Requirements Document

## 1. Vision

PlacementOS is an AI-powered career operating system for college students preparing for placements. A student arrives confused and leaves with an ATS-optimized resume, a personalized placement roadmap, AI mock interview practice, and continuous skill tracking — all in **one connected system**.

Built by students, powered by AI (at zero infrastructure cost), designed for the Indian placement ecosystem.

---

## 2. Problem Statement

Students preparing for placements today juggle disconnected tools:

- **Resume builders** that don't know their actual skill level
- **Generic prep roadmaps** that ignore their timeline and target companies
- **Mock interview platforms** that never update their study plan
- **No single answer to "Am I ready?"**

**Result:** wasted time, generic resumes, unfocused prep, interview anxiety.

PlacementOS solves this by connecting three core modules through a shared Skill Graph — every resume edit, interview session, and roadmap task makes the system smarter and more personalized.

---

## 3. Target Users

| Persona | Description | Primary Need |
|---|---|---|
| **Final-year student** | 3-6 months from placements, moderate skills | Focused roadmap + interview practice |
| **Pre-final-year student** | 1+ year runway, building fundamentals | Long-term roadmap + skill tracking |
| **Late starter** | Weeks from placement season, panicking | Triage: resume fast, drill weak areas |
| **TPO (Training & Placement Officer)** | Needs batch-level visibility | Institution dashboard with anonymous analytics |

---

## 4. Success Metrics

| Metric | Target | Why |
|---|---|---|
| **Activation rate** | >60% of signups complete assessment + first resume draft within 48h | Core value prop proof |
| **Weekly active roadmap completion** | >50% of assigned tasks checked off | Engagement signal |
| **ATS score improvement** | Average +15 points from first to last resume edit | Resume builder quality |
| **Interview score trend** | Average +20% improvement over 5 sessions | Interview coach efficacy |
| **Week-4 retention** | >40% of activated users still active | Product-market fit signal |
| **BYOK conversion** | >70% of users bring their own key after trial | Cost sustainability |

---

## 5. Feature Specifications

### 5.1 AI Resume Builder

**Priority: P0 (build first)**

#### 5.1.1 Intent Setting

On entry, the student selects one of:
- **Specific Job/Internship** → paste JD
- **General Placement Season** → pick target role (SDE / Data Analyst / Business Analyst / Consultant / Core Engineering / Finance / Product Manager)
- **Hackathon / Research Application**

#### 5.1.2 JD Parser (if JD provided)

AI extracts and displays:
- Required technical skills
- Preferred skills
- Role responsibilities
- Keywords that must appear in resume
- Match score: matched / weak / missing

#### 5.1.3 Conversational Profile Builder

Not a form — a structured conversation. The AI guides the student through sections in order:

**Personal Info** → Name, college, degree, graduation year
**Skills** → Brain dump, AI categorizes (Languages / Frameworks / Databases / Tools / Cloud) + cross-references JD for gaps
**Projects** (most important) → AI probes for: tech stack, challenges faced, measurable impact, team size. Loop continues until 3 strong bullets per project.
**Experience/Internships** → Day-to-day work, shipped outcomes, quantified impact
**Achievements** → CP ratings, hackathons, research papers, PoRs, open source — things students forget but ATS loves

Each extraction updates the live preview instantly.

#### 5.1.4 Review Step

AI rewrites all bullets professionally. Before/after diff shown. User accepts per-bullet or manually edits.

#### 5.1.5 ATS Score Engine

Score breakdown (computed on JSON structure, not rendered PDF):

| Component | Weight | Checks |
|---|---|---|
| **Keyword Match** | 35% | Found/missing from JD, suggestions |
| **Format Score** | 20% | No tables, no columns, standard fonts, proper headings |
| **Content Quality** | 30% | Metrics present, action verbs, bullet strength |
| **Readability** | 15% | Consistent dates, no spelling errors, section hierarchy |

#### 5.1.6 Templates

Exactly 3 templates:

1. **Classic** — Single column, traditional, safe everywhere
2. **Modern** — Subtle left accent, better typography, still ATS-safe
3. **Technical** — SDE-focused: skills prominent, project-first order

All three: no images, no icons in the ATS-safe version. Optional "Visual" toggle for human-review submissions.

#### 5.1.7 Data Persistence

- Auto-saves every 30 seconds (debounced)
- Multiple named versions per user (e.g., "Goldman Sachs Application", "General SDE")
- Version history (snapshots on significant changes)
- Editing one version doesn't affect others

#### 5.1.8 PDF Export

- Generated client-side via `@react-pdf/renderer`
- ATS-safe output: single column, standard fonts (Inter/Noto Sans), no images/tables
- Download directly from browser

---

### 5.2 AI Interview Coach

**Priority: P1 (build second)**

#### 5.2.1 Mode Selection

Three modes:

1. **Topic Mode** — Pick topic (DSA / System Design / OS / DBMS / CN / Behavioural), difficulty auto-set from Skill Graph
2. **Role Mode** — Pick role (SDE / Data Analyst / Product / Consulting / Finance), company style
3. **JD Mode** — Paste JD, AI generates company-specific question set

#### 5.2.2 Session Configuration

- Duration: 15 / 30 / 45 minutes
- Round type: Technical / HR / Mixed / Case Study
- Interviewer persona: Friendly / Neutral / Tough (stress test)
- Focus areas

#### 5.2.3 Pre-Flight Check

- Camera test (face detection via MediaPipe)
- Mic test (audio level via Web Audio API)
- Lighting suggestion if face unclear
- Graceful fallback: typed answers if camera/mic unavailable

**Privacy notice shown:** "Your camera and voice are analyzed on your device only. Nothing is uploaded."

#### 5.2.4 Live Interview Screen

Layout:
- Left: student webcam (small, with eye-contact guide ring)
- Right sidebar: live metrics (subtle — eye contact %, pace, filler count, time remaining)
- Center: AI interviewer text + student's live captions
- Bottom: [End Interview] [I need a moment] buttons

#### 5.2.5 AI Interviewer Logic

```
Question asked
  → Student answers (speech-to-text or typed)
  → AI evaluates in real-time:
    SHALLOW → follow-up: "Can you go deeper on [specific part]?"
    WRONG → hint question, then correction in report (not live)
    GOOD → acknowledge briefly, increase difficulty
    GREAT → "Let's go harder", jump to advanced follow-up
```

#### 5.2.6 Question Bank

| Topic | Questions (seed) |
|---|---|
| DSA — Arrays, Trees, Graphs, DP, etc. | 300 (50 per subtopic) |
| System Design | 50 (Beginner/Intermediate/Advanced) |
| Core CS (OS, DBMS, CN) | 90 (30 each) |
| Behavioural (STAR) | 40 |
| Domain (Finance, Product, Data) | 120 (40 each) |

Each question has: text, expected answer outline, common mistakes, difficulty, company tags, follow-ups.

#### 5.2.7 Real-Time Analysis (All Browser-Local)

| Metric | Technology | Update Rate |
|---|---|---|
| Filler words | Web Speech API → string match | Real-time |
| Eye contact | MediaPipe Face Mesh (WASM) | Every 500ms |
| Speech pace | Web Audio API → WPM | Real-time |
| Confidence proxy | Composite: voice steadiness, pauses, fillers, eye contact | Per-question |

#### 5.2.8 Coaching Report

Generated after session (student's API key used for scoring):

- Overall score (0-100)
- Communication metrics: eye contact %, pace rating, filler word count with timeline, confidence score
- Technical performance: per-question scores (0-5), detailed feedback, what a good answer looks like
- Top 3 things to fix (with specific drills)
- Comparison to last session (trend)
- Actions: [Share Report] [Add to Portfolio] [Retry] [Update Roadmap]

---

### 5.3 AI Roadmap Engine

**Priority: P2 (build third)**

#### 5.3.1 Onboarding Assessment

5 questions (runs once, informs everything):

1. Target role (SDE / Data Analyst / Business Analyst / Consultant / Core Engg / Finance / PM)
2. Target company tier (Top Product / Mid Product / Service / Startup / PSU / Open)
3. Placement season start (<1mo / 1-2mo / 3-4mo / 5-6mo / 6+mo)
4. Honest skill check (role-specific, self-rated: Never Done / Beginner / Comfortable / Strong)
5. Hours per day you can realistically give (<1hr / 1-2 / 2-3 / 3+)

#### 5.3.2 Roadmap Generation

Inputs → Processing → Output:

**Inputs:** Role + tier + timeline + skill levels + hours/day
**Processing:**
1. Calculate total available hours
2. Map required skills for role+tier
3. Identify skill gaps (required vs current)
4. Prioritize by: interview frequency × gap size × time to learn
5. Assign hours to each topic
6. Distribute into weeks

**Output:** Phase structure (Foundation → Building → Placement Mode), week-by-week breakdown, daily hour allocation, one curated resource per topic.

#### 5.3.3 Week View

Each week shows:
- Theme/target topic
- Estimated hours
- Day-by-day breakdown (materials + practice problems)
- Checkpoint mock interview (auto-links to Interview Coach)
- Status: [Not Started] / [In Progress] / [Complete]
- [Behind Schedule — recalculate?] button

#### 5.3.4 Adaptive Engine

| Trigger | Action |
|---|---|
| Student marks topic "Struggling" | Add buffer week, suggest easier prerequisite |
| Mock interview score <50% on topic | Bump topic up in schedule |
| Student ahead of schedule | Offer bonus company-specific content |
| 3 weeks to placement season | Auto-shift to "Crunch Mode" — high-frequency topics only |
| JD analysis adds skill gaps | New tasks inserted into roadmap |

#### 5.3.5 Resource Curation

- One best resource per concept (not 10)
- Community-validated (upvotes from placed students carry 3x weight)
- Free only (no paywalls)
- Specific (e.g., "Striver's Tree playlist, Videos 1-8" not "YouTube")
- Time-estimated accurately

#### 5.3.6 Progress Dashboard

- Overall progress bar
- Phase completion (% per phase)
- Topics mastered
- Mock interviews done
- Average interview score + trend
- Projected ready date vs placement season
- Buffer indicator
- Weak areas from interview data

---

### 5.4 Dashboard

**Priority: P1 (built alongside resume builder as skeleton)**

Single view answering **"Am I placement-ready today?"**

- Placement Readiness Score (composite 0-100)
- Resume score (best version's ATS)
- Roadmap progress (% complete, on/off track)
- Interview performance trend
- Top skill gaps
- Next 7 days: upcoming tasks

Every card deep-links into its module. Empty states guide to next activation step.

---

### 5.5 Skill Graph (Unified Intelligence Layer)

**Priority: P2 (schema defined now, integration after all modules built)**

The Skill Graph connects all three modules into a coherent system:

- Resume skills → Skill Graph → influences roadmap
- Interview weaknesses → Skill Graph confidence ↓ → roadmap reprioritizes
- Roadmap completions → Skill Graph confidence ↑ → interview difficulty scales up
- JD gaps → Skill Graph new nodes → roadmap tasks

See [DATA-ARCHITECTURE.md](./DATA-ARCHITECTURE.md) for the schema.

---

## 6. User Flows (High-Level)

```
Landing → Auth → Onboarding (assessment + BYOK setup)
  → Dashboard (readiness hub)
    ├── Resume Builder (chat → preview → export)
    ├── Interview Coach (mode select → pre-flight → session → report)
    ├── Roadmap (timeline → week view → task check-off)
    └── Settings (profile, API key, data)
```

See [UX-FLOW.md](./UX-FLOW.md) for detailed screen-by-screen flows.

---

## 7. Non-Goals (v1)

- Mobile native apps (responsive web only)
- Job board / application tracking
- Peer-to-peer mock interviews
- College admin/TPO portal (v2)
- Payments/subscriptions (deferred — use free tier + BYOK model)
- Resume parsing from uploaded PDFs (v1.1)
- Mobile app
- Video recording of interview sessions
- Social features / leaderboards

---

## 8. Constraints & Principles

1. **Privacy-first:** Media analysis runs locally; only derived metrics stored
2. **ATS-safe output:** Exported PDFs must parse correctly in common ATS parsers
3. **Zero infrastructure cost:** BYOK model ensures AI costs are never ours
4. **Graceful degradation:** Every AI feature has a non-AI fallback or clear empty state
5. **One profile:** No module holds user state the Skill Graph cannot see
6. **Desktop-first:** Interview Coach needs webcam; resume builder and roadmap are responsive but optimized for desktop
7. **Chrome-first:** Web Speech API requires Chrome; typed fallback for other browsers

---

## 9. Open Questions (Resolved)

| Question | Decision |
|---|---|
| Auth provider? | **Supabase Auth** (free, built-in, magic link + Google OAuth) |
| Free trial size? | **20 AI requests total**, no expiry per-account |
| Repo structure? | **Single Next.js app** (not monorepo) |
| Design direction? | **Minimal light theme**, Notion x Vercel, blue accent (#2563EB) |
| Build order? | Resume Builder → Interview Coach → Roadmap Engine → Flywheel |
| Mobile support? | **Desktop-first v1**, responsive but not mobile-optimized |
| Skill Graph approach? | **Define schema now**, implement incrementally |

---

## 10. Glossary

| Term | Definition |
|---|---|
| ATS | Applicant Tracking System — software companies use to parse resumes |
| BYOK | Bring Your Own Key — student provides their own AI API key |
| JD | Job Description — the posting a student is applying to |
| Skill Graph | Directed graph of skills with per-user confidence scores |
| Readiness Score | Composite metric (0-100) of resume quality + roadmap progress + interview performance |
| TPO | Training and Placement Officer — admin at college managing placements |
