# Backend Revision — Concept-First Visual Mental Models for MERN Developers

> **Visual mental models for 73 core backend concepts across HTTP, Auth, Databases, and Node.js internals. Stepping through animations is faster than reading docs.**

Backend Revision is an interactive revision environment engineered for backend and full-stack developers. Rather than reading long articles or API manuals, you build crisp intuition through 7-block concept breakdowns, step-by-step visualizers, SM-2 spaced repetition flashcards, output prediction quizzes, and an interactive 2D terminology graph.

---

## ⚡ The 90-Second Read Philosophy

Every concept adheres strictly to the **7-Block Standard Template**:
1. **One-Liner** — Exact technical summary under 12 words with zero filler.
2. **Mental Model** — Concrete physical analogy that cements architectural intuition.
3. **Interactive Visualizer** — Step-by-step state machine, sequence diagram, pipeline, or tree traversal.
4. **Annotated Code Snippet** — 10–25 lines of idiomatic TypeScript/Node.js with key line highlights.
5. **Core Terms** — Bi-directionally indexed glossary terms linked into the terminology graph.
6. **Critical Pitfalls & Interview Q&A** — Common production bugs to avoid and 3-line model answers.
7. **Next Concepts** — Directed prerequisites and natural follow-up concepts.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- npm or pnpm

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Verification & Auditing
```bash
# Typecheck TypeScript codebase
npx tsc --noEmit

# Run glossary integrity pass (verifies 0 broken links or missing terms)
npm run audit

# Production build
npm run build
```

---

## ☁️ Deployment (Vercel)

The repository includes a ready-to-deploy [`vercel.json`](file:///c:/code/mern_backend_simulator/vercel.json) configured for single-page client routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

To deploy with the Vercel CLI:
```bash
npm i -g vercel
vercel
```
Or import the Git repository directly into the Vercel Dashboard with framework preset set to **Vite**.

---

## 📚 Adding a New Concept (5-Step Guide)

Adding concepts is fully data-driven. The sidebar, home page, command palette, and graph automatically index new entries:

### Step 1: Ensure Terms Exist in Glossary
Open `src/content/glossary.ts`. If your concept references new terms, append them to the `glossary` array:
```ts
{
  id: 'distributed-lock',
  term: 'Distributed Lock',
  definition: 'A concurrency control mechanism across multiple worker processes or nodes.',
  concepts: ['distributed-lock-redis']
}
```

### Step 2: Choose or Create an Animated Visualizer
Visualizers implement the standard `VizProps` interface (`{ steps, currentStep, onStep, onPlay, onReset }`):
- Choose an existing visualizer from `src/components/viz/` (e.g. `SequenceSwimlane`, `AnimatedPipeline`, `CacheFlow`, `TokenBucket`, `StateMachine`, `TreeTraversal`, `ConnectionPool`, `ProducerQueue`, etc.).
- Or create a new component in `src/components/viz/` and register it in `src/lib/registerViz.ts`.

### Step 3: Define the Concept Object
Add the concept to `src/content/level1.ts`, `level2.ts`, or `level3.ts`:
```ts
export const myConcept: Concept = {
  id: 'my-concept-id',
  level: 2,
  title: 'My Concept Title',
  oneLiner: 'Short crisp summary under 12 words.',
  mentalModel: 'Physical analogy explaining how it works.',
  viz: {
    component: 'CacheFlow',
    steps: [
      { label: 'Step 1', description: 'What happens in step 1.', highlights: ['step-1'] },
      { label: 'Step 2', description: 'What happens in step 2.', highlights: ['step-2'] }
    ]
  },
  snippet: {
    lang: 'typescript',
    code: `// Clean, working 10-25 lines of code\n...`,
    highlights: [3, 4]
  },
  terms: ['distributed-lock'],
  pitfalls: ['Avoid missing lock ttl release timeouts.'],
  interview: [
    {
      question: 'How do you prevent deadlock if a worker dies holding a lock?',
      answer: 'Set an automatic lease expiration time (TTL) on the lock key.\nEnsure lock release uses Lua scripting to verify ownership.\nRun a watchdog heartbeat to extend lease for active long-running tasks.'
    }
  ],
  next: ['next-concept-id']
}
```

### Step 4: Add the "Explain Simply" Metadata
Add an inline `simple` block to your concept for beginners:
```ts
simple: {
  oneLiner: 'Kids-friendly summary without jargon.',
  mentalModel: 'A talking stick passed between players.',
  snippet: { ... } // Optional simple snippet
}
```

### Step 5: Audit and Verify
Run the audit script to guarantee zero broken backlinks or unindexed terms:
```bash
npm run audit
```

---

## 🏛️ Project Architecture

```
mern_backend_simulator/
├── src/
│   ├── components/
│   │   ├── common/           # SEO, ShortcutsModal, Toast
│   │   ├── concept/          # 7-block concept renderer & quiz
│   │   ├── layout/           # AppShell, TopBar, Sidebar, CommandPalette
│   │   ├── ui/               # PlayControls, LevelBadge, ProgressRing
│   │   └── viz/              # 14 animated visualizers (SVG + Framer Motion)
│   ├── content/
│   │   ├── glossary.ts       # 380+ glossary terms & cross-references
│   │   ├── level1.ts         # 20 foundational concepts (HTTP, middleware)
│   │   ├── level2.ts         # 26 intermediate concepts (Auth, indexing, caching)
│   │   ├── level3.ts         # 27 advanced concepts (Internals, distribution)
│   │   ├── quizzes.ts        # 20 "predict the output" quizzes
│   │   └── types.ts          # Core TypeScript schema definitions
│   ├── hooks/
│   │   ├── useProgress.ts    # localStorage progress tracking & completion
│   │   ├── useSimpleMode.ts  # Precise ↔ Simple mode state & sync
│   │   ├── useViewMode.ts    # Reading ↔ Interview mode state
│   │   └── useVizPlayback.ts # Step interval timing & keyboard shortcuts
│   ├── lib/
│   │   ├── auditGlossary.ts  # Integrity audit script for terms & links
│   │   ├── flashcards.ts     # SM-2 spaced repetition scheduling engine
│   │   ├── interviewAnswers.ts # 3-line model interview answers generator
│   │   └── registerViz.ts    # Component registry for dynamic visualizers
│   ├── pages/
│   │   ├── ConceptView.tsx   # Individual concept viewer
│   │   ├── FlashcardsPage.tsx# SM-2 spaced repetition cards
│   │   ├── GraphPage.tsx     # 2D ForceGraph terminology map
│   │   ├── Home.tsx          # Dashboard, level cards, progress import/export
│   │   └── InterviewPage.tsx # Rapid-fire interview practice
│   ├── App.tsx               # Route definitions
│   └── main.tsx              # Entry point with HelmetProvider
├── public/
│   └── favicon.svg           # Dark mode developer favicon
├── vercel.json               # SPA routing rewrite rule
└── package.json
```

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Global | Open Fuzzy Command Palette Search |
| <kbd>G</kbd> then <kbd>H</kbd> | Global | Navigate to Home |
| <kbd>G</kbd> then <kbd>I</kbd> | Global | Navigate to Interview Practice |
| <kbd>G</kbd> then <kbd>F</kbd> | Global | Navigate to Flashcards |
| <kbd>G</kbd> then <kbd>G</kbd> | Global | Navigate to Terminology Graph |
| <kbd>?</kbd> | Global | Toggle Keyboard Shortcuts Help Modal |
| <kbd>←</kbd> / <kbd>→</kbd> | Concept | Step Visualizer Backward / Forward |
| <kbd>Space</kbd> | Concept | Play / Pause Visualizer |
| <kbd>N</kbd> | Concept | Next Concept in Curriculum |
| <kbd>P</kbd> | Concept | Previous Concept in Curriculum |
| <kbd>I</kbd> | Concept | Toggle Interview Mode |
| <kbd>S</kbd> | Concept | Toggle Simple Mode |
