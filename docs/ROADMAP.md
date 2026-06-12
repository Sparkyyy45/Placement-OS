# PlacementOS — Implementation Roadmap

## 1. Phase Overview

```
Phase 0: Foundation     ████████████████░░░░░░░░  1.5 weeks
Phase 1: Resume Builder ████████████████████████░  3 weeks
Phase 2: Interview      ██████████████████░░░░░░░  2.5 weeks
Phase 3: Roadmap Engine ████████████████░░░░░░░░░  2 weeks
Phase 4: The Flywheel   ████████████░░░░░░░░░░░░░  1 week
─────────────────────────────────────────────────
Total:                                                    10 weeks
```

---

## 2. Phase 0 — Foundation (Week 1-1.5)

**Goal:** Auth, onboarding, dashboard skeleton, and BYOK setup working.

### Tasks

| Day | Task | Details | Dependencies |
|---|---|---|---|
| **1** | Project scaffolding | `npx create-next-app`, Tailwind, TypeScript, Shadcn/ui init | None |
| **1** | Git + GitHub setup | Initialize repo, first commit, Vercel deploy | #1 |
| **2** | Supabase project setup | Create project, enable Auth (magic link + Google), create tables | #1 |
| **2** | Prisma schema | Write full schema from DATA-ARCHITECTURE.md, run migration | #3 |
| **3** | Supabase Auth integration | Login/signup pages, magic link flow, session management | #4 |
| **3** | Dashboard layout | Header + sidebar + main content area shell, responsive | #5 |
| **4** | Onboarding wizard (steps 1-2) | Goal setting + skill check forms with validation | #5 |
| **5** | Onboarding wizard (step 3) | BYOK setup with provider selector, key input, validate button | #6 |
| **5** | `/api/ai/validate-key` endpoint | Test key against provider, return valid/invalid | #7 |
| **6** | Dashboard page | Empty state cards, trial quota badge, basic readiness score skeleton | #5 |
| **6** | Settings page | Profile edit, key management, provider switch | #7 |
| **7** | Upstash rate limiter | Rate limit middleware, integrate with AI endpoints | #3 |
| **7** | Trial quota logic | Server-side counting, Redis lock, exhaustion handling | #9 |

### Milestone: Foundation Complete ✅
- User can sign up, complete onboarding, and see a dashboard
- BYOK setup works (Groq/OpenRouter/Gemini)
- Trial quota system operational
- Rate limiting active

---

## 3. Phase 1 — Resume Builder (Week 2-4)

**Goal:** Full conversational resume builder with JD analysis, ATS scoring, and PDF export.

### Tasks

| Week | Day | Task | Details |
|---|---|---|---|
| **2** | 1 | Resume list page | `/resume` with create button, empty state, free tier limit |
| **2** | 2 | Resume builder layout | Split panel: chat (40%) + preview (60%), section tabs |
| **2** | 3 | AI chat component | Message list, input, streaming text display, abort support |
| **2** | 4 | `/api/ai/chat` endpoint | Resume builder AI with section state machine, BYOK integration |
| **2** | 5 | Personal + Education sections | AI probes, structured extraction, preview update |
| **3** | 1 | Skills section | AI brain dump → categorization, JD cross-reference |
| **3** | 2-3 | Projects section (core) | AI probing loop: challenge → stack → impact → 3 bullets |
| **3** | 4 | Experience section | Same probing pattern as projects |
| **3** | 5 | Achievements section | CP, hackathons, research, PORs, open source |
| **4** | 1 | Review step | Before/after diff per bullet, accept/reject/edit |
| **4** | 2 | ATS score engine | Rule-based scoring (keyword, format, content, readability) |
| **4** | 3 | JD analyzer tab | JD paste → keyword extraction → match report |
| **4** | 4 | `/api/ai/analyze` endpoint | JD analysis AI call |
| **4** | 5 | PDF export | React-PDF templates (Classic, Modern, Technical), download |
| **4** | 6 | Auto-save + version history | Debounced 30s save, version snapshots |
| **4** | 7 | Polish + edge cases | Error states, empty states, loading skeletons, save indicators |

### Milestone: Resume Builder Complete ✅
- Student can have a full conversation with AI and walk away with a complete resume
- JD analysis shows keyword match and suggestions
- ATS score updates live as resume builds
- PDF export generates ATS-safe output
- Multiple resume versions supported

---

## 4. Phase 2 — Interview Coach (Week 5-7)

**Goal:** Live AI mock interview with browser-based analysis and coaching reports.

### Tasks

| Week | Day | Task | Details |
|---|---|---|---|
| **5** | 1 | Interview mode selection | Topic / Role / JD mode cards, session config |
| **5** | 2 | Pre-flight check | Camera test (MediaPipe), mic test (Web Audio), permissions |
| **5** | 3 | MediaPipe Face Mesh integration | Face detection → eye contact tracking → % calculation |
| **5** | 4 | Web Speech API integration | Speech-to-text, filler word detection |
| **5** | 5 | Web Audio API integration | Pace analysis (WPM calculation) |
| **6** | 1 | Live interview screen layout | Webcam preview, metrics sidebar, question area, captions |
| **6** | 2 | Question bank (seed) | 50 starter questions per topic (or AI-generated first) |
| **6** | 3 | `/api/ai/score` endpoint | Single answer scoring, follow-up generation |
| **6** | 4 | Answer flow logic | Question → student answers → score → next question adaptation |
| **6** | 5 | Interview session CRUD | Create, update transcript/metrics, complete session |
| **7** | 1 | `/api/ai/generate-report` | Full coaching report generation |
| **7** | 2 | Report page | Score ring, communication metrics, per-question breakdown |
| **7** | 3 | Typed answer fallback | Text input mode for Firefox/Safari users |
| **7** | 4 | JD mode | JD → question generation via AI |
| **7** | 5 | Polish + edge cases | "I need a moment", end confirmation, error recovery |

### Milestone: Interview Coach Complete ✅
- Student can take a full mock interview with webcam/mic or typed answers
- Eye contact, filler words, and pace tracked in real-time
- AI scores each answer, adapts difficulty, generates full report
- Report links to roadmap updates

---

## 5. Phase 3 — Roadmap Engine (Week 8-9)

**Goal:** Personalized placement roadmap with adaptive recalculation.

### Tasks

| Week | Day | Task | Details |
|---|---|---|---|
| **8** | 1 | Roadmap generation logic | AI prompt from assessment data (reuse onboarding data) |
| **8** | 2 | `/api/ai/roadmap` endpoint | Generate + recalc endpoints |
| **8** | 3 | Roadmap timeline view | Phase progression bar, week list, today's plan |
| **8** | 4 | Week view | Daily breakdown, task cards, resource links, checkboxes |
| **8** | 5 | Task check-off flow | Mark complete → micro-feedback → progress update |
| **9** | 1 | Resource database | Seed 50 resources, link to topics |
| **9** | 2 | Adaptive triggers | Soft recalc (reprioritize) + hard recalc (regenerate) |
| **9** | 3 | Recalc banner | "Your roadmap was updated because..." with reason |
| **9** | 4 | Crunch mode | Last 3 weeks auto-shift to high-frequency topics |
| **9** | 5 | Progress dashboard | Phase completions, topics mastered, projected ready date |

### Milestone: Roadmap Engine Complete ✅
- Student gets a personalized roadmap after onboarding
- Tasks with curated resources, estimated hours, check-offs
- Roadmap automatically updates based on interview weak areas
- Crunch mode activates near placement season

---

## 6. Phase 4 — The Flywheel (Week 10)

**Goal:** Connect all three modules through the Skill Graph. Dashboard becomes the "Am I ready?" answer.

### Tasks

| Day | Task | Details |
|---|---|---|
| **1** | Skill Graph schema implementation | Seed skill nodes, create graph traversal logic |
| **2** | Resume → Skill Graph sync | Skills from resume update confidence, trigger roadmap recalc |
| **3** | Interview → Skill Graph sync | Question scores update confidence, trigger roadmap recalc |
| **4** | Roadmap → Skill Graph sync | Task completions update confidence |
| **5** | Dashboard readiness score | Composite: resume ATS + roadmap progress + interview avg |
| **6** | Skill gaps display | "Top 3 things to work on" with deep links |
| **7** | Cross-module testing | End-to-end: build resume → take interview → see roadmap update |
| **8** | Final polish | Error states, empty states, transition animations |

### Milestone: Flywheel Complete ✅
- Building a resume informs the roadmap
- Taking an interview updates skill gaps
- Completing roadmap tasks increases interview difficulty
- Dashboard accurately answers "Am I ready?"

---

## 7. Post-Launch (Week 11+)

| Task | Priority | Timeline |
|---|---|---|
| Beta testing with 10-20 students | P0 | Week 11 |
| Bug fixes from beta feedback | P0 | Week 12 |
| Student Pro payments (Razorpay integration) | P1 | Week 13 |
| Institution TPO dashboard | P2 | Week 14-16 |
| Performance optimization | P1 | Ongoing |
| Analytics implementation | P2 | Week 13 |
| SEO for landing page | P2 | Week 13 |

---

## 8. Key Dependencies Map

```
Phase 0
  ├── Supabase project & Prisma schema
  └── Vercel deployment pipeline
  
Phase 1
  ├── Phase 0 (auth, BYOK)
  └── @react-pdf/renderer
  
Phase 2
  ├── Phase 0 (auth, BYOK)
  ├── MediaPipe npm package
  └── Web Speech API (Chrome testing)
  
Phase 3
  ├── Phase 0 (auth, BYOK, assessment data)
  └── Phase 2 (interview → roadmap recalc)
  
Phase 4
  ├── Phase 1 (resume data)
  ├── Phase 2 (interview data)
  └── Phase 3 (roadmap data)
```

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Web Speech API fails in non-Chrome | High | Medium | Typed fallback from day 1 |
| MediaPipe performance on low-end laptops | Medium | Medium | Fallback to tracking disabled; metrics unavailable |
| Students don't bring their own key | Medium | High | Generous 20-request trial + clear BYOK wizard |
| AI prompt quality inconsistent | Medium | High | "Report bad suggestion" button; manual edit fallback |
| Supabase free tier limits hit | Low | Medium | Upgrade to $25/month Pro tier |
| Resume PDF rendering issues | Medium | Medium | Test with real ATS parsers; provide manual edit fallback |
| Onboarding drop-off | High | High | Measure funnel; add skip option to resume builder |
