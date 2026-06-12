# PlacementOS — Deployment Guide

## 1. Infrastructure Overview

```
┌────────────────────────────────────────────────────┐
│  Vercel (Hosting)                                  │
│  ├── Next.js App (SSR + API Routes)               │
│  ├── Edge Functions (rate limiting)                │
│  └── Automatic HTTPS + CDN                         │
├────────────────────────────────────────────────────┤
│  Supabase (Data)                                   │
│  ├── PostgreSQL Database (500MB free)              │
│  ├── Auth (50k users free)                         │
│  └── Storage (2GB free)                            │
├────────────────────────────────────────────────────┤
│  Upstash (Cache)                                   │
│  └── Redis (10k cmd/day free)                      │
├────────────────────────────────────────────────────┤
│  Cloudflare (Network)                              │
│  └── DNS + CDN + DDoS Protection (free)            │
├────────────────────────────────────────────────────┤
│  Vercel Blob (File storage) — Future               │
│  └── PDF exports, avatars (1GB free)               │
└────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites

### 2.1 Accounts Needed

| Service | Sign Up | Free Tier Limit |
|---|---|---|
| **Vercel** | vercel.com | 100GB bandwidth, 6000 build min/mo |
| **Supabase** | supabase.com | 500MB DB, 50k users, 2GB storage |
| **Upstash** | upstash.com | 10k cmd/day, 256MB Redis |
| **GitHub** | github.com | Free for public/private repos |
| **Razorpay** (future) | razorpay.com | Only for payments |
| **Cloudflare** (optional) | cloudflare.com | Free DNS + CDN |

### 2.2 Local Development Requirements

```
Node.js >= 18
npm >= 9
Git
VS Code (recommended)
```

---

## 3. Environment Variables

### 3.1 Local `.env.local`

```bash
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx  # For admin operations (trial quota)

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxx

# Platform AI Keys (for trial quota usage)
PLATFORM_GROQ_KEY=gsk_xxxxx
PLATFORM_OPENROUTER_KEY=sk-or-xxxxx
PLATFORM_GEMINI_KEY=AIzaxxxxx

# Razorpay (future)
NEXT_PUBLIC_RAZORPAY_KEY=rzp_xxxxx
RAZORPAY_SECRET=xxxxx
```

### 3.2 Production (Vercel)

Same variables, set in Vercel dashboard → Project Settings → Environment Variables. Never commit `.env.local`.

---

## 4. Step-by-Step Deployment

### 4.1 Initial Setup

```bash
# 1. Create Next.js app
npx create-next-app@latest placement-os --typescript --tailwind --app
cd placement-os

# 2. Install dependencies
npm install @prisma/client @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query zustand react-hook-form zod @hookform/resolvers
npm install ai @ai-sdk/openai @ai-sdk/google
npm install @react-pdf/renderer framer-motion lucide-react
npm install @upstash/redis
npm install -D prisma @types/react-pdf

# 3. Initialize Shadcn/ui
npx shadcn-ui@latest init
# Select: New York style, Slate base color, CSS variables
npx shadcn-ui@latest add button card input select dialog tabs badge progress toast sheet tooltip avatar separator skeleton dropdown-menu

# 4. Initialize Prisma
npx prisma init
# Set DATABASE_URL in .env to Supabase connection string
```

### 4.2 Supabase Setup

```bash
# 1. Create Supabase project at supabase.com
# 2. Get connection string from Project Settings → Database
# 3. Set DATABASE_URL in .env

# 4. Run initial migration
npx prisma migrate dev --name init

# 5. Enable Auth providers
# Supabase Dashboard → Authentication → Providers
# Enable: Email (Magic Link), Google (if desired)

# 6. Set Site URL (for magic link redirect)
# Authentication → Settings → Site URL: http://localhost:3000
```

### 4.3 Upstash Setup

```
# 1. Create Upstash account
# 2. Create Redis database (free tier)
# 3. Get REST URL and token
# 4. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
```

### 4.4 Vercel Deployment

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/placement-os.git
git push -u origin main

# 2. Import to Vercel
# Go to vercel.com → Add New Project → Import GitHub repo
# Framework: Next.js
# Root Directory: ./

# 3. Configure environment variables in Vercel
# Add all variables from .env.local (without quotes)

# 4. Deploy
# Vercel auto-deploys on push to main

# 5. Set production URL in Supabase
# Supabase Dashboard → Authentication → Settings
# Site URL: https://placement-os.vercel.app
# Redirect URLs: https://placement-os.vercel.app/auth/callback
```

### 4.5 Custom Domain (Optional)

```
# 1. Add domain in Vercel
# Project Settings → Domains → Add placementos.app (or your domain)

# 2. Configure DNS
# Add CNAME record in your DNS provider:
#   CNAME  @   cname.vercel-dns.com

# 3. Update Supabase Site URL
# Change to your custom domain
```

---

## 5. CI/CD Pipeline (GitHub Actions)

### 5.1 Test on PR

```yaml
# .github/workflows/test.yml
name: Test
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck  # tsc --noEmit
      - run: npx prisma generate
      - run: npm test           # vitest
```

### 5.2 Deploy to Preview

Vercel automatically creates preview deployments for every PR. No additional config needed.

### 5.3 Deploy to Production

Vercel auto-deploys `main` branch. Manual overrides via Vercel dashboard.

---

## 6. Database Migrations

### 6.1 Local Development

```bash
# After schema changes:
npx prisma migrate dev --name description_of_change

# Reset local DB:
npx prisma migrate reset

# Seed data:
npx prisma db seed
```

### 6.2 Production

```bash
# Generate migration without applying:
npx prisma migrate dev --create-only

# Apply to production (via Vercel CLI or CI):
npx prisma migrate deploy

# Or use Supabase Dashboard → SQL Editor for manual SQL
```

**Note:** Prisma migrations require the `DATABASE_URL` environment variable pointing to the production database. In Vercel, run migrations via:
```bash
# Vercel CLI (from local):
npx vercel env pull .env.production
npx prisma migrate deploy
```

---

## 7. Monitoring & Analytics

### 7.1 Vercel Analytics

- **Web Analytics** (free): Page views, top pages, geolocation
- **Speed Insights** (free): Core Web Vitals (LCP, CLS, INP)

Enable in Vercel dashboard → Project → Analytics.

### 7.2 Custom Analytics (Privacy-Focused)

Track these events (client-side, opt-in):
- `onboarding_completed`
- `resume_created`
- `resume_exported`
- `interview_started`
- `interview_completed`
- `roadmap_generated`
- `pro_upgrade_started`
- `pro_upgrade_completed`

Use Supabase for analytics (no additional service needed):
```sql
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(id),
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Backup & Recovery

### 8.1 Database Backups

Supabase Pro tier ($25/month) includes daily backups with 7-day retention. On the free tier:
- Manual backup via Supabase Dashboard → Database → Backup (SQL dump)
- Or use `pg_dump`:

```bash
pg_dump --dbname=postgresql://xxxx:xxxx@xxxx.supabase.co:5432/postgres > backup.sql
```

### 8.2 Recovery

```bash
# Restore from backup
psql --dbname=postgresql://xxxx:xxxx@xxxx.supabase.co:5432/postgres < backup.sql

# Or via Supabase Dashboard SQL Editor
# Paste the SQL dump and execute
```

---

## 9. Environment-Specific Config

| Environment | URL | DB | AI Keys | Purpose |
|---|---|---|---|---|
| **local** | localhost:3000 | Local Supabase (same project) | Your own keys | Development |
| **preview** | placement-os-git-xxx.vercel.app | Staging Supabase project | Test keys | PR testing |
| **production** | placementos.app | Production Supabase project | Platform keys | Live |

---

## 10. Production Launch Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase RLS policies applied (see SECURITY.md)
- [ ] Custom domain configured with SSL
- [ ] Production `DATABASE_URL` is Supabase production DB (not local)
- [ ] Platform AI keys set (for trial quota)
- [ ] Upstash production credentials set
- [ ] Rate limiting active (Upstash)
- [ ] CSP headers configured in `next.config.ts`
- [ ] `next.config.ts` has `poweredByHeader: false`
- [ ] Error monitoring configured (Vercel Logs or Sentry)
- [ ] Analytics events set up
- [ ] Privacy policy page created
- [ ] Terms of service page created
- [ ] Robots.txt configured (allow indexing for landing page)
- [ ] OG image set for social sharing
- [ ] Sitemap generated
- [ ] Load test with 10+ concurrent users
- [ ] Email deliverability tested (magic link arrives within 30 seconds)
