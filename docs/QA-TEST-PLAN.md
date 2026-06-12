# PlacementOS — QA & Test Plan

## 1. Testing Philosophy

1. **Test behavior, not implementation** — Test what the user sees and does, not internal functions
2. **AI is non-deterministic** — Test AI features by checking response structure, not exact content
3. **Chrome-first, others graceful** — Full test suite on Chrome; Firefox/Safari test typed fallbacks only
4. **Manual + automated** — Critical flows auto-tested; visual/UX issues caught manually

---

## 2. Test Tooling

| Layer | Tool | What It Tests |
|---|---|---|
| **Unit** | Vitest | Utilities, helpers, state store logic |
| **Integration** | Vitest + MSW | API route handlers (mock AI) |
| **Component** | Vitest + Testing Library | React components, user interactions |
| **E2E** | Playwright | Full user flows across pages |
| **Visual** | Storybook (optional) | Component states in isolation |
| **Manual** | QA checklist | UX flow, edge cases, browser compatibility |

---

## 3. Unit Tests (Vitest)

### 3.1 Utility Functions

```
src/lib/utils.ts
  - truncateText() → shortens text, adds ellipsis
  - formatDate() → returns "12 Jun 2026" format
  - calculateATS() → returns correct weighted score
  - detectKeyProvider() → "gsk_" → groq, "sk-or-" → openrouter, "AIza" → gemini
  - debounce() → calls fn after delay, cancels previous

src/lib/rate-limit.ts
  - checkRateLimit() → returns { allowed, remaining, resetAt }
  - Different window sizes work correctly
  - Handles missing Redis connection gracefully

src/lib/trial.ts
  - getRemainingQuota() → returns correct count
  - consumeTrialRequest() → increments counter
  - Exhausted trial → returns error
  - Concurrent requests → Redis lock prevents double-counting
```

### 3.2 Store Logic (Zustand)

```
src/store/resume-store.ts
  - setCurrentSection() → updates section, resets state
  - addMessage() → appends to messages array
  - updateResumeData() → merges partial data
  - isSectionComplete() → returns correct boolean per section

src/store/interview-store.ts
  - startSession() → initializes with config
  - nextQuestion() → increments counter, adds to history
  - addMetricSample() → updates rolling averages
  - calculateResults() → returns correct aggregates

src/store/ui-store.ts
  - toggleSidebar() → flips boolean
  - showToast() / dismissToast() → manages toast queue
```

---

## 4. Integration Tests (Vitest + MSW)

### 4.1 API Route Tests

| Route | Test Cases |
|---|---|
| `POST /api/ai/chat` | Valid request → SSE stream; Invalid key → 401; Rate limited → 429; Trial exhausted → 402; Malformed body → 400 |
| `POST /api/ai/analyze` | Valid JD → JSON response; Empty JD → 400; AI timeout → retry then 500 |
| `POST /api/ai/score` | Valid Q&A → score JSON; Empty answer → fallback score; Invalid JSON response from AI → retry |
| `POST /api/ai/validate-key` | Valid key → `{ valid: true }`; Invalid key → `{ valid: false }`; Provider down → 502 |
| `POST /api/ai/roadmap` | Generate → weeks array; Recalculate with weak areas → updated weeks; Invalid assessment → 400 |
| `GET /api/resume` | Auth OK → resume list; No auth → 401; Empty list → `[]` |
| `POST /api/resume` | Valid body → created; Free user at limit → 402; Name too long → 400 |
| `PATCH /api/resume/[id]` | Owner → updated; Not owner → 403; Non-existent → 404 |
| `DELETE /api/resume/[id]` | Owner → deleted; Cascade deletes versions |
| `POST /api/interview` | Valid → created; Invalid config → 400 |
| `PATCH /api/interview/[id]` | Session complete → saved; Partial data → partial save |
| `GET /api/trial` | Fresh user → `{ used: 0, remaining: 20 }`; Exhausted → `{ exhausted: true }` |
| `POST /api/trial/consume` | Available → decrements; Exhausted → 402 |

---

## 5. E2E Tests (Playwright)

### 5.1 Auth Flow

```
Test: Signup via magic link
  1. Navigate to /signup
  2. Enter email
  3. Click "Send Magic Link"
  4. Check success toast
  5. (Mock) Click magic link from email
  6. Redirect to /onboarding

Test: Login via Google OAuth
  1. Navigate to /login
  2. Click "Continue with Google"
  3. (Mock) Complete OAuth
  4. Redirect to /dashboard (returning) or /onboarding (new)

Test: Already authenticated redirect
  1. Set auth cookie
  2. Navigate to /login
  3. Redirect to /dashboard
```

### 5.2 Onboarding Flow

```
Test: Complete full onboarding
  1. Navigate to /onboarding
  2. Step 1: Select role "SDE", tier "Top Product", timeline "3-4 months"
  3. Click Continue
  4. Step 2: Set skills (DSA: Comfortable, System Design: Beginner)
  5. Set hours: 2-3
  6. Click Continue
  7. Step 3: Skip BYOK (use trial)
  8. See "Setting up your roadmap..." loading
  9. See summary page with assessment data
  10. Click "Go to Dashboard"
  11. Dashboard shows populated cards

Test: Skip assessment
  1. Navigate to /onboarding
  2. Click "Skip to Resume Builder"
  3. Redirect to /resume (new)
  4. Dashboard shows empty state banners

Test: Invalid API key on step 3
  1. Enter invalid key format
  2. See inline validation error
  3. Enter valid format but wrong key
  4. See "This key doesn't work" error
  5. Switch provider and retry
```

### 5.3 Resume Builder

```
Test: Create resume via chat
  1. Navigate to /resume
  2. Click "New Resume"
  3. Select template "Classic"
  4. See split-panel layout with AI greeting
  5. Type: "I want a resume for SDE roles"
  6. See AI response with first question
  7. Answer personal info: "Rahul Sharma, BITS Pilani, CSE, 2026"
  8. Verify preview updates with name and education
  9. Continue through skills, projects, experience, achievements
  10. See review step with before/after bullets
  11. Accept all enhanced bullets
  12. Click "Export PDF"
  13. PDF downloads

Test: JD analysis
  1. Open existing resume
  2. Switch to "JD Match" tab
  3. Paste job description
  4. Click "Analyze"
  5. See keyword match %, matched/missing lists
  6. Click "Add missing skills to roadmap"
  7. See success toast

Test: Auto-save indicator
  1. Edit resume data
  2. See "Saving..." badge
  3. Wait → see "Saved" with timestamp
  4. Refresh page → data persists

Test: Free tier limit
  1. Auth as free user with 3 resumes
  2. "New Resume" button is disabled/locked
  3. See upgrade prompt
```

### 5.4 Interview Coach

```
Test: Full interview session (topic mode)
  1. Navigate to /interview
  2. Select "Topic Mode" → "DSA"
  3. Set duration: 15 min, persona: Neutral
  4. Click "Start Interview"
  5. Pre-flight: allow camera, allow mic
  6. See face detected, audio level good
  7. Click "Start Interview →"
  8. See first question displayed
  9. Speak answer (or type if fallback)
  10. Click "I'm done answering"
  11. See next question (harder if good answer)
  12. Continue through 3 questions
  13. Click "End Interview"
  14. Confirm → see "Analyzing your interview..."
  15. See report with overall score, communication, technical breakdown

Test: Typed fallback mode
  1. Start interview without mic permission
  2. See "Typed answers only" notice
  3. Questions display with text input
  4. Type answer → submit → next question
  5. Report shows "Communication metrics unavailable"

Test: JD mode (Pro)
  1. Free user sees lock icon on JD mode
  2. Pro user can paste JD and start

Test: "I need a moment"
  1. During interview, click "I need a moment"
  2. See 30s timer countdown
  3. Timer expires → auto-continue
  4. Click resume early → continues
```

### 5.5 Roadmap

```
Test: Roadmap generation
  1. Complete onboarding assessment
  2. Navigate to /roadmap
  3. See generated roadmap with phases, weeks, today's plan
  4. Week view shows daily breakdown with resources

Test: Task completion
  1. Click checkbox on today's task
  2. See micro-feedback
  3. Progress bar updates
  4. Skill confidence updates

Test: Adaptive recalc after interview
  1. Complete interview with System Design weakness
  2. Navigate to /roadmap
  3. See banner: "Your roadmap was updated based on your interview"
  4. System Design appears earlier than before

Test: Crunch mode
  1. Set placement date to 3 weeks from now
  2. Roadmap auto-shifts to crunch mode
  3. Low-priority topics removed
  4. Mock interviews scheduled daily
```

---

## 6. Manual QA Checklist

### 6.1 Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Auth (magic link) | ✅ | ✅ | ✅ | ✅ |
| Onboarding | ✅ | ✅ | ✅ | ✅ |
| Resume builder chat | ✅ | ✅ | ✅ (streaming OK) | ✅ |
| PDF export | ✅ | ✅ | ✅ | ✅ |
| Interview (webcam) | ✅ | ✅ | ❌ (MediaPipe) | ❌ |
| Interview (typed) | ✅ | ✅ | ✅ | ✅ |
| Filler word detection | ✅ | ✅ | ❌ (Web Speech) | ❌ |
| Roadmap | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ |

### 6.2 Edge Cases

- [ ] Slow network (3G throttling) — streaming still works, longer load times acceptable
- [ ] Offline mode — cached resume data viewable, features disabled with notice
- [ ] Multiple tabs — data syncs correctly (Supabase real-time)
- [ ] API key rotated mid-session — next AI call shows error gracefully
- [ ] Trial exhausted mid-conversation — current response completes, then upgrade prompt
- [ ] Empty JD — clear error message
- [ ] Very long text inputs (1000+ chars) — truncated or scrollable
- [ ] Special characters in resume (Unicode, emoji) — stripped or handled
- [ ] Back button during interview — confirmation prompt
- [ ] Page refresh during interview — session data partially saved

### 6.3 Accessibility

- [ ] Tab through all interactive elements
- [ ] Focus rings visible on all elements
- [ ] Screen reader announces loading states
- [ ] Color contrast meets WCAG AA for all text
- [ ] Error messages associated with inputs via aria-describedby
- [ ] Modals trap focus

---

## 7. Performance Tests

| Test | Threshold | Tool |
|---|---|---|
| Landing page FCP | <1.5s | Lighthouse |
| Dashboard TTI | <3s | Lighthouse |
| Resume builder render | <1s (after data loaded) | Chrome DevTools |
| PDF export | <2s | Manual timing |
| AI response first token | <3s (Groq) | Manual timing |
| Face tracking FPS | >15fps | MediaPipe stats |
| Bundle size (initial JS) | <150KB | Next.js bundle analyzer |
