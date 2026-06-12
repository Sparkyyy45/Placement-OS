# PlacementOS — AI Architecture

## 1. Provider Abstraction

### 1.1 Provider Factory Pattern

Uses Vercel AI SDK v3+ for provider-agnostic AI calls. Each provider is configured as a separate client, and the app switches between them based on the user's preference.

```typescript
// src/lib/ai/provider.ts

import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

type Provider = 'groq' | 'openrouter' | 'gemini';

interface ProviderConfig {
  name: string;
  displayName: string;
  models: {
    chat: string;
    analysis: string;
    scoring: string;
    fast: string;
  };
  defaultModel: string;
  isFree: boolean;  // Is the provider's free tier sufficient?
  setupGuide: {
    steps: { title: string; description: string }[];
    signupUrl: string;
    keyPageUrl: string;
  };
}

const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  groq: {
    name: 'groq',
    displayName: 'Groq',
    models: {
      chat: 'llama-3.3-70b-versatile',
      analysis: 'llama-3.3-70b-versatile',
      scoring: 'llama-3.3-70b-versatile',
      fast: 'llama-3.1-8b-instant',
    },
    defaultModel: 'llama-3.3-70b-versatile',
    isFree: true,
    setupGuide: {
      steps: [
        { title: 'Go to groq.com', description: 'Open console.groq.com' },
        { title: 'Sign up', description: 'Use your college email' },
        { title: 'Create API key', description: 'Click "Create API Key"' },
        { title: 'Copy the key', description: 'It starts with "gsk_"' },
      ],
      signupUrl: 'https://console.groq.com',
      keyPageUrl: 'https://console.groq.com/keys',
    },
  },
  openrouter: {
    name: 'openrouter',
    displayName: 'OpenRouter',
    models: {
      chat: 'mistralai/mixtral-8x22b-instruct',
      analysis: 'mistralai/mixtral-8x22b-instruct',
      scoring: 'mistralai/mixtral-8x22b-instruct',
      fast: 'mistralai/mistral-7b-instruct',
    },
    defaultModel: 'mistralai/mixtral-8x22b-instruct',
    isFree: true,
    setupGuide: {
      steps: [
        { title: 'Go to openrouter.ai', description: 'Open openrouter.ai/keys' },
        { title: 'Sign up', description: 'GitHub or Google OAuth' },
        { title: 'Create key', description: 'Click "Create Key"' },
        { title: 'Copy the key', description: 'It starts with "sk-or-"'},
      ],
      signupUrl: 'https://openrouter.ai',
      keyPageUrl: 'https://openrouter.ai/keys',
    },
  },
  gemini: {
    name: 'gemini',
    displayName: 'Google AI Studio',
    models: {
      chat: 'gemini-2.0-flash',
      analysis: 'gemini-2.0-flash',
      scoring: 'gemini-2.0-flash',
      fast: 'gemini-2.0-flash-lite',
    },
    defaultModel: 'gemini-2.0-flash',
    isFree: true,
    setupGuide: {
      steps: [
        { title: 'Go to aistudio.google.com', description: 'Open Google AI Studio' },
        { title: 'Sign in', description: 'Use your Google account' },
        { title: 'Get API key', description: 'Go to "Get API Key"' },
        { title: 'Copy the key', description: 'It starts with "AIza"' },
      ],
      signupUrl: 'https://aistudio.google.com',
      keyPageUrl: 'https://aistudio.google.com/app/apikey',
    },
  },
};

function createProviderClient(provider: Provider, apiKey: string) {
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
```

### 1.2 Fallback Chain

If the user's preferred provider fails, the app auto-falls back:

```
1. User's preferred provider
2. If 401/403 → Show "Invalid key" error (don't fallback — user needs to fix key)
3. If 429/500/timeout → Try next provider in chain
4. If all fail → "All providers unreachable. Try again later."
```

---

## 2. BYOK Flow

### 2.1 Key Storage

```
User enters API key in Settings or Onboarding
  → Stored in localStorage under key: "placementos:apiKey:{provider}"
  → NEVER sent to server except as request header
  → Key is encrypted at rest in localStorage (simple XOR or AES-GCM via Web Crypto API)
  
Key retrieval:
  const key = localStorage.getItem(`placementos:apiKey:${provider}`);
  // Decrypt if encrypted
  
Key on AI request:
  fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'x-provider': provider,
    },
    body: JSON.stringify(payload),
  });
```

### 2.2 Key Validation

```
POST /api/ai/validate-key
  Headers: x-api-key, x-provider

  Server:
    1. Create provider client with key
    2. Make minimal test call (e.g., "Reply with just the word OK")
    3. If success → { valid: true, model: "llama-3.3-70b" }
    4. If failure → { valid: false, error: "Invalid API key" }

  Client:
    1. If valid → Show green checkmark, save key to localStorage
    2. If invalid → Show error: "This key doesn't work. Check the provider."
```

### 2.3 Trial Quota Logic

```
Server-side (Supabase + Upstash):

  On each AI request WITHOUT a valid BYOK key:
    1. Check TrialUsage for today (or total count)
    2. If used >= 20 → return 402 Payment Required
    3. Otherwise, increment counter
    4. Proceed with request using platform key

  Edge case handling:
    - Multiple simultaneous requests: Use Redis lock (5s TTL)
    - Trial exhausted mid-conversation: Complete current response, then show upgrade prompt
    - Trial usage across devices: Server-side tracking via Supabase (source of truth)
```

---

## 3. Prompt Architecture

### 3.1 Prompt Structure

All prompts follow a consistent structure:

```
SYSTEM: [Role definition + constraints + output format]
CONTEXT: [Current state — resume JSON, assessment data, etc.]
HISTORY: [Conversation history for chat flows]
INSTRUCTION: [Specific instruction for this call]
OUTPUT: [Expected format — JSON schema or text description]
```

### 3.2 Resume Builder Prompts

**System Prompt (set once per session):**
```
You are PlacementOS AI, a resume building assistant for college students in India.
Your goal is to help the student build an ATS-optimized resume through conversation.

Rules:
1. Ask ONE question at a time. Never ask multiple questions.
2. Extract structured data from the student's natural language responses.
3. When the student mentions a project or experience, always probe for:
   - Technology stack
   - Specific challenge faced
   - Measurable impact (users, performance %, time saved)
   - Team size and your role
4. Format bullets as: {Strong Action Verb} + {What you did} + {Measurable Impact}
5. For skills: auto-categorize into Languages/Frameworks/Databases/Tools/Cloud
6. Cross-reference with JD if available and suggest missing key skills.
7. Keep your responses under 3 sentences. Be conversational but concise.
8. Never write more than 3 bullet points per project/experience entry.

Current section: {section}
Resume sections completed: {completedSections}
```

**Project Probing Prompt:**
```
The student mentioned a project: "{projectName}"

Probe for:
1. What tech stack did you use? (languages, frameworks, databases)
2. What was the hardest technical challenge?
3. How many users or what scale?
4. What measurable impact? (x% faster, y users, z% reduction)

Format the response as a single question asking for one of these.
Previous answer context: {lastResponse}
```

**Bullet Enhancement Prompt:**
```
Original bullet: "{bullet}"

Rewrite this bullet following the formula:
Action Verb + Task + Measurable Impact

Constraints:
- Start with a strong action verb (Built, Developed, Optimized, Designed, Implemented, Led)
- Include a specific technology or method
- Include a number or measurable outcome
- Keep under 25 words
- One sentence only

Respond with ONLY the rewritten bullet.
```

**ATS Score Prompt:**
```
Analyze this resume section for ATS compatibility:

Resume Data: {resumeJson}
JD Keywords: {jdKeywords} (if available)

Score each dimension 0-100:
1. KEYWORD MATCH: What % of important keywords are present?
2. FORMAT QUALITY: No tables? Standard fonts? Clear headings?
3. CONTENT QUALITY: Are bullets quantified? Action verbs used?
4. READABILITY: Consistent format? No errors?

Return JSON:
{
  "keywordMatch": number,
  "formatScore": number,
  "contentScore": number,
  "readability": number,
  "keywordDetails": { "found": string[], "missing": string[], "suggestions": string[] },
  "contentDetails": { "metricsCount": number, "weakBullets": string[] },
  "suggestions": string[]
}
```

### 3.3 Interview Prompts

**Question Generation Prompt:**
```
Generate an interview question for topic: {topic}
Difficulty: {difficulty} (1-5, based on student's Skill Graph confidence)
Previous questions asked this session: {previousQuestions}

Return JSON:
{
  "question": string,
  "expectedAnswerOutline": string[],
  "commonMistakes": string[],
  "difficulty": number,
  "followUpQuestions": string[]
}
```

**Answer Scoring Prompt:**
```
Score this interview answer:

Topic: {topic}
Difficulty: {difficulty}
Question: {question}
Expected answer outline: {expectedOutline}
Student's answer: {answer}

Score each dimension 1-5:
1. CORRECTNESS: Is the answer technically accurate? (1=completely wrong, 5=perfect)
2. DEPTH: Does it show deep understanding or surface-level? (1=shallow, 5=comprehensive)
3. STRUCTURE: Is the answer well-organized? (1=rambling, 5=clear structure)

Return JSON:
{
  "correctness": number,
  "depth": number,
  "structure": number,
  "feedback": string,        // 1-2 sentence actionable feedback
  "whatGoodLooksLike": string, // Brief description of an excellent answer
  "followUpQuestion": string   // Next question to ask (harder if good answer, hint if struggling)
}
```

**Full Report Generation Prompt:**
```
Generate a coaching report from this interview session:

Session config: {config}
Q&A pairs: {transcript}
Metrics: {metrics}

Return JSON:
{
  "overallScore": number,       // 0-100
  "communicationScore": number,
  "technicalScore": number,
  "perQuestionScores": [{ "questionIndex": number, "score": number, "maxScore": number, "feedback": string }],
  "metricsSummary": { "eyeContact": string, "pace": string, "fillers": string, "confidence": string },
  "top3Weaknesses": [{ "area": string, "reason": string, "drill": string }],
  "comparisonToPrevious": { "eyeContact": number, "technical": number, "communication": number, "fillers": number },
  "recommendedTopics": string[]   // Topics to practice next
}
```

### 3.4 Roadmap Prompts

**Roadmap Generation Prompt:**
```
Generate a personalized placement preparation roadmap.

Student Profile:
- Target Role: {role}
- Target Company Tier: {tier}
- Placement Season: {weeksRemaining} weeks away
- Daily Hours Available: {hours}
- Current Skill Levels: {skillLevels}

Generate a {weeksRemaining}-week roadmap divided into 3 phases:
1. Foundation (first 30% of time)
2. Building (middle 40%)
3. Placement Mode (last 30%)

For each week, provide:
- Theme/focus area
- Specific topics to cover
- Resources (video playlists, articles, practice platforms)
- Estimated hours
- 1 checkpoint (mini mock interview or revision)

Rules:
- One best resource per topic, not 10
- Free resources only (YouTube, free articles, LeetCode free)
- Time-estimate each resource accurately
- Prioritize topics based on: interview frequency × student's gap
- Final 2 weeks should be mostly mocks + revision

Return JSON:
{
  "phases": [{ "name": string, "weeks": number[], "description": string }],
  "weeks": [{ 
    "weekNumber": number,
    "phase": string,
    "theme": string,
    "totalHours": number,
    "tasks": [{ 
      "id": string,
      "topic": string,
      "type": "learn" | "practice" | "mock",
      "resource": { "title": string, "url": string, "type": "video"|"article"|"practice", "estimatedMinutes": number },
      "scheduledDays": string[],
      "estimatedHours": number 
    }]
  }]
}
```

**Roadmap Recalc Prompt (hard):**
```
The student's roadmap needs recalculation.

Current roadmap: {currentWeeks}
Current progress: {progress}
Reason for recalc: {reason}
- If interview: recent weak areas = {weakAreas}
- If JD gaps: missing skills = {missingSkills}
- If ahead/behind: {driftDays} days {ahead|behind}

Regenerate weeks from the CURRENT POINT (week {currentWeek}) onward.
Do not change completed weeks.
Prioritize weak areas by moving them earlier.
If behind schedule, reduce less important topics.

Return the same JSON schema as generation, but only for remaining weeks.
```

---

## 4. Model Configuration

### 4.1 Temperature Settings by Task

| Task | Model | Temperature | Max Tokens |
|---|---|---|---|
| Resume chat | `llama-3.3-70b-versatile` | 0.7 | 512 |
| Bullet enhancement | `llama-3.3-70b-versatile` | 0.5 | 200 |
| JD analysis | `llama-3.3-70b-versatile` | 0.3 | 1024 |
| ATS scoring | `llama-3.3-70b-versatile` | 0.2 | 1024 |
| Question generation | `llama-3.3-70b-versatile` | 0.7 | 512 |
| Answer scoring | `llama-3.3-70b-versatile` | 0.3 | 512 |
| Report generation | `llama-3.3-70b-versatile` | 0.4 | 2048 |
| Roadmap generation | `llama-3.3-70b-versatile` | 0.5 | 2048 |
| Roadmap recalc | `llama-3.3-70b-versatile` | 0.4 | 2048 |

### 4.2 Cost Analysis (Student's Key)

| Provider | Model | Cost per 1K tokens (input) | Cost per 1K tokens (output) | Avg session cost |
|---|---|---|---|---|
| **Groq** | Llama 3.3 70B | $0.59 | $0.79 | ~$0.002 |
| **OpenRouter** | Mixtral 8x22B | $0.90 | $0.90 | ~$0.003 |
| **Gemini** | 2.0 Flash | Free | Free | $0 |

**Per feature cost estimate:**
- Resume builder (full conversation): ~5,000 tokens → ~$0.004
- JD analysis: ~2,000 tokens → ~$0.0015
- Single interview answer scoring: ~1,000 tokens → ~$0.001
- Full interview (6 questions + report): ~15,000 tokens → ~$0.01
- Roadmap generation: ~4,000 tokens → ~$0.003

**Essentially free for the student.** Even on Groq (most expensive listed), 100 full interview sessions cost ~$1.00.

---

## 5. Trial Quota — Platform Key Management

For the 20 free requests, the app uses a single platform API key stored in environment variables:

```
PLATFORM_GROQ_KEY=gsk_...
PLATFORM_OPENROUTER_KEY=sk-or-...
PLATFORM_GEMINI_KEY=AIza...
```

These keys are:
- Stored in Vercel environment variables (never in code)
- Used ONLY for trial requests
- Rotatable if compromised
- Rate-limited per user (30 req/min) and globally (100 req/min)

**Abuse prevention:**
- Per-account limit: 20 requests total (enforced server-side)
- Per-IP limit: 50 requests total (via Upstash)
- Rate limit: 10 req/min per IP for trial endpoints
- If platform key is abused, switch to alternate provider
- Alerting: If daily platform key usage exceeds 5000 requests, send alert

---

## 6. Streaming Architecture

All chat-based AI responses use Server-Sent Events (SSE) via Vercel AI SDK's `streamText`:

```
Client → POST /api/ai/chat → Server → streamText(provider, prompt)
  → Server reads stream chunks
  → Server writes SSE: data: {"text": "the ", "done": false}
  → Server writes SSE: data: {"text": "next ", "done": false}
  → Server writes SSE: data: {"text": "token", "done": false}
  → Server writes SSE: data: {"done": true}
  → Client accumulates tokens, updates UI
  → Client calls onFinish when done
```

**Client-side:**
```typescript
const { messages, append, isLoading } = useChat({
  api: '/api/ai/chat',
  headers: {
    'x-api-key': apiKey,
    'x-provider': provider,
  },
  body: {
    section: currentSection,
    resumeState: resumeData,
  },
  onFinish: (message) => {
    // Extract structured data from AI response
    // Update resume preview
    // Trigger auto-save
  },
});
```

---

## 7. Quality Monitoring

### 7.1 User Feedback Loop

Every AI suggestion includes a thumbs up/down:

```typescript
// Resume bullet
<BulletSuggestion
  original={originalBullet}
  enhanced={enhancedBullet}
  onAccept={() => trackFeedback('resume-bullet', bulletId, 'accepted')}
  onReject={() => trackFeedback('resume-bullet', bulletId, 'rejected')}
  onEdit={() => trackFeedback('resume-bullet', bulletId, 'edited')}
/>
```

### 7.2 Automated Quality Checks

- **Response time alerts:** If p95 latency exceeds 5s, log and alert
- **Empty/error responses:** If AI returns empty or invalid JSON, auto-retry once
- **Consistency checks:** Resume bullets should not contradict each other (e.g., same project with different names)

### 7.3 Prompt Versioning

All prompts are stored in `src/lib/ai/prompts.ts` with version comments. Changes to prompts are tracked via git history. Old prompt versions are preserved as comments for reference.

---

## 8. BYOK In-App Setup Wizard

To minimize friction, the in-app setup includes:

1. **Provider selector** — Buttons for Groq (Recommended), OpenRouter, Gemini
2. **Step guide** — Embedded steps with external links
3. **Quick paste** — Input field with paste detection
4. **Validate button** — Test key immediately
5. **Success animation** — Green checkmark, "Connected to {provider}"

The wizard detects the key format to auto-select provider:
- Starts with `gsk_` → Groq
- Starts with `sk-or-` → OpenRouter
- Starts with `AIza` → Gemini
