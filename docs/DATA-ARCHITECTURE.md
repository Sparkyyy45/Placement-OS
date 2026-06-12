# PlacementOS — Data Architecture

## 1. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────────────
// USER
// ──────────────────────────────────────────────

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  avatarUrl     String?

  // College info
  college       String?
  degree        String?
  graduationYear Int?

  // Onboarding / assessment
  targetRole         String?    // "sde" | "data-analyst" | "ba" | "consultant" | "core-engg" | "finance" | "pm"
  targetCompanyTier  String?    // "top-product" | "mid-product" | "service" | "startup" | "psu" | "open"
  placementDate      DateTime?
  dailyHoursAvailable Int?      // 1 | 2 | 3 | 4+
  onboardingComplete  Boolean   @default(false)
  onboardingSkipped   Boolean   @default(false)

  // AI provider preference (NOT the key — stored in localStorage)
  preferredProvider  String?    // "groq" | "openrouter" | "gemini"

  // Trial
  trialQuotaUsed     Int        @default(0)
  trialResetsAt      DateTime?  // When quota resets (if we implement monthly reset)
  trialExhausted     Boolean    @default(false)

  // Auth
  supabaseUserId     String?    @unique // Maps to Supabase Auth user ID

  // Timestamps
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  resumes        Resume[]
  interviewSessions InterviewSession[]
  roadmaps       Roadmap[]
  skillGraph     SkillGraphEntry[]
  trialUsages    TrialUsage[]
  deletedAccount  Boolean   @default(false)
}

// ──────────────────────────────────────────────
// RESUME
// ──────────────────────────────────────────────

model Resume {
  id        String   @id @default(cuid())
  userId    String
  name      String   @default("My Resume")
  templateId String  @default("classic") // "classic" | "modern" | "technical"

  // Resume data stored as JSON for flexibility
  sections  ResumeSections  // Personal, Education, Skills, Projects, Experience, Achievements

  // JD analysis
  targetJd       String?     @db.Text  // Raw JD text
  jdAnalysis     JdAnalysis?           // Keyword match, gaps, suggestions

  // ATS score
  atsScore       AtsScore?

  // Metadata
  version        Int        @default(1)
  isArchived     Boolean    @default(false)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  // Relations
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  versions  ResumeVersion[]
}

model ResumeSections {
  id           String   @id @default(cuid())
  resumeId     String   @unique
  resume       Resume   @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  personal     PersonalInfo?
  education    EducationInfo?
  skills       SkillInfo?
  projects     ProjectInfo?
  experience   ExperienceInfo?
  achievements AchievementInfo?
}

model PersonalInfo {
  id          String  @id @default(cuid())
  sectionsId  String  @unique
  sections    ResumeSections @relation(fields: [sectionsId], references: [id], onDelete: Cascade)

  fullName    String?
  email       String?
  phone       String?
  linkedin    String?
  github      String?
  portfolio   String?
  location    String?
}

model EducationInfo {
  id          String  @id @default(cuid())
  sectionsId  String  @unique
  sections    ResumeSections @relation(fields: [sectionsId], references: [id], onDelete: Cascade)

  entries Json @default("[]") // Array of: { college, degree, field, startYear, endYear, gpa, coursework }
}

model SkillInfo {
  id          String  @id @default(cuid())
  sectionsId  String  @unique
  sections    ResumeSections @relation(fields: [sectionsId], references: [id], onDelete: Cascade)

  // Categorized skills from AI extraction
  languages   String[] @default([])
  frameworks  String[] @default([])
  databases   String[] @default([])
  tools       String[] @default([])
  cloud       String[] @default([])
  other       String[] @default([])
}

model ProjectInfo {
  id          String  @id @default(cuid())
  sectionsId  String  @unique
  sections    ResumeSections @relation(fields: [sectionsId], references: [id], onDelete: Cascade)

  entries Json @default("[]") // Array of: { name, description, bullets: string[], techStack: string[], url? }
}

model ExperienceInfo {
  id          String  @id @default(cuid())
  sectionsId  String  @unique
  sections    ResumeSections @relation(fields: [sectionsId], references: [id], onDelete: Cascade)

  entries Json @default("[]") // Array of: { company, role, startDate, endDate, bullets: string[], location? }
}

model AchievementInfo {
  id          String  @id @default(cuid())
  sectionsId  String  @unique
  sections    ResumeSections @relation(fields: [sectionsId], references: [id], onDelete: Cascade)

  entries Json @default("[]") // Array of: { type: "cp" | "hackathon" | "research" | "por" | "opensource", title, description }
}

model ResumeVersion {
  id        String   @id @default(cuid())
  resumeId  String
  resume    Resume   @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  snapshot  Json     // Full copy of sections at this version
  createdAt DateTime @default(now())
}

model JdAnalysis {
  id              String  @id @default(cuid())
  resumeId        String  @unique
  resume          Resume  @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  requiredSkills  String[] @default([])
  preferredSkills String[] @default([])
  matchedSkills   String[] @default([])
  missingSkills   String[] @default([])
  keywords        String[] @default([])
  responsibilities String[] @default([])
  matchScore      Int?
  suggestions     String[] @default([])
  rawAnalysis     Json?    // Full AI analysis for reference
  createdAt       DateTime @default(now())
}

model AtsScore {
  id        String @id @default(cuid())
  resumeId  String @unique
  resume    Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  keywordMatch  Int @default(0)   // 0-100
  formatScore   Int @default(0)   // 0-100
  contentScore  Int @default(0)   // 0-100
  readability   Int @default(0)   // 0-100
  overall       Int @default(0)   // 0-100 (weighted composite)

  keywordDetails   Json?  // { found: string[], missing: string[], suggestions: string[] }
  formatDetails    Json?  // { tables: boolean, columns: boolean, fonts: string, headings: boolean }
  contentDetails   Json?  // { metricsCount: number, actionVerbs: string[], weakBullets: string[] }
  readabilityDetails Json? // { dateFormat: string, spellingErrors: string[], hierarchy: string }

  updatedAt DateTime @updatedAt
}

// ──────────────────────────────────────────────
// INTERVIEW SESSION
// ──────────────────────────────────────────────

model InterviewSession {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  mode      String   // "topic" | "role" | "jd"
  config    Json     // { topic, difficulty, duration, persona, role, companyStyle, jd? }

  // Session data
  transcript Json    // { qaPairs: [{ questionId?, question, answer, score, feedback, followUp, timestamp }] }
  metrics    Json    // { eyeContactAvg, paceAvg, fillerWords: { word, count }[], confidenceAvg }
  scores     Json    // { perQuestion: { qIndex, score, maxScore }[], overall, communication, technical }

  // Report
  report         Json?   // Full coaching report (generated by AI)
  reportSummary  String? // Short version for dashboard

  duration       Int?    // Actual duration in seconds
  completedAt    DateTime?
  createdAt      DateTime @default(now())
}

// ──────────────────────────────────────────────
// ROADMAP
// ──────────────────────────────────────────────

model Roadmap {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Generation config
  config   Json     // { role, tier, timelineWeeks, dailyHours, skillLevels }

  // Roadmap data
  phases   Json     // [{ name: "foundation"|"building"|"placement", weeks: [weekIndex, weekIndex], status }]
  weeks    Json     // [{ weekNumber, phase, theme, totalHours, tasks: [{ id, topic, resource, hours, status, days }] }]
  progress Json     // { phaseCompletions: { phase, pct }, topicsMastered: string[], avgInterviewScore, projectedReadyDate }

  // Recalculation tracking
  lastRecalculated      DateTime?
  recalculationReason   String?  // "initial" | "interview" | "jd_gaps" | "drift" | "manual"
  recalculationCount    Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ──────────────────────────────────────────────
// SKILL GRAPH
// ──────────────────────────────────────────────

model SkillNode {
  id        String   @id @default(cuid())
  name      String
  category  String   // "dsa" | "system-design" | "core-cs" | "language" | "framework" | "behavioral" | "domain"
  difficulty Int     @default(1)  // 1-5

  // Prerequisites
  prerequisiteIds String[] @default([])
  // Stored as array of skill node IDs for simple traversal
  // Full graph traversal logic in application code

  source    String   @default("seed") // "seed" | "community" | "jd-extracted"
  isActive  Boolean  @default(true)

  createdAt DateTime @default(now())
}

model SkillGraphEntry {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  skillNodeId String
  skillNode   SkillNode @relation(fields: [skillNodeId], references: [id])

  confidence  Float    @default(0.0)   // 0.0 - 1.0 (Bayesian)
  source      String   @default("self-report") // "self-report" | "resume" | "interview" | "roadmap"
  lastPracticed DateTime?
  timesScoredBelow50 Int @default(0)

  // Metadata
  lastUpdated DateTime @updatedAt

  @@unique([userId, skillNodeId])
}

// ──────────────────────────────────────────────
// TRIAL USAGE
// ──────────────────────────────────────────────

model TrialUsage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  requestCount Int   @default(0)
  date        DateTime @default(now())

  @@unique([userId, date])
}

// ──────────────────────────────────────────────
// FEEDBACK / REPORTING (for quality monitoring)
// ──────────────────────────────────────────────

model AISuggestionFeedback {
  id            String   @id @default(cuid())
  userId        String
  feature       String   // "resume-bullet" | "interview-score" | "roadmap-task"
  suggestionId  String?
  rating        Int      // 1-5 thumbs up/down
  comment       String?
  createdAt     DateTime @default(now())
}

model ResourceSuggestion {
  id          String   @id @default(cuid())
  userId      String
  topic       String
  title       String
  url         String
  type        String   // "video" | "article" | "practice" | "book"
  estimatedHours Float?
  createdAt   DateTime @default(now())
}
```

---

## 2. API Route Design (Full Spec)

### 2.1 Middleware

All API routes (except auth) run through:
1. **Auth check** — Validate Supabase session token via `createRouteHandlerClient`
2. **CORS** — Restrict to app origin
3. **Rate limiting** — Check Upstash Redis (30 req/min per user for AI, 100 req/min for CRUD)

### 2.2 Route Specifications

#### AI Routes

```
POST /api/ai/chat
  Auth: Required
  Headers: x-api-key (optional — for BYOK), x-provider (default: "groq")
  Body: { section: ChatSection, messages: Message[], resumeState: ResumeSections }
  Response: SSE stream (text)
  Rate limit: 30/min per user

POST /api/ai/analyze
  Auth: Required
  Headers: x-api-key, x-provider
  Body: { jd: string, resume: ResumeSections }
  Response: JdAnalysis JSON
  Rate limit: 20/min per user

POST /api/ai/score  (for single interview answer)
  Auth: Required
  Headers: x-api-key, x-provider
  Body: { question: string, answer: string, difficulty: string, topic: string, questionIdealAnswer?: string }
  Response: { correctness, depth, structure, feedback, followUp }
  Rate limit: 30/min per user

POST /api/ai/roadmap
  Auth: Required
  Headers: x-api-key, x-provider
  Body: { action: "generate"|"recalculate", assessment?: Assessment, skillGraph?: SkillGraphState, reason: string }
  Response: { phases, weeks, progress }
  Rate limit: 5/min per user

POST /api/ai/validate-key
  Auth: Required (or no auth for pre-login setup)
  Headers: x-api-key, x-provider
  Body: {}
  Response: { valid: boolean, model?: string, error?: string }
  Rate limit: 5/min per IP

POST /api/ai/generate-report  (full interview report)
  Auth: Required
  Headers: x-api-key, x-provider
  Body: { transcript: QAPair[], metrics: Metrics, mode: string, config: Json }
  Response: Report JSON
  Rate limit: 10/min per user
```

#### Resume CRUD

```
GET /api/resume
  Auth: Required
  Query: ?archived=false
  Response: Resume[] (without sections JSON for list view)

POST /api/resume
  Auth: Required
  Body: { name?: string, templateId?: string }
  Response: Resume (new)

GET /api/resume/[id]
  Auth: Required (owner only)
  Response: Resume (full, with sections, jdAnalysis, atsScore)

PATCH /api/resume/[id]
  Auth: Required (owner only)
  Body: Partial<Resume> (sections, name, templateId, etc.)
  Response: Resume (updated)

DELETE /api/resume/[id]
  Auth: Required (owner only)
  Response: { success: true }
```

#### Interview CRUD

```
GET /api/interview
  Auth: Required
  Query: ?limit=10&offset=0
  Response: InterviewSession[] (summary: mode, config, scores.overall, createdAt)

POST /api/interview
  Auth: Required
  Body: { mode, config }
  Response: InterviewSession (id, created)

GET /api/interview/[id]
  Auth: Required (owner only)
  Response: InterviewSession (full with transcript, metrics, report)

PATCH /api/interview/[id]
  Auth: Required (owner only)
  Body: { transcript?, metrics?, scores?, report?, completedAt? }
  Response: InterviewSession (updated)
```

#### Roadmap CRUD

```
GET /api/roadmap
  Auth: Required
  Response: Roadmap | null

POST /api/roadmap
  Auth: Required
  Body: { action: "generate", assessment: Assessment }
  Response: Roadmap

PATCH /api/roadmap
  Auth: Required
  Body: { progress?: Json, weeks?: Json }
  Response: Roadmap (updated)
```

#### Trial Quota

```
GET /api/trial
  Auth: Required
  Response: { used: number, remaining: number, limit: number, exhausted: boolean }

POST /api/trial/consume
  Auth: Required
  Response: { success: boolean, remaining: number }
  (Returns error if exhausted)
```

---

## 3. Redis Schema (Upstash)

Used for rate limiting and ephemeral caching only.

```
// Rate limiting
Key:  "ratelimit:{userId}:{endpoint}"
Value:  { count: number, resetAt: timestamp }
TTL:  60 seconds

// Session rate limiting (total AI calls)
Key:  "ratelimit:ai:{userId}"
Value:  { count: number, resetAt: timestamp }
TTL:  60 seconds

// Trial usage dedup (prevent concurrent consumption)
Key:  "lock:trial:{userId}"
Value:  "1"
TTL:  5 seconds

// Interview session cache (for real-time sync)
Key:  "interview:{sessionId}"
Value:  { currentQuestion, metrics, elapsed }
TTL:  3600 seconds (1 hour)
```

---

## 4. Data Flow: Skill Graph Updates

### 4.1 Update Rules

```
On resume.skills_updated:
  For each skill in resume.skills:
    confidence = max(existing.confidence, 0.5)  // Resume suggests at least "comfortable"
    source = "resume"

On interview.completed:
  For each question score:
    if score >= 4: confidence += 0.1 (cap at 1.0)
    if score <= 2: confidence -= 0.15 (floor at 0.05)
    timesScoredBelow50 += (score <= 2 ? 1 : 0)
    source = "interview"

On roadmap.task_completed:
  confidence += 0.05 (cap at 1.0)
  source = "roadmap"
  lastPracticed = now()

On jd.analyzed:
  For each missingSkill:
    if skillNode doesn't exist for user: create with confidence 0.1
    source = "jd-extracted"

On self-report (onboarding):
  if "Beginner": confidence = 0.25
  if "Comfortable": confidence = 0.5
  if "Strong": confidence = 0.75
  source = "self-report"
```

### 4.2 Roadmap Recalc Trigger Logic

```
soft recalc (reprioritize):
  - Resume skills updated
  - JD analyzed
  - Single task completed
  Action: Reorder existing tasks based on updated confidence

hard recalc (regenerate 2 weeks):
  - Interview completed with weak areas found
  - Timer-based weekly drift check
  - Manual user request
  Action: Call AI to regenerate weeks from current point
```

---

## 5. Storage Strategy (Supabase Storage)

```
Bucket: "resume-exports"
  Path: /{userId}/{resumeId}/{version}.pdf
  Public: false (generated on-demand)
  TTL: 24 hours (cleanup old exports)

Bucket: "user-avatars"
  Path: /{userId}/avatar.{ext}
  Public: true
```

---

## 6. Indexes

```sql
-- Performance indexes for common queries
CREATE INDEX idx_resume_userId ON "Resume"("userId");
CREATE INDEX idx_resume_updatedAt ON "Resume"("updatedAt");
CREATE INDEX idx_interview_userId ON "InterviewSession"("userId");
CREATE INDEX idx_interview_createdAt ON "InterviewSession"("createdAt");
CREATE INDEX idx_skill_graph_userId ON "SkillGraphEntry"("userId");
CREATE INDEX idx_trial_userId_date ON "TrialUsage"("userId", "date");
CREATE INDEX idx_skill_node_category ON "SkillNode"("category");
```
