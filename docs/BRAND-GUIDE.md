# PlacementOS — Brand Guide

## 1. Brand Identity

### 1.1 Name

**PlacementOS**

- "Placement" is the core value proposition — college placement preparation
- "OS" implies it's an operating system, not just a tool: everything centralized, everything connected
- Together: "PlacementOS" — the operating system for your placement journey

**Tagline options:**
- "Your placement operating system"
- "One platform. Resume. Roadmap. Interview."
- "From lost to placed."

### 1.2 Tone of Voice

| Quality | Description | Example |
|---|---|---|
| **Direct** | No fluff. Say it straight. | "Your resume has 3 weak bullets. Fix them." |
| **Encouraging** | But not fake-positive. Student knows it's real. | "Your System Design needs work. Here's exactly how to fix it." |
| **Smart** | Technical when needed, but never alienating. | "Docker wasn't found in your resume. Add it if you've used it." |
| **Student-first** | Speaks like a senior who's been through placements. | "Top product companies ask System Design. Non-negotiable." |

### 1.3 Voice Guidelines

- Use "you" and "your" (not "the user")
- Use contractions (you're, don't, it's)
- Keep sentences short (AI responses ≤3 sentences)
- Never use emojis in the UI (exception: status indicators like ✅⚠️)
- Numbers over words ("3 resumes" not "three resumes")
- Technical jargon is fine when the student needs to learn it (e.g., "ATS-optimized", "keyword match")

---

## 2. Visual Identity

### 2.1 Logo

Text-based. No icon mark for v1.

```
┌──────────────────────────┐
│   PlacementOS            │  ← Bold, Inter or custom wordmark
└──────────────────────────┘
```

**Usage:**
- Dark text on light backgrounds: `#111827` (gray-900)
- Light text on dark backgrounds: `#FFFFFF`
- Minimum size: 120px wide (header), 200px (landing hero)
- No icon/logo mark for v1; the "O" in PlacementOS can be stylized as a progress ring in future versions

### 2.2 Color Usage

| Color | Where to Use |
|---|---|
| `#FFFFFF` (white) | Page backgrounds, cards |
| `#F9FAFB` (gray-50) | Secondary backgrounds, sidebar |
| `#111827` (gray-900) | Headings, body text |
| `#6B7280` (gray-500) | Secondary text, labels |
| `#2563EB` (blue-600) | Buttons, links, active states, accent |
| `#1D4ED8` (blue-700) | Button hover |
| `#059669` (emerald-600) | Success, high scores, completed |
| `#D97706` (amber-600) | Warnings, medium scores |
| `#DC2626` (red-600) | Errors, low scores |

### 2.3 Typography

| Usage | Font | Weight | Size |
|---|---|---|---|
| Hero heading (landing) | Inter | 700 | 2.25rem (36px) |
| Page heading | Inter | 600 | 1.5rem (24px) |
| Section title | Inter | 600 | 1.125rem (18px) |
| Body text | Inter | 400 | 1rem (16px) |
| Secondary text | Inter | 400 | 0.875rem (14px) |
| Caption / metadata | Inter | 400 | 0.75rem (12px) |
| Code / API keys | JetBrains Mono | 400 | 0.875rem (14px) |

---

## 3. Copy Guidelines

### 3.1 Empty States

| Screen | Copy |
|---|---|
| Resume list | "You haven't built a resume yet. That's the first step." |
| Interview history | "No interviews yet. Ready to take your first?" |
| Roadmap | "Complete the assessment to get your personalized roadmap." |
| Dashboard (resume card) | "ATS Score: — Create a resume first." |
| Dashboard (interview card) | "No interview data. Start practicing." |

### 3.2 Error Messages

| Scenario | Copy |
|---|---|
| API key invalid | "This key doesn't work. Double-check it or try a different provider." |
| Rate limited | "Too many requests. Give it a minute and try again." |
| AI provider down | "The AI provider is having issues. Try a different provider or come back later." |
| Offline | "You're offline. Your data is saved and will sync when you reconnect." |
| Save failed | "Couldn't save. Don't worry — retrying automatically." |

### 3.3 Pro Upgrade Prompts

| Gate | Copy |
|---|---|
| Resume limit | "You've created 3 resumes. Go Pro for unlimited versions." |
| Interview limit | "3 free interviews this month. Pro for unlimited practice." |
| JD mode | "JD Mode is Pro. Paste a job description for a tailored interview." |
| Adaptive roadmap | "Your roadmap adapts to your performance — with Pro." |

---

## 4. Marketing Copy (Landing Page)

**Hero:**
"Your placement journey, one platform."

**Subhead:**
"Build an ATS-optimized resume. Get a personalized roadmap. Practice with AI mock interviews. All in one place. Built by students who've been there."

**Feature bullets:**
- "AI resume builder — have a conversation, get a professional resume"
- "Smart roadmap — personalized to your role, timeline, and skill gaps"
- "Interview coach — practice with AI, get real-time feedback"
- "Your key, your privacy — bring your own API key, we never see your data"

**CTA:**
"Start Free — No credit card"

**Footer trust signals:**
- "Powered by Groq / OpenRouter / Gemini — you choose"
- "Privacy-first: your camera stays on your device"
- "Built by students for students"
