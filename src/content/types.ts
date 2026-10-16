// ─── Viz Step ───────────────────────────────────────────────────────────────
export interface VizStep {
  label: string;
  caption: string;
  highlights?: string[]; // ids of elements to highlight
}

// ─── Snippet ─────────────────────────────────────────────────────────────────
export interface Snippet {
  lang: 'js' | 'ts' | 'bash' | 'json';
  code: string;            // 8–20 lines
  highlights?: Record<number, string>; // line number → color tag (e.g. "emerald", "amber", "rose")
}

// ─── Concept ─────────────────────────────────────────────────────────────────
export interface Concept {
  id: string;              // e.g. "middleware-pipeline"
  level: 1 | 2 | 3;
  order: number;
  title: string;
  oneLiner: string;        // ≤ 15 words, no jargon
  mentalModel: string;     // real-world analogy, 2 sentences max
  viz: {
    component: string;     // key from registerViz
    steps: VizStep[];
  };
  snippet: Snippet;
  terms: string[];         // ids from glossary.ts
  pitfalls: string[];      // 3 bullets
  interview: string[];     // 2 questions
  next: string[];          // 2–3 concept ids
}

// ─── Glossary Term ───────────────────────────────────────────────────────────
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;      // 2 lines max
  concepts?: string[];     // concept IDs where this term is referenced
}
