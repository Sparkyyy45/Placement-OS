# PlacementOS — Security & Privacy Architecture

## 1. Threat Model

| Threat | Severity | Mitigation |
|---|---|---|
| API key theft (XSS) | **Critical** | Key stored in localStorage with encryption; CSP headers prevent injection |
| API key interception in transit | **High** | All traffic over HTTPS; key sent as HTTP header, never in URL/body |
| Platform API key abuse | **High** | Rate limiting, IP-based quotas, rotation capability, alerts |
| Supabase session hijacking | **High** | HTTP-only cookies, short session TTL, CSRF protection |
| DB injection via API routes | **High** | Prisma parameterized queries; Zod input validation |
| Unauthorized resume access | **Medium** | Row-Level Security (RLS) in Supabase; owner-only API routes |
| Trial quota bypass | **Medium** | Server-side counting with Redis lock; per-account + per-IP limits |
| MediaPipe data exfiltration | **Low** | All processing is client-side; no video/audio sent to server |
| DOS via AI endpoints | **Medium** | Upstash rate limiting (30 req/min per user, 100 req/min global) |

---

## 2. API Key Security — BYOK

### 2.1 Principle

**The student's API key never touches our server.** It is:
1. Entered by the student in their browser
2. Encrypted and stored in localStorage
3. Sent only as an HTTP header (`x-api-key`) on AI requests
4. Used server-side ONLY to create an ephemeral AI provider client
5. Garbage-collected immediately after the request completes

### 2.2 Client-Side Encryption

```typescript
// Encryption key derived from user's Supabase session ID (not stored)
// Using Web Crypto API (available in all modern browsers)

async function encryptKey(plaintext: string, userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Derive key from userId + salt
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId + ':placementos:key-v1'),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('placementos-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Combine IV + ciphertext, base64 encode
  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...combined));
}
```

**If Web Crypto is unavailable** (unlikely in modern browsers), fall back to a simple XOR obfuscation (not true encryption, but prevents casual theft from localStorage inspection).

### 2.3 What We Never Do

- ❌ Store API keys in database
- ❌ Log API keys in server logs
- ❌ Include API keys in error messages
- ❌ Send API keys to third-party analytics
- ❌ Cache API keys in server memory between requests

---

## 3. Privacy Guarantees

### 3.1 What Stays on the Device

| Data | Processing Method | Ever Uploaded? |
|---|---|---|
| Webcam feed | MediaPipe Face Mesh (WASM) | **Never** |
| Audio / mic input | Web Audio API + Web Speech API | **Never** |
| Raw interview transcript | Processed locally, only scores stored | **Scores only** |
| API key | localStorage (encrypted) | **Only as request header** |

### 3.2 What Gets Stored (Derived Data Only)

| Stored Data | Source | Example |
|---|---|---|
| Eye contact % | Aggregated from 500ms samples | `eyeContactAvg: 78` |
| Filler word counts | Counted from speech transcript | `{ "um": 12, "basically": 8 }` |
| Speech pace | WPM calculated from timestamps | `paceAvg: 142` |
| Question scores | AI evaluation of transcript | `{ correctness: 4, depth: 3 }` |
| Resume data | User-edited structured data | `{ skills: ["Python"], projects: [...] }` |

### 3.3 Data Deletion

- User can delete their account from Settings
- Deletion triggers cascade: all resumes, interviews, roadmaps, skill data removed
- Supabase Auth account also deleted
- Data is hard-deleted (not soft-deleted) from PostgreSQL
- Export option available before deletion: JSON download of all user data

---

## 4. Authentication (Supabase Auth)

### 4.1 Session Management

- **Method:** Magic link (email) or Google OAuth
- **Session storage:** HTTP-only cookie (server-side session management)
- **Session TTL:** 7 days (configurable)
- **Refresh:** Automatic via Supabase client
- **Logout:** Clears server session + client-local API key

### 4.2 Row-Level Security

All Supabase tables have RLS policies:

```sql
-- Resumes: users can only see their own
CREATE POLICY "Users can view own resumes"
  ON "Resume" FOR ALL
  USING (auth.uid() = "userId");

-- Interview sessions: users can only see their own  
CREATE POLICY "Users can view own interviews"
  ON "InterviewSession" FOR ALL
  USING (auth.uid() = "userId");
```

Supabase Auth userId is mapped to our `User.supabaseUserId` field. RLS uses Supabase Auth UID directly for simplicity.

### 4.3 API Route Authentication

```typescript
// Middleware pattern for all API routes
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function authenticateRequest(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  return { userId: session.user.id, session };
}
```

---

## 5. Rate Limiting (Upstash Redis)

### 5.1 Rate Limit Architecture

```
┌─────────┐     ┌──────────┐     ┌───────────┐
│ Client  │────▶│ API Route│────▶│  Upstash  │
│ Request │     │          │     │   Redis   │
└─────────┘     │ Check    │     │ Sliding   │
                │ rate     │     │ Window    │
                │ limit    │     │ Counter   │
                └──────────┘     └───────────┘
                       │
                       ▼
                ┌──────────┐
                │  Return  │
                │ 429 if   │
                │ over     │
                └──────────┘
```

### 5.2 Rate Limit Tiers

| Endpoint | Per-User Limit | Global Limit | Window |
|---|---|---|---|
| `/api/ai/chat` | 30 | 100 | 1 min |
| `/api/ai/analyze` | 20 | 50 | 1 min |
| `/api/ai/score` | 30 | 100 | 1 min |
| `/api/ai/roadmap` | 5 | 20 | 1 min |
| `/api/ai/validate-key` | 5 (per IP) | 30 | 1 min |
| Resume/Interview/Roadmap CRUD | 100 | 500 | 1 min |
| Trial usage | 10 | 50 (per IP) | 1 min |

### 5.3 Rate Limit Implementation

```typescript
// src/lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimitConfig {
  limit: number;
  window: number; // seconds
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}:${Math.floor(now / config.window)}`;
  
  const current = await redis.incr(windowKey);
  
  if (current === 1) {
    await redis.expire(windowKey, config.window);
  }
  
  return {
    allowed: current <= config.limit,
    remaining: Math.max(0, config.limit - current),
    resetAt: (Math.floor(now / config.window) + 1) * config.window,
  };
}
```

---

## 6. Input Validation & Sanitization

### 6.1 Server-Side Validation

All API routes validate input using Zod schemas:

```typescript
// Example: Resume update validation
import { z } from 'zod';

const ResumeUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  templateId: z.enum(['classic', 'modern', 'technical']).optional(),
  sections: z.object({
    personal: z.object({
      fullName: z.string().max(100).optional(),
      email: z.string().email().optional(),
      // ...
    }).optional(),
    // ...
  }).optional(),
  targetJd: z.string().max(10000).optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const validation = ResumeUpdateSchema.safeParse(body);
  
  if (!validation.success) {
    return Response.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }
  
  // Proceed with validated data
}
```

### 6.2 Client-Side Sanitization

- All user text is displayed as-is (no dangerous rendering)
- URLs in resume (LinkedIn, GitHub) are validated with simple regex
- HTML tags in text inputs are stripped using DOMPurify (if needed, but Shadcn/ui renders text, not HTML)
- AI-generated content is displayed as text, never evaluated as HTML

---

## 7. CORS & CSP

### 7.1 CORS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.APP_URL || 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-api-key, x-provider' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};
```

### 7.2 Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
    // 'unsafe-eval' needed for MediaPipe WASM loading
    // 'unsafe-inline' for Next.js inline scripts
  style-src 'self' 'unsafe-inline';
    // 'unsafe-inline' for Tailwind/Shadcn
  connect-src 'self' https://api.groq.com https://openrouter.ai https://generativelanguage.googleapis.com;
    // AI provider APIs
  img-src 'self' data: blob:;
    // Webcam preview (blob) and avatars
  media-src 'self' blob:;
    // Microphone access
  worker-src 'self' blob:;
    // MediaPipe workers
```

---

## 8. Production Checklist

- [ ] All environment variables configured in Vercel (no secrets in code)
- [ ] Supabase RLS policies applied to all tables
- [ ] Rate limiting configured in Upstash
- [ ] CSP headers set in Vercel config
- [ ] CORS restricted to app domain
- [ ] HTTPS enforced (Vercel default)
- [ ] API key logging explicitly disabled
- [ ] Error messages sanitized (no stack traces to client)
- [ ] Dependencies audited (`npm audit`)
- [ ] Session TTL configured (7 days)
- [ ] Account deletion flow tested
- [ ] Privacy notice added to interview pre-flight
- [ ] `secure` and `httpOnly` flags on auth cookies (Supabase handles this)
- [ ] Rate limit alerts configured (if exceeding thresholds)
