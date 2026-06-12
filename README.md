# PlacementOS

Your placement operating system. Build an ATS-optimized resume. Get a personalized roadmap. Practice with AI mock interviews. All connected. All free.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + Shadcn/ui
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **Database:** Supabase (PostgreSQL + Auth)
- **Cache:** Upstash Redis
- **AI:** Vercel AI SDK (Groq / OpenRouter / Gemini)
- **Hosting:** Vercel (free tier)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env vars
cp .env.example .env.local
# Fill in your Supabase credentials

# Run dev server
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, auth callback
│   ├── (dashboard)/     # Dashboard, resume, roadmap, interview, settings
│   └── api/             # API routes (AI proxy, CRUD, trial)
├── components/
│   ├── ui/              # Shadcn/ui components
│   ├── shared/          # Providers, auth guard, layout
│   ├── resume/          # Resume builder components
│   ├── interview/       # Interview coach components
│   ├── roadmap/         # Roadmap components
│   └── dashboard/       # Dashboard components
├── lib/
│   ├── ai/              # AI provider factory, prompts
│   ├── db/              # Supabase client
│   └── utils.ts         # Shared utilities
├── store/               # Zustand stores
├── hooks/               # Custom hooks
└── types/               # TypeScript types
```

## Sprint Plan

See [SPRINT-PLAN.md](./docs/SPRINT-PLAN.md) for the full implementation timeline.

## Design

See [DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md) for the visual spec.
