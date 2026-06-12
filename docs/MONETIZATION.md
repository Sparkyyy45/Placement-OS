# PlacementOS — Monetization & Pricing

## 1. Revenue Model Overview

```
Revenue Sources (v1):
├── Student Pro — ₹199/month or ₹999/6 months
├── Institution License — ₹30,000–₹75,000/year per college
└── Future (Phase 2+):
    ├── Company partnerships (top talent access)
    ├── Hackathon sponsorships
    └── Premium resource creator partnerships
```

**Core philosophy:** Free tier drives adoption. Pro is affordable enough that any student can pay. Institution licensing is the real revenue engine.

---

## 2. Feature Grid

| Feature | Free | Student Pro | Institution |
|---|---|---|---|
| **Resume Builder** | | | |
| Resume versions | 3 | Unlimited | Unlimited |
| Templates | All 3 | All 3 | All 3 |
| AI chat builder | ✅ (20 total) | ✅ | ✅ |
| JD analysis | ✅ (20 total) | ✅ | ✅ |
| ATS score | ✅ | ✅ | ✅ |
| PDF export | ✅ | ✅ | ✅ |
| Version history | ❌ | ✅ (unlimited) | ✅ |
| **Interview Coach** | | | |
| Sessions per month | 3 | Unlimited | Unlimited |
| Topic mode | ✅ | ✅ | ✅ |
| Role mode | ✅ | ✅ | ✅ |
| JD mode | ❌ | ✅ | ✅ |
| Coaching report | Basic (score only) | Full breakdown + trends | Full |
| Webcam analysis | ✅ | ✅ | ✅ |
| Trend graphs | ❌ | ✅ | ✅ |
| Custom persona | ❌ | ✅ (Tough/Neutral/Friendly) | ✅ |
| **Roadmap Engine** | | | |
| Static roadmap | ✅ | ✅ | ✅ |
| Adaptive engine | ❌ | ✅ | ✅ |
| Resource curation | Basic | Premium picks | Premium |
| Task tracking | ✅ | ✅ | ✅ |
| Interview → roadmap sync | ❌ | ✅ | ✅ |
| **Skill Graph** | | | |
| Skill tracking | Basic (5 skills) | Full | Full |
| Gap analysis | ❌ | ✅ | ✅ |
| **Dashboard** | | | |
| Readiness score | ✅ | ✅ | ✅ |
| Weekly progress | ✅ | ✅ | ✅ |
| Interview trends | ❌ | ✅ | ✅ |
| **Platform** | | | |
| BYOK | ✅ | ✅ | ✅ |
| Data export | ✅ | ✅ | ✅ |
| API key support | 20 trial requests | Unlimited | Unlimited |
| Ads | ❌ | ❌ | ❌ |
| **Institution-Specific** | | | |
| TPO dashboard | — | — | ✅ |
| Batch analytics | — | — | ✅ |
| Custom branding | — | — | ✅ |
| Timeline tools | — | — | ✅ |
| Bulk student accounts | — | — | ✅ |

---

## 3. Student Pro Pricing

### 3.1 India Pricing

| Plan | Price | Effective Monthly | Savings |
|---|---|---|---|
| Monthly | ₹199/month | ₹199 | — |
| 6-month | ₹999/6 months | ₹166.50 | 16% |
| Annual (future) | ₹1,799/year | ₹150 | 25% |

### 3.2 International Pricing (Future)

| Currency | Monthly | 6-month |
|---|---|---|
| USD | $4.99 | $24.99 |
| EUR | €4.49 | €22.99 |
| GBP | £3.99 | £19.99 |

### 3.3 Positioning

**Not "unlock more" but "remove limits."** The free tier is genuinely useful — a student can build 3 resumes, take 3 interviews, and follow a roadmap. Pro removes the ceilings:

- "3 good resumes or unlimited tailored versions?"
- "3 practice interviews or daily practice?"
- "Basic score or full breakdown + trends?"

---

## 4. Upgrade Triggers

### 4.1 In-App Upgrade Moments

| Moment | Message | Where |
|---|---|---|
| Creating 4th resume | "You've used all 3 free resumes. Go Pro for unlimited versions." | Resume list |
| Booking 4th interview this month | "3 free interviews used. Pro gives you unlimited practice." | Interview mode select |
| Accessing JD mode | "JD Mode is Pro. Upload a job description for a tailored interview." | Interview mode select |
| Viewing report after 3rd interview | "Full trend analysis is Pro. See how you're improving." | Interview report |
| Seeing "Adaptive" in roadmap | "Your roadmap is static. Pro adapts to your performance." | Roadmap page |
| Skill Graph shows "locked" | "Full skill tracking is Pro. See all your gaps." | Skills page |

### 4.2 Upgrade Flow

```
1. User hits a Pro gate
2. Upgrade dialog slides in (sheet/modal)
3. Shows: what they get + comparison + price
4. Options: Monthly / 6-month
5. Payment: Razorpay (UPI, card, net banking)
6. Success: All gates open, confetti
7. Post-purchase: "What would you like to unlock first?"
```

### 4.3 Payment Integration (Razorpay)

```typescript
// Client-side payment flow
const razorpay = new Razorpay({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
  amount: 19900, // ₹199 in paise
  currency: 'INR',
  name: 'PlacementOS',
  description: 'Student Pro — Monthly',
  prefill: {
    email: user.email,
    contact: user.phone,
  },
  handler: async (response) => {
    // Verify payment on server
    const verification = await fetch('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(response),
    });
    // Upgrade user in DB
    // Refresh session
  },
});
```

---

## 5. Institution License (TPO)

### 5.1 Tiered Pricing

| Tier | Student Count | Price/Year | What's Included |
|---|---|---|---|
| **Small** | <500 students | ₹30,000 | Pro for all students, basic TPO dashboard |
| **Medium** | 500-2000 | ₹50,000 | Pro, full TPO dashboard, custom branding |
| **Large** | 2000+ | ₹75,000 | Pro, full TPO dashboard, branding, priority support |

### 5.2 TPO Dashboard Features

```
┌────────────────────────────────────────────────┐
│  TPO Dashboard                                  │
│  St. Xavier's College — placementos.institute   │
│                                                  │
│  Batch Overview:                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ Total Students: 842                        │  │
│  │ Active: 534 (63%)                          │  │
│  │ Resumes Completed: 412 (49%)              │  │
│  │ Interview Practice: 267 (32%)             │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Skill Distribution (Top 5 gaps):                │
│  ┌───────────────────────────────────────────┐  │
│  │ Dynamic Programming    68% gap            │  │
│  │ System Design          55% gap            │  │
│  │ Behavioral Stories     42% gap            │  │
│  │ OS Concepts            38% gap            │  │
│  │ Aptitude               31% gap            │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Readiness Distribution:                         │
│  ┌───────────────────────────────────────────┐  │
│  │ Ready (80+):      12%   ██░░░░░░░░         │  │
│  │ Almost (60-79):   34%   ██████░░░░         │  │
│  │ Needs Work (<60): 54%   ██████████         │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  [Export Report]  [Schedule Workshop]            │
└──────────────────────────────────────────────────┘
```

### 5.3 TPO Sales Pitch

**Problem for TPOs:**
- "I don't know which students are ready and which aren't"
- "Students use random tools, I have no visibility"
- "Placement season hits and we're scrambling"

**Solution:**
- "See exactly where your batch stands — anonymized, actionable"
- "Students use one platform; you see the aggregate"
- "Identify weak areas months before placements"

**Pricing conversation:**
- "₹30,000/year for 500 students = ₹60/student. Your students would pay more for a single mock interview platform."
- "Free pilot: 1 month, no commitment."

---

## 6. Cost Analysis (Our Infrastructure)

| Item | Free Tier Limit | Monthly Cost (500 users) | Monthly Cost (5000 users) |
|---|---|---|---|
| **Vercel** | 100GB bandwidth, 6000 build min | $0 | $0 (still within limits) |
| **Supabase** | 500MB DB, 50k users, 2GB storage | $0 | $0 (still within limits) |
| **Upstash Redis** | 10k cmd/day, 256MB | $0 | $0 (10k commands is ~100k API calls) |
| **AI (trial)** | 20 req/user = 10k total | $0 (on platform Groq free tier) | ~$10 (excess AI beyond free tier) |
| **Cloudflare** | Free DNS + CDN | $0 | $0 |
| **Razorpay** | 2% + ₹3 per transaction | ~₹200 (if 10 Pro signups) | ~₹2000 |
| **Total** | | **~$0 + payment fees** | **~$10 + payment fees** |

**At scale (10k+ users):**
- Supabase Pro: $25/month (8GB DB, 100k users, 100GB bandwidth)
- Upstash Pro: $10/month (100k cmd/day)
- Vercel Pro: $20/month (1TB bandwidth, faster builds)
- **Total: ~$55/month + payment fees**

---

## 7. Payment Flow (Technical)

### 7.1 Payment Provider

**Razorpay** for India (UPI, cards, net banking, wallets).
Future: Stripe for international.

### 7.2 Subscription Management

```typescript
// Backend: Payment verification + feature unlock
async function handlePaymentSuccess(paymentId: string, userId: string) {
  // 1. Verify payment signature
  const isValid = verifyRazorpaySignature(paymentId, orderId, signature);
  if (!isValid) throw new Error('Invalid payment');
  
  // 2. Determine plan from amount
  const plan = getPlanFromAmount(amount); // 'pro-monthly' | 'pro-6month'
  
  // 3. Calculate subscription period
  const period = plan === 'pro-monthly' ? 30 : 180;
  
  // 4. Update user record
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscription: {
        upsert: {
          create: {
            plan,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: addDays(new Date(), period),
          },
          update: {
            status: 'active',
            currentPeriodEnd: addDays(new Date(), period),
          },
        },
      },
    },
  });
  
  // 5. Invalidate cache / refresh session
  await redis.del(`subscription:${userId}`);
}
```

### 7.3 Feature Gate Implementation

```typescript
// src/lib/subscription.ts
export function checkFeatureAccess(
  user: User,
  feature: string
): { allowed: boolean; reason?: string } {
  const isPro = user.subscription?.status === 'active';
  
  switch (feature) {
    case 'unlimited-resumes':
      return { allowed: isPro, reason: 'Upgrade to Pro for unlimited resumes' };
    case 'jd-mode':
      return { allowed: isPro, reason: 'JD Mode is a Pro feature' };
    case 'adaptive-roadmap':
      return { allowed: isPro, reason: 'Adaptive roadmap is a Pro feature' };
    case 'interview-trends':
      return { allowed: isPro, reason: 'Trend graphs are a Pro feature' };
    case 'interview-monthly':
      const sessionsThisMonth = getSessionsThisMonth(user.id);
      return {
        allowed: isPro || sessionsThisMonth < 3,
        reason: '3 free interviews per month. Upgrade for unlimited.',
      };
    case 'resume-count':
      const resumeCount = getResumeCount(user.id);
      return {
        allowed: isPro || resumeCount < 3,
        reason: 'Free tier allows 3 resumes. Upgrade for unlimited.',
      };
    default:
      return { allowed: true };
  }
}
```

---

## 8. Future Monetization (Phase 2+)

| Revenue Stream | Timeline | Notes |
|---|---|---|
| **Company partnerships** | Phase 2 | "Top 10% students by interview score" → sold to recruiting teams |
| **Hackathon sponsorships** | Phase 2 | Feature for colleges to run placement prep hackathons |
| **Premium resource marketplace** | Phase 3 | Courses can pay to be recommended; curated by community votes |
| **ATS resume review service** | Phase 3 | Human expert review of AI-generated resumes |
| **Mock interview with seniors** | Phase 3 | Paid 1:1 sessions with recently placed alumni |
