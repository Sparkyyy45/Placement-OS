# PlacementOS — User Experience & App Flow

## 1. Information Architecture

```
PlacementOS
├── Public Pages
│   ├── Landing (/)                  # Product pitch, features, CTA
│   ├── Login (/login)               # Email magic link / Google OAuth
│   └── Signup (/signup)            # Create account
│
├── Authenticated Pages
│   ├── Onboarding (/onboarding)     # First-run wizard (mandatory)
│   ├── Dashboard (/dashboard)       # Readiness hub (default after login)
│   ├── Resume
│   │   ├── List (/resume)           # All resume versions
│   │   └── Builder (/resume/[id])   # Chat + preview + JD mode
│   ├── Roadmap (/roadmap)           # Timeline, week view, tasks
│   ├── Interview
│   │   ├── Mode Select (/interview)           # Topic / Role / JD
│   │   ├── Session (/interview/session/[id])   # Live interview
│   │   └── Report (/interview/report/[id])    # Post-interview
│   ├── Skills (/skills)             # Skill Graph explorer
│   └── Settings (/settings)         # Profile, API key, data
│
└── API Routes
    └── /api/...                     # See TRD.md
```

---

## 2. Screen-by-Screen Flows

### 2.1 Landing Page (`/`)

**Purpose:** Convert visitors to signups.

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  [Logo]           [Login] [Sign Up]                │
│                                                     │
│  Hero: "Your Placement OS"                          │
│  Sub: "One platform. Resume, roadmap, interviews.   │
│        Built by students who've been there."        │
│                                                     │
│  [Get Started Free]                                 │
│                                                     │
│  ┌────────────┬────────────┬──────────────┐        │
│  │ Resume     │ Roadmap    │ Interview    │        │
│  │ Builder    │ Engine     │ Coach        │        │
│  ├────────────┼────────────┼──────────────┤        │
│  │ AI chat →  │ Personali- │ Webcam + AI  │        │
│  │ ATS score  │ zed plan   │ feedback     │        │
│  └────────────┴────────────┴──────────────┘        │
│                                                     │
│  "Built with BYOK — your key, your privacy"         │
│  "Free forever. No credit card."                    │
│                                                     │
│  Footer: Privacy · Terms · GitHub                   │
└────────────────────────────────────────────────────┘
```

**States:**
- **Default:** Hero + 3 feature cards + CTA
- **Scrolled:** Feature details, BYOK explanation, testimonial placeholders
- **Authenticated user visits `/`:** Redirect to `/dashboard`

---

### 2.2 Auth Flow (`/login`, `/signup`)

**Purpose:** Authenticate users via Supabase Auth.

**Signup Flow:**
```
1. Enter email
2. Click "Send Magic Link" or "Continue with Google"
3. (Magic link) Check email → click link → authenticated
4. (Google) OAuth popup → consent → authenticated
5. Redirect to /onboarding (first time) or /dashboard
```

**Login Flow:**
```
1. Enter email
2. Click "Send Magic Link"
3. Check email → click link → authenticated
4. Redirect to /dashboard
```

**States:**
- **Idle:** Email input + provider buttons
- **Loading:** Sending magic link / OAuth popup
- **Success:** "Check your email" with resend option
- **Error:** Invalid email, rate limited, provider error
- **Already logged in:** Redirect to `/dashboard`

---

### 2.3 Onboarding Wizard (`/onboarding`)

**Purpose:** First-run setup. Assessment + API key. Mandatory for full features.

**Step 1 — Goal Setting:**
```
┌──────────────────────────────────────────────┐
│  "Let's set up your placement journey"        │
│                                               │
│  What's your target role?                     │
│  [SDE] [Data Analyst] [Business Analyst]      │
│  [Consultant] [Core Engg] [Finance] [PM]     │
│                                               │
│  Company tier you're aiming for?              │
│  [Top Product] [Mid Product] [Service]        │
│  [Startup] [PSU] [Open to anything]          │
│                                               │
│  When does placement season start?            │
│  [<1mo] [1-2mo] [3-4mo] [5-6mo] [6+mo]      │
│                                               │
│  [Continue →]                                 │
└──────────────────────────────────────────────┘
```

**Step 2 — Skill Check:**
```
┌──────────────────────────────────────────────┐
│  "Honest check — where do you stand?"        │
│                                               │
│  (Role-specific questions auto-populate)     │
│                                               │
│  DSA:      [Never] [Beginner] [Comfy] [Pro]  │
│  System Design: [Never] [Beginner] [Comfy]   │
│  OS:       [Never] [Beginner] [Comfy] [Pro]  │
│  DBMS:     [Never] [Beginner] [Comfy] [Pro]  │
│  Networks: [Never] [Beginner] [Comfy] [Pro]  │
│  Projects: [0] [1] [2] [3+]                  │
│                                               │
│  Hours/day you can give:                      │
│  [<1hr] [1-2hr] [2-3hr] [3+hr]              │
│                                               │
│  [Back] [Continue →]                         │
└──────────────────────────────────────────────┘
```

**Step 3 — AI Setup:**
```
┌──────────────────────────────────────────────┐
│  "AI Features"                                │
│                                               │
│  PlacementOS uses AI to power the resume      │
│  builder, interview coach, and roadmap.       │
│                                               │
│  You have two options:                        │
│                                               │
│  ┌──────────── 20 Free Requests ──────────┐  │
│  │ Try all features with 20 free AI calls  │  │
│  │ No key needed.                          │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌────────── Bring Your Own Key ──────────┐  │
│  │ Unlimited AI usage.                    │  │
│  │ Your key stays in your browser.        │  │
│  │ We never see it.                       │  │
│  │                                        │  │
│  │ [Recommended: Groq — free, 2 min setup]│  │
│  │ [OpenRouter] [Google AI Studio]        │  │
│  │                                        │  │
│  │ API Key: [_________________________]   │  │
│  │ [Test & Save]                          │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  [Skip — use free trial] [Continue →]        │
└──────────────────────────────────────────────┘
```

**Step 4 — Generating (Loading):**
```
┌──────────────────────────────────────────────┐
│  "Setting up your personalized roadmap..."    │
│                                               │
│  [████████░░░░░░░░░] 45%                      │
│                                               │
│  • Analyzing your profile                     │
│  • Mapping skill gaps                         │
│  • Building your 12-week roadmap              │
│  • Curating resources                         │
│                                               │
│  This takes ~15 seconds                       │
└──────────────────────────────────────────────┘
```

**Step 5 — Summary:**
```
┌──────────────────────────────────────────────┐
│  "You're all set!"                            │
│                                               │
│  ┌─────────────────────────────────────┐      │
│  │  Target: SDE @ Top Product          │      │
│  │  Timeline: 12 weeks until Dec 1     │      │
│  │  Daily: 2-3 hours                   │      │
│  │  AI: Connected (Groq)               │      │
│  └─────────────────────────────────────┘      │
│                                               │
│  "Next step: build your resume."              │
│                                               │
│  [Start Resume Builder] [Go to Dashboard]     │
└──────────────────────────────────────────────┘
```

**States:**
- **Fresh user (no assessment):** Full wizard
- **Returning user without assessment:** Banner: "Complete your assessment to unlock roadmap"
- **Returning user with assessment:** Straight to dashboard
- **Step validation error:** Inline error messages
- **Key validation failing:** "Your key doesn't work. Check it or try a different provider."

---

### 2.4 Dashboard (`/dashboard`)

**Purpose:** The "Am I ready?" answer. Central hub.

```
┌──────────────────────────────────────────────────┐
│  PlacementOS                    [Trial: 15/20]   │
│  ┌──────────────────────────────────────────┐    │
│  │  Placement Readiness                      │    │
│  │  71/100                                   │    │
│  │  [████████░░░░] "On track"               │    │
│  │  Trend: +5 this week                      │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  ┌────────┬────────┬──────────┬──────────┐       │
│  │ Resume │Roadmap │Interview │ Skills   │       │
│  │ 78/100 │ 64%    │ 68 ↑12% │ 12/19    │       │
│  └────────┴────────┴──────────┴──────────┘       │
│                                                   │
│  Top Skill Gaps:                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ Dynamic Programming   ████░░░░ 40%        │    │
│  │ System Design         ██████░░ 55%        │    │
│  │ Behavioral Stories    ███████░ 65%        │    │
│  │ [Practice Now] [See Roadmap]              │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  Next 7 Days:                                     │
│  ┌──────────────────────────────────────────┐    │
│  │ Today: Arrays practice (2hr)             │    │
│  │ Tue:   Trees + Graphs (3hr)              │    │
│  │ Thu:   Mock Interview (30min)            │    │
│  │ Fri:   System Design review (2hr)        │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

**States:**
- **No resume:** "Create your first resume" CTA, score shows "—"
- **No roadmap:** "Complete assessment" CTA
- **No interviews:** "Take your first mock interview" CTA
- **All set:** Full dashboard as shown
- **Trial expiring:** Banner: "You have 3 AI requests left. Add your API key."

---

### 2.5 Resume List (`/resume`)

```
┌──────────────────────────────────────────────────┐
│  My Resumes                     [+ New Resume]   │
│                                                   │
│  ┌─────────────────────┐ ┌────────────────────┐  │
│  │ General SDE Resume  │ │ Goldman Application │  │
│  │ ATS: 82/100         │ │ ATS: 91/100         │  │
│  │ Updated: 2 days ago  │ │ Updated: Today      │  │
│  │ [Edit] [Export]     │ │ [Edit] [Export]     │  │
│  └─────────────────────┘ └────────────────────┘  │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Data Science Internship                    │  │
│  │  ATS: 67/100  Needs improvement             │  │
│  │  Updated: 1 week ago                        │  │
│  │  [Edit] [Export] [Delete]                   │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**States:**
- **Empty:** "You haven't created any resumes yet. Let's build your first one." + big CTA
- **Has resumes:** List grid (max 3 for free, unlimited for Pro)
- **Free user at limit:** "Upgrade to create more" badge

---

### 2.6 Resume Builder (`/resume/[id]`)

**Purpose:** The core workspace. Conversational AI on left, live preview on right.

```
┌──────────────────────────────────────────────────┐
│  [← Back]  General SDE Resume    [Save] [Export] │
│                                                   │
│  ┌─────────────────────┬────────────────────────┐│
│  │  AI Chat            │  Live Preview           ││
│  │                     │  ┌──────────────────┐  ││
│  │ AI: "Tell me about  │  │ RAHUL SHARMA     │  ││
│  │ a project you're    │  │ B.Tech CSE, 2026 │  ││
│  │ proud of."          │  │                   │  ││
│  │                     │  │ Skills            │  ││
│  │ User: "Built a     │  │ Python • React    │  ││
│  │ food delivery app  │  │ • SQL • Git       │  ││
│  │ for college fest"  │  │                   │  ││
│  │                     │  │ Projects          │  ││
│  │ AI: "How many      │  │ Food Delivery App │  ││
│  │ users? What was    │  │ • Built with      │  ││
│  │ your stack?"        │  │   React + Firebase│  ││
│  │                     │  │ • 300+ users      │  ││
│  │ [message input]     │  │                   │  ││
│  │                     │  └──────────────────┘  ││
│  │                     │                         ││
│  │ Section: Projects   │  ATS Score: 74/100     ││
│  │ [●●●○○○] 3/6 done  │  [████████░░░░░░]       ││
│  └─────────────────────┴────────────────────────┘│
└──────────────────────────────────────────────────┘
```

**Sections (sequential state machine):**
1. Personal Info → 2. Education → 3. Skills → 4. Projects → 5. Experience → 6. Achievements → 7. Review

**JD Mode Tab (within builder):**
```
┌──────────────────────────────────────────────────┐
│  [Chat] [JD Match]                               │
│                                                   │
│  Paste Job Description:                           │
│  ┌────────────────────────────────────────────┐  │
│  │ We are looking for a software engineering  │  │
│  │ intern with experience in...               │  │
│  └────────────────────────────────────────────┘  │
│  [Analyze]                                       │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Keyword Match: 72%                        │  │
│  │                                             │  │
│  │  Required Skills:                           │  │
│  │  ✅ Python    ✅ React    ❌ Docker         │  │
│  │  ✅ SQL       ❌ Node.js  ❌ CI/CD          │  │
│  │                                             │  │
│  │  Suggestions:                               │  │
│  │  "Add your basic Node.js experience to     │  │
│  │   improve match by 8%."                     │  │
│  │  [+ Add missing skills to roadmap]          │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**States:**
- **Loading:** Skeleton preview
- **Chat idle:** AI waiting for input
- **AI streaming:** Typing animation in chat, preview updating in real-time
- **Auto-saving:** Badge: "Saved" or "Saving..."
- **JD analysis loading:** Skeleton keyword cards
- **Error:** "Couldn't reach AI. Check your API key."
- **Exporting:** PDF generation spinner → download triggers
- **Empty state (new resume):** "Let's build your resume. Start by telling me your goal."

---

### 2.7 Roadmap (`/roadmap`)

```
┌──────────────────────────────────────────────────┐
│  My Roadmap                         [Recalculate] │
│                                                   │
│  Overall Progress: 43%     Deadline: Dec 1        │
│  [████████░░░░░░░░░]       Buffer: 16 days ✅    │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │  TODAY'S PLAN (2.5 hrs)                      │ │
│  │  ☐ Watch: Binary Trees (Striver 1-8)  1.5hr  │ │
│  │  ☐ Practice: 5 LC problems on Trees   1hr    │ │
│  │  └→ [Mark Complete]                           │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │  WEEK 3 OF 12 — Building Phase               │ │
│  │  Target: Trees & Graphs                       │ │
│  │  Hours this week: 12                          │ │
│  │  [████████░░░░░] 60%                          │ │
│  │                                               │ │
│  │  Mon-Wed: Binary Trees (6hr) ✓ Completed     │ │
│  │  Thu-Fri: Graph BFS/DFS (4hr) 🔄 In Progress │ │
│  │  Weekend: Mini mock (2hr) ⏳                  │ │
│  │                                               │ │
│  │  ☐ Mark Week Complete                        │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Phase Progress:                                  │
│  Foundation  [██████████] 100% ✅                  │
│  Building    [████░░░░░░]  40% 🔄                 │
│  Placement   [░░░░░░░░░░]   0% ⏳                  │
└──────────────────────────────────────────────────┘
```

**States:**
- **No assessment:** "Complete your assessment to generate a roadmap"
- **Generating first time:** Loading spinner with "Building your roadmap..."
- **Roadmap generated:** Full view as shown
- **Week behind schedule:** Yellow warning: "You're behind. Recalculate?"
- **Week on track:** Green indicator
- **Deadline passed:** "Roadmap switched to continuous improvement mode"
- **Recalculating:** "Updating your roadmap based on recent interview..."

---

### 2.8 Interview — Mode Select (`/interview`)

```
┌──────────────────────────────────────────────────┐
│  Mock Interview                                    │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │  TOPIC MODE                                   │ │
│  │  Practice a specific topic                    │ │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐      │ │
│  │  │ DSA     │ │ Sys Des │ │ OS       │      │ │
│  │  └─────────┘ └─────────┘ └──────────┘      │ │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐      │ │
│  │  │ DBMS    │ │ CN      │ │Behavioral│      │ │
│  │  └─────────┘ └─────────┘ └──────────┘      │ │
│  │                                             │ │
│  │  Difficulty: [Auto (from Skill Graph)]       │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │  ROLE MODE                                    │ │
│  │  Simulate a real company interview            │ │
│  │  [SDE] [Data Analyst] [Product] [Finance]    │ │
│  │  Company style: [Top Product] [Service]      │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │  JD MODE (Pro)                                │ │
│  │  Paste a JD, get a tailored interview        │ │
│  │  [________________________] [Start]          │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Session: [15 min] [30 min] [45 min]              │
│  Persona: [Friendly] [Neutral] [Tough]            │
│                                                   │
│  [Start Interview]                                │
└──────────────────────────────────────────────────┘
```

**States:**
- **No interviews yet:** "First interview? Don't worry, we start easy."
- **Has history:** "Your last score: 68/100. Ready to beat it?"
- **JD Mode for free users:** Lock icon with "Pro feature" tooltip
- **No API key:** "AI interviews require an API key. Set up in Settings."

---

### 2.9 Interview — Pre-Flight (`/interview/session/new`)

```
┌──────────────────────────────────────────────────┐
│  Let's check your setup                           │
│                                                   │
│  Camera 📷                                       │
│  ┌──────────────────────────────────────────────┐ │
│  │  [Webcam preview]                             │ │
│  │  Face detected ✅   Lighting: Good ✅         │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Microphone 🎤                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Audio level: [████░░░░░░]                   │ │
│  │  "Speak now to test..."                       │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  🔒 Privacy: Camera and mic stay on your device. │ │
│  Nothing is uploaded or recorded.                 │ │
│                                                   │
│  [Back] [Start Interview →]                       │
└──────────────────────────────────────────────────┘
```

**States:**
- **Camera denied:** "Camera access denied. You can still practice with typed answers."
- **Mic denied:** "Mic access denied. Type your answers instead."
- **All good:** Green checkmarks, ready to start
- **Loading:** Permission prompts showing

---

### 2.10 Interview — Live Session (`/interview/session/[id]`)

```
┌──────────────────────────────────────────────────┐
│  Q 2/6   |   25:30 remaining                      │
│                                                   │
│  ┌──────────────┐   ┌──────────────────────────┐ │
│  │  [Student    │   │  LIVE METRICS             │ │
│  │   Webcam]    │   │  Eye Contact: 78% ●      │ │
│  │              │   │  Pace: 142 WPM ✅         │ │
│  │  [Soft eye   │   │  Fillers: 3 ⚠️            │ │
│  │   contact    │   │  Conf: 63%                │ │
│  │   guide      │   │                           │ │
│  │   ring]      │   │  Topic: Arrays/2 Pointers │ │
│  └──────────────┘   └──────────────────────────┘ │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │                                              │ │
│  │  "You mentioned using React for your          │ │
│  │   project. How did you handle state           │ │
│  │   management at scale?"                       │ │
│  │                                              │ │
│  │  ┌──────────────────────────────────────────┐│ │
│  │  │  [Live captions of student's answer...]  ││ │
│  │  └──────────────────────────────────────────┘│ │
│  │                                              │ │
│  │  [I'm done answering]  [I need a moment]     │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  [End Interview]                                  │
└──────────────────────────────────────────────────┘
```

**States:**
- **Question displayed, waiting for answer:** Listening indicator pulsing
- **Student speaking:** Live captions updating, metrics active
- **Student paused:** "Take your time" after 5s silence
- **"I need a moment":** 30s pause timer
- **Answer complete:** Brief processing indicator, then next question
- **End interview:** Confirmation dialog, then redirect to report
- **Connection lost:** "Reconnecting..." toast
- **API key invalid mid-session:** "Your API key failed. The session will end with available data."

---

### 2.11 Interview — Report (`/interview/report/[id]`)

```
┌──────────────────────────────────────────────────┐
│  Interview Report                                 │
│  Role: SDE Intern · 28 min · 6 questions          │
│                                                   │
│  ┌──────────┐                                     │
│  │  71/100  │  "Strong technical foundation.      │
│  │  Overall │   Communication needs work."        │
│  │  Score   │                                     │
│  └──────────┘                                     │
│                                                   │
│  Communication                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Eye Contact   ████████░░ 78%    Trend: +8%  │ │
│  │ Pace          ████████░░ 142 WPM (Good)     │ │
│  │ Fillers       ██░░░░░░░░ um(12) basically(8)│ │
│  │ Confidence    ██████░░░░ 63%                │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Technical Performance                            │
│  ┌──────────────────────────────────────────────┐ │
│  │ Q1 Arrays/Two Pointers     ●●●●○  4/5       │ │
│  │ Q2 Binary Tree Traversal   ●●●●●  5/5       │ │
│  │ Q3 System Design           ●●○○○  2/5       │ │
│  │ Q4 Behavioural             ●●●○○  3/5       │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Top 3 Things to Fix                              │
│  1. System Design — Practice 2 designs/week       │
│  2. Filler words — Daily 2-min recording drill    │
│  3. STAR endings — Always state what you learned  │
│                                                   │
│  [Share Report] [Retry] [Update Roadmap →]        │
└──────────────────────────────────────────────────┘
```

**States:**
- **Generating:** Loading spinner "Analyzing your interview..."
- **Ready:** Full report as shown
- **No previous report:** "This is your first interview. No trend data yet."

---

### 2.12 Settings (`/settings`)

```
┌──────────────────────────────────────────────────┐
│  Settings                                          │
│                                                   │
│  Profile                                          │
│  ┌──────────────────────────────────────────────┐ │
│  │ Name: Rahul Sharma                           │ │
│  │ College: BITS Pilani                         │ │
│  │ Degree: B.Tech CSE · 2026                    │ │
│  │ [Edit]                                       │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  AI Provider                                      │
│  ┌──────────────────────────────────────────────┐ │
│  │ Provider: Groq  ✅ Connected                 │ │
│  │ Key:  sk-...f3k2   [Change] [Remove]        │ │
│  │                                               │ │
│  │ [Test Connection]                             │ │
│  │                                               │ │
│  │ Trial: 15/20 requests remaining              │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Data                                             │
│  ┌──────────────────────────────────────────────┐ │
│  │ [Export All Data]                            │ │
│  │ [Delete Account]                             │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**States:**
- **Key not set:** "No API key configured. Set one up for unlimited AI usage."
- **Key invalid:** "Your key failed validation. Check it or try a different provider."
- **Key set and valid:** Connected badge with provider name
- **Trial active:** Remaining count shown

---

## 3. Cross-Module Event Flows

```
resume.skills_updated
  → SkillGraph.upsert({ skill, confidence: source })
  → roadmap.recalc(soft)

jd.analyzed
  → SkillGraph.addGaps(missingSkills)
  → roadmap.recalc(soft)

interview.completed
  → SkillGraph.updateConfidence({ skill, delta: fromScores })
  → SkillGraph.addWeaknesses(weakAreas, { priority: high })
  → roadmap.recalc(hard)
  → dashboard.refresh()

roadmap.task_completed
  → SkillGraph.updateConfidence({ skill, delta: +0.1 })
  → interview.difficultyScale(task.topic, +1)

onboarding.completed
  → roadmap.generate(initial)
  → dashboard.populate()
```

**Recalc types:**
- `soft` = reprioritize existing tasks, no new AI call
- `hard` = AI generates new weeks, may restructure upcoming 2 weeks

---

## 4. Empty States Guide

| Page | Empty State |
|---|---|
| `/resume` | "No resumes yet. Build your first one." + big CTA |
| `/roadmap` | "Complete the assessment to get your roadmap." |
| `/interview` | "No interview history. Take your first mock interview." |
| `/dashboard/resume card` | "ATS Score: — Create a resume to see your score" |
| `/dashboard/interview card` | "No data yet. Take your first interview." |
| `/dashboard/skills card` | "Complete your assessment to see skill gaps." |
| Resume builder (new) | "Tell me your goal — job, placement season, or research?" |
| Pre-flight (no cam/mic) | "No camera or mic? You can still practice with typed answers." |

---

## 5. Error States Guide

| Scenario | Message | Action |
|---|---|---|
| AI key invalid | "Your API key failed. Check it in Settings." | Link to Settings |
| AI provider down | "Provider is unreachable. Try another provider or try again." | Provider switcher |
| Rate limited | "Too many requests. Wait a moment." | Auto-retry countdown |
| Network offline | "You're offline. Your data is saved locally." | Reconnect indicator |
| Save failed | "Couldn't save. Trying again..." | Auto-retry |
| PDF generation failed | "Couldn't generate PDF. Try again." | Retry button |
| Trial exhausted | "You've used all 20 free requests. Add your API key." | Link to BYOK setup |
| Session expired | "Your session expired. Please log in again." | Redirect to login |
