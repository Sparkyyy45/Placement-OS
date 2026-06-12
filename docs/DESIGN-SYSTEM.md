# PlacementOS — Design System

## 1. Design Principles

1. **Minimal** — Every pixel earns its place. Nothing decorative. Everything functional.
2. **Fast** — Perceived speed matters. Optimistic UI, skeleton loaders, instant transitions.
3. **Professional** — Not playful. Students trust it because it looks serious.
4. **Calm** — Low visual noise. Lots of whitespace. The focus is on content, not chrome.

---

## 2. Visual Identity

### 2.1 Color Palette

Inspired by Notion + Vercel. Minimal light theme with blue accent.

```css
/* Primary palette */
--bg-primary:    #FFFFFF;      /* White — main background */
--bg-secondary:  #F9FAFB;      /* Gray-50 — cards, sidebar */
--bg-tertiary:   #F3F4F6;      /* Gray-100 — hover states, inputs */

/* Text */
--text-primary:   #111827;     /* Gray-900 — headings, body */
--text-secondary: #6B7280;     /* Gray-500 — labels, captions */
--text-tertiary:  #9CA3AF;     /* Gray-400 — placeholders, disabled */
--text-inverse:   #FFFFFF;     /* White — on accent */

/* Accent */
--accent:         #2563EB;     /* Blue-600 — primary actions, links */
--accent-hover:   #1D4ED8;     /* Blue-700 — hover state */
--accent-light:   #DBEAFE;     /* Blue-100 — selected/active bg */
--accent-subtle:  #EFF6FF;     /* Blue-50 — very light bg */

/* Borders */
--border:         #E5E7EB;     /* Gray-200 — default border */
--border-light:   #F3F4F6;     /* Gray-100 — subtle separator */

/* Status */
--success:        #059669;     /* Emerald-600 — positive */
--warning:        #D97706;     /* Amber-600 — caution */
--error:          #DC2626;     /* Red-600 — errors */
--info:           #2563EB;     /* Blue-600 — info */

/* ATS Score colors */
--score-high:     #059669;     /* ≥85 */
--score-medium:   #D97706;     /* 65-84 */
--score-low:      #DC2626;     /* <65 */

/* Shadows */
--shadow-sm:     0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:     0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg:     0 10px 15px -3px rgb(0 0 0 / 0.1);
```

### 2.2 Typography

```css
/* Font family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs:     0.75rem;    /* 12px — captions, metadata */
--text-sm:     0.875rem;   /* 14px — labels, secondary text */
--text-base:   1rem;       /* 16px — body text */
--text-lg:     1.125rem;   /* 18px — larger body */
--text-xl:     1.25rem;    /* 20px — section titles */
--text-2xl:    1.5rem;     /* 24px — page headings */
--text-3xl:    1.875rem;   /* 30px — hero headings */
--text-4xl:    2.25rem;    /* 36px — landing hero */

/* Weights */
--font-normal:  400;
--font-medium:  500;
--font-semibold: 600;
--font-bold:    700;

/* Line heights */
--leading-tight:   1.25;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
```

### 2.3 Spacing

4px base unit. Derived from Tailwind's spacing scale.

```css
--space-1:  0.25rem;   /*  4px */
--space-2:  0.5rem;    /*  8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### 2.4 Border Radius

```css
--radius-sm:    0.375rem;  /*  6px — inputs, buttons */
--radius-md:    0.5rem;    /*  8px — cards, modals */
--radius-lg:    0.75rem;   /* 12px — large cards */
--radius-full:  9999px;    /* pills, badges */
```

### 2.5 Transitions

```css
--transition-fast:   150ms ease;
--transition-normal: 200ms ease;
--transition-slow:   300ms ease;
```

---

## 3. Component Library

All components from Shadcn/ui, customized with the above tokens. Here's every component used and how it's configured:

### 3.1 Button

```tsx
// Variants: primary, secondary, outline, ghost, danger
// Sizes: sm, default, lg, icon
<Button variant="primary" size="default">
  Start Interview
</Button>
```

**States:** default, hover, active, disabled, loading (with spinner)

### 3.2 Input

```tsx
// Variants: default, error
// With optional icon, label, helper text
<Input
  label="API Key"
  placeholder="sk-..."
  error="Invalid key format"
  icon={KeyIcon}
/>
```

**States:** default, focused, filled, error, disabled

### 3.3 Card

```tsx
// Variants: default, interactive (hover lift), nested
<Card variant="default">
  <CardHeader>Resume Score</CardHeader>
  <CardContent>82/100</CardContent>
</Card>
```

### 3.4 Dialog

```tsx
// For confirmations, settings panels
<Dialog>
  <DialogContent>
    <DialogHeader>Delete Resume?</DialogHeader>
    <DialogDescription>This can't be undone.</DialogDescription>
    <DialogFooter>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3.5 Select / Dropdown

```tsx
// For filters, choices
<Select>
  <SelectItem value="sde">SDE</SelectItem>
  <SelectItem value="analyst">Data Analyst</SelectItem>
</Select>
```

### 3.6 Badge

```tsx
// Variants: default, success, warning, error, outline
<Badge variant="success">ATS Optimized</Badge>
<Badge variant="warning">Needs Improvement</Badge>
```

### 3.7 Progress

```tsx
// For ATS scores, roadmap progress
<Progress value={78} variant="score" />
```

### 3.8 Tabs

```tsx
// For resume builder (Chat / JD Match)
// For interview report sections
<Tabs>
  <TabsList>
    <TabsTrigger value="chat">Chat</TabsTrigger>
    <TabsTrigger value="jd">JD Match</TabsTrigger>
  </TabsList>
</Tabs>
```

### 3.9 Toast / Sonner

```tsx
// For success/error notifications
toast.success("Resume saved");
toast.error("API key failed");
```

### 3.10 Sheet / Drawer

```tsx
// For ATS score breakdown, mobile navigation
<Sheet>
  <SheetContent>
    <ScoreBreakdown />
  </SheetContent>
</Sheet>
```

### 3.11 Tooltip

```tsx
// For icon explanations, metric descriptions
<Tooltip content="Based on keyword match + format + content">
  <InfoIcon />
</Tooltip>
```

### 3.12 Avatar

```tsx
// User avatar in sidebar
<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>RS</AvatarFallback>
</Avatar>
```

### 3.13 Separator

```tsx
// Between sections
<Separator />
```

### 3.14 Skeleton

```tsx
// Loading states for all components
<Skeleton className="h-4 w-[250px]" />
```

---

## 4. Layout System

### 4.1 Dashboard Layout

```
┌──────────────────────────────────────────────────┐
│  Header: [Logo]  Nav links  [Trial badge] [Avatar]│
├──────────┬───────────────────────────────────────┤
│ Sidebar  │  Main Content                          │
│          │                                        │
│ Dashboard│  (Page content)                        │
│ Resume   │                                        │
│ Roadmap  │                                        │
│ Interview│                                        │
│ Skills   │                                        │
│ Settings │                                        │
│          │                                        │
└──────────┴───────────────────────────────────────┘
```

**Sidebar:** 240px wide, collapsed to icon-only on smaller screens
**Header:** 64px tall, sticky

### 4.2 Resume Builder Layout

```
┌──────────────────────────────────────────────────┐
│  Header: [← Back]  Resume Name  [Save] [Export]  │
├────────────────────┬─────────────────────────────┤
│  AI Chat Panel     │  Live Preview Panel          │
│  (40% width)       │  (60% width)                 │
│                    │                              │
│  Scrollable chat   │  Sticky preview              │
│  + input at bottom │  + ATS score card below      │
│                    │                              │
└────────────────────┴─────────────────────────────┘
```

### 4.3 Interview Live Layout

```
┌──────────────────────────────────────────────────┐
│  Progress bar: Q 2/6  |  Time remaining: 25:30   │
├────────────────────┬─────────────────────────────┤
│  Webcam (small)    │  Live Metrics Sidebar        │
│  + Question        │  (subtle, 200px)             │
│  + Captions        │                              │
│  + Controls        │                              │
│  (70% width)       │  (30% width)                 │
└────────────────────┴─────────────────────────────┘
```

---

## 5. Logo & Iconography

### 5.1 Logo

Text-based logo using Inter font:
- **PlacementOS** in bold, with the "O" styled as a progress ring or target
- SVG version for favicon, PNG for OG images

### 5.2 Icons

All icons from **Lucide React** (used by Shadcn/ui by default):
- Consistent 16px/20px/24px sizes
- Same stroke width (1.5px or 2px through the Lucide config)
- Examples:
  - Resume: `FileText`, `ScrollText`
  - Roadmap: `Map`, `Route`
  - Interview: `Mic`, `Video`, `MessageSquare`
  - Skills: `Brain`, `BarChart3`
  - Dashboard: `LayoutDashboard`
  - Settings: `Settings`, `Key`
  - Actions: `Plus`, `Download`, `Trash2`, `Pencil`, `Check`

---

## 6. Animation Guidelines (Framer Motion)

### 6.1 Page Transitions

```tsx
// Fade + slight slide up
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
  >
    {page}
  </motion.div>
</AnimatePresence>
```

### 6.2 Sidebar

```tsx
// Slide in/out
<motion.aside
  animate={{ width: isOpen ? 240 : 64 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
/>
```

### 6.3 Progress Bars

```tsx
// Animate on change
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
/>
```

### 6.4 Skeleton Loading

```tsx
// Pulse animation for skeletons
// Tailwind's `animate-pulse` is sufficient
<div className="animate-pulse bg-gray-200 rounded-md h-4" />
```

### 6.5 AI Streaming Text

```tsx
// Smooth appearance of each token
// Use Vercel AI SDK's built-in streaming + a simple fade-in
// No extra animation needed — text appearing naturally is sufficient
```

### 6.6 Micro-Interactions

- Button hover: subtle scale (1.02) + shadow increase
- Card hover: slight lift (y: -2) + shadow increase
- Checkmark: spring animation on task completion
- ATS score change: number counter animation
- Notification: slide down from top, auto-dismiss

---

## 7. Accessibility

### 7.1 Color Contrast

All text meets WCAG 2.1 AA:
- Normal text (<18px): contrast ratio ≥ 4.5:1
- Large text (≥18px): contrast ratio ≥ 3:1
- UI components (borders, icons): contrast ratio ≥ 3:1

### 7.2 Focus States

All interactive elements have visible focus rings:
```css
/* Tailwind: focus-visible:ring-2 focus-visible:ring-accent */
```

### 7.3 Screen Readers

- All icons have `aria-hidden="true"` and text labels
- Loading states announced via `aria-live="polite"`
- Form errors linked via `aria-describedby`
- Semantic HTML throughout (h1-h6, nav, main, section, article)

### 7.4 Keyboard Navigation

- All interactive elements reachable via Tab
- Modals trap focus
- Escape closes overlays
- Arrow keys for tabs, selects, sliders

---

## 8. Responsive Behavior

Desktop-first. Minimum supported width: 1024px for interview mode.

| Breakpoint | Width | Behavior |
|---|---|---|
| **Desktop** | ≥1280px | Full layout (sidebar + main) |
| **Small Desktop** | 1024-1279px | Collapsed sidebar (icon-only), stacked resume panels |
| **Tablet** | 768-1023px | Sidebar hidden (hamburger menu), stacked layouts |
| **Mobile** | <768px | Single column, bottom nav instead of sidebar, mini headers |

**Interview mode:** Warnings shown below 1024px. Typed-only mode if webcam unavailable. Mobile users see "Use a laptop for interview practice" message.

---

## 9. Dark Mode (Future)

Defined now for easy future implementation:

```css
/* Variables are already structured for dark mode */
--bg-primary-dark:    #0F172A;     /* Slate-900 */
--bg-secondary-dark:  #1E293B;     /* Slate-800 */
--text-primary-dark:  #F1F5F9;     /* Slate-100 */
--accent-dark:        #3B82F6;     /* Blue-500 */
```

Implementation: CSS class on `<html>` element, toggled via Zustand `uiStore.theme`. Tailwind `dark:` variant used throughout. Not implemented in v1 but colors should not break when added.
