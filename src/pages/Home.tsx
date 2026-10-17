import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Compass,
  CheckCircle,
  AlertCircle,
  Zap,
  BookOpen,
  Repeat
} from 'lucide-react'
import { level1Concepts } from '@/content/level1'
import { level2Concepts } from '@/content/level2'
import { level3Concepts } from '@/content/level3'
import { allConcepts } from '@/content'
import { glossary } from '@/content/glossary'
import { useProgress } from '@/hooks/useProgress'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { ProgressRing } from '@/components/layout/ProgressRing'
import { getDueCardsCount } from '@/lib/flashcards'
import { SEO } from '@/components/common/SEO'
import type { Concept } from '@/content/types'

const ONBOARDING_KEY = 'backend-revision-onboarding-open'

const levels = [
  {
    level: 1 as const,
    label: 'Basic',
    color: '#34d399',
    ringColor: '#34d399',
    description: 'Core HTTP + middleware concepts every backend dev must know.',
    concepts: level1Concepts,
    gradient: 'from-emerald-400/5 to-emerald-400/0',
    border: 'border-emerald-400/20',
    hover: 'hover:border-emerald-400/40',
  },
  {
    level: 2 as const,
    label: 'Intermediate',
    color: '#fbbf24',
    ringColor: '#fbbf24',
    description: 'Auth, databases, and patterns for production-grade APIs.',
    concepts: level2Concepts,
    gradient: 'from-amber-400/5 to-amber-400/0',
    border: 'border-amber-400/20',
    hover: 'hover:border-amber-400/40',
  },
  {
    level: 3 as const,
    label: 'Advanced',
    color: '#fb7185',
    ringColor: '#fb7185',
    description: 'Deep Node.js internals, caching, and performance concepts.',
    concepts: level3Concepts,
    gradient: 'from-rose-400/5 to-rose-400/0',
    border: 'border-rose-400/20',
    hover: 'hover:border-rose-400/40',
  },
]

const quizConcepts = [
  'middleware-pipeline',
  'http-response-status-codes',
  'callbacks-promises-async',
  'routing',
  'error-handling-101',
  'jwt-anatomy',
  'indexing-collscan-ixscan',
  'rate-limiting',
  'aggregation-pipeline',
  'event-loop-deep-dive',
]

function ConceptRow({ concept, isComplete, onClick }: { concept: Concept; isComplete: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-slate-800/50 transition-colors group cursor-pointer"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
          isComplete ? 'bg-emerald-400' : 'bg-slate-700 group-hover:bg-slate-500'
        }`}
      />
      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors truncate">
        {concept.title}
      </span>
      <span className="ml-auto text-xs font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
        →
      </span>
    </button>
  )
}

export function Home() {
  const navigate = useNavigate()
  const { isComplete, levelProgress } = useProgress()
  const [dueCount, setDueCount] = useState<number>(() => getDueCardsCount())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Onboarding Collapsible State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_KEY)
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  const toggleOnboarding = () => {
    const next = !isOnboardingOpen
    setIsOnboardingOpen(next)
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const updateDue = () => setDueCount(getDueCardsCount())
    window.addEventListener('flashcards-updated', updateDue)
    window.addEventListener('storage', updateDue)
    return () => {
      window.removeEventListener('flashcards-updated', updateDue)
      window.removeEventListener('storage', updateDue)
    }
  }, [])

  const handleQuizRandom = () => {
    const target = quizConcepts[Math.floor(Math.random() * quizConcepts.length)]
    navigate(`/concept/${target}#quiz`)
  }

  // Export Progress Handler
  const handleExportProgress = () => {
    try {
      const completed = JSON.parse(localStorage.getItem('backend-revision-completed') || '[]')
      const quizResults = JSON.parse(localStorage.getItem('backend-revision-quiz-results') || '{}')
      const interviewResults = JSON.parse(localStorage.getItem('backend-revision-interview-results') || '{}')
      const flashcards = JSON.parse(localStorage.getItem('backend-revision-flashcards') || '[]')
      const simpleMode = JSON.parse(localStorage.getItem('backend-revision-simple-mode') || 'false')
      const viewMode = localStorage.getItem('backend-revision-view-mode') || 'reading'

      const exportPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        completed,
        quizResults,
        interviewResults,
        flashcards,
        simpleMode,
        viewMode,
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backend-revision-progress-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('Progress exported successfully!', 'success')
    } catch (err) {
      showToast('Failed to export progress', 'error')
    }
  }

  // Import Progress Handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)

        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.completed)) {
          showToast('Invalid progress backup file (requires version 1 schema)', 'error')
          return
        }

        // Merge or overwrite saved localStorage items
        localStorage.setItem('backend-revision-completed', JSON.stringify(parsed.completed || []))
        if (parsed.quizResults) {
          localStorage.setItem('backend-revision-quiz-results', JSON.stringify(parsed.quizResults))
        }
        if (parsed.interviewResults) {
          localStorage.setItem('backend-revision-interview-results', JSON.stringify(parsed.interviewResults))
        }
        if (parsed.flashcards) {
          localStorage.setItem('backend-revision-flashcards', JSON.stringify(parsed.flashcards))
        }
        if (typeof parsed.simpleMode === 'boolean') {
          localStorage.setItem('backend-revision-simple-mode', JSON.stringify(parsed.simpleMode))
        }
        if (parsed.viewMode) {
          localStorage.setItem('backend-revision-view-mode', parsed.viewMode)
        }

        // Dispatch sync events across app
        window.dispatchEvent(new Event('progress-updated'))
        window.dispatchEvent(new Event('flashcards-updated'))
        window.dispatchEvent(new Event('simple-mode-updated'))
        window.dispatchEvent(new Event('storage'))

        showToast(`Imported progress: ${parsed.completed.length} concepts marked completed!`, 'success')
      } catch (err) {
        showToast('Failed to parse import file. Please check JSON format.', 'error')
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      <SEO
        title="Backend Revision — MERN Concepts Fast"
        description="Visual mental models for 73 core backend concepts across HTTP, Auth, Databases, and Node.js internals."
      />

      {/* Hidden file input for progress import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">
            Concept-First Learning
          </span>
          <span className="text-xs font-mono text-slate-600">for MERN Developers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight font-mono">
          Backend Revision
        </h1>
        <p className="text-slate-400 text-base max-w-xl">
          Visual mental models for core backend concepts. Stepping through animations is faster than reading docs.
        </p>
      </motion.div>

      {/* Collapsible "How to use this site" Onboarding Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl"
      >
        <button
          onClick={toggleOnboarding}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                How to use this site
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Recommended revision tracks: 3-day blitz, 7-day deep mastery, or 15-minute daily habit.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
            <span>{isOnboardingOpen ? 'Collapse' : 'Expand'}</span>
            {isOnboardingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {isOnboardingOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-800/80 p-6 grid md:grid-cols-3 gap-6 bg-slate-950/40"
            >
              {/* Track 1: 3-Day Blitz */}
              <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 font-mono">
                    3-Day Blitz
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Fast-paced interview preparation track focused on high-frequency questions.
                </p>
                <ul className="text-xs text-slate-300 space-y-2 font-mono">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Day 1:</strong> Level 1 HTTP & Middleware + Output Quizzes.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Day 2:</strong> Level 2 JWTs, Indexing (ESR), and Rate Limiting.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Day 3:</strong> Level 3 Event Loop, BullMQ, and Interview Practice.</span>
                  </li>
                </ul>
              </div>

              {/* Track 2: 7-Day Deep Mastery */}
              <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 font-mono">
                    7-Day Mastery
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Comprehensive end-to-end review of all 73 concepts with interactive visualizations.
                </p>
                <ul className="text-xs text-slate-300 space-y-2 font-mono">
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Days 1–2:</strong> Complete all 20 Level 1 concepts.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Days 3–4:</strong> Master 26 Level 2 architectural patterns.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Days 5–6:</strong> Conquer 27 Level 3 distributed concepts.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Day 7:</strong> Explore Terminology Graph + Full Flashcard Review.</span>
                  </li>
                </ul>
              </div>

              {/* Track 3: Daily Habits */}
              <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 font-mono">
                    Daily Habits
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Build long-term retention in 15 minutes a day using the SM-2 algorithm.
                </p>
                <ul className="text-xs text-slate-300 space-y-2 font-mono">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong className="text-slate-100">10 mins:</strong> Review due SM-2 flashcards before sleep.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong className="text-slate-100">5 mins:</strong> Step through 1 visualizer and toggle Simple mode.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong className="text-slate-100">Bonus:</strong> Solve 1 random code prediction quiz daily.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Level cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {levels.map(({ level, label, ringColor, description, concepts, gradient, border, hover }, i) => {
          const prog = levelProgress(level)
          const done = concepts.filter(c => isComplete(c.id)).length

          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border ${border} ${hover} bg-gradient-to-b ${gradient} p-6 flex flex-col justify-between space-y-6 transition-all duration-300`}
            >
              {/* Level header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <LevelBadge level={level} />
                  <ProgressRing progress={prog} size={44} strokeWidth={3.5} color={ringColor} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 font-mono">
                    L{level} — {label}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{description}</p>
                </div>
              </div>

              {/* Concept preview list */}
              <div className="space-y-1 border-t border-slate-800/60 pt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2 px-1">
                  <span>{done} of {concepts.length} completed</span>
                  <span>{prog}%</span>
                </div>
                <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
                  {concepts.slice(0, 5).map(c => (
                    <ConceptRow
                      key={c.id}
                      concept={c}
                      isComplete={isComplete(c.id)}
                      onClick={() => navigate(`/concept/${c.id}`)}
                    />
                  ))}
                  {concepts.length > 5 && (
                    <button
                      onClick={() => navigate(`/concept/${concepts[0].id}`)}
                      className="w-full text-center text-xs font-mono text-slate-500 hover:text-slate-300 py-1.5 transition-colors cursor-pointer"
                    >
                      +{concepts.length - 5} more concepts
                    </button>
                  )}
                </div>
              </div>

              {/* Start / Continue button */}
              <button
                onClick={() => {
                  const nextConcept = concepts.find(c => !isComplete(c.id)) ?? concepts[0]
                  navigate(`/concept/${nextConcept.id}`)
                }}
                className="w-full py-2.5 rounded-xl text-sm font-mono font-medium border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {done > 0 ? 'Continue →' : 'Start Level →'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Practice & Revision Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Flashcards Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-emerald-400/20 hover:border-emerald-400/40 bg-gradient-to-br from-emerald-400/5 to-transparent p-6 flex flex-col justify-between space-y-4 group transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                🗂️ {dueCount} cards due today
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              Flashcards
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              SM-2 spaced repetition engine covering terms, pitfalls, and interview answers scheduled before memory fades.
            </p>
          </div>

          <button
            onClick={() => navigate('/flashcards')}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Review Cards</span>
            <span>→</span>
          </button>
        </motion.div>

        {/* Terminology Graph Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-sky-400/20 hover:border-sky-400/40 bg-gradient-to-br from-sky-400/5 to-transparent p-6 flex flex-col justify-between space-y-4 group transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-semibold">
                🌐 Interactive Map
              </span>
              <span className="text-[11px] font-mono text-slate-500">{glossary.length} terms</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              Terminology Graph
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              2D force-directed cluster diagram connecting backend terms by co-occurrence across concepts.
            </p>
          </div>

          <button
            onClick={() => navigate('/graph')}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Graph</span>
            <span>→</span>
          </button>
        </motion.div>

        {/* Interview Practice Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-amber-400/20 hover:border-amber-400/40 bg-gradient-to-br from-amber-400/5 to-transparent p-6 flex flex-col justify-between space-y-4 group transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
                🎯 Flashcard Q&A
              </span>
              <span className="text-[11px] font-mono text-slate-500">146 questions</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              Interview Practice
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Test your knowledge across all 73 backend concepts with 3-line model answers and self-eval tracking.
            </p>
          </div>

          <button
            onClick={() => navigate('/interview')}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Practice</span>
            <span>→</span>
          </button>
        </motion.div>

        {/* Quiz Yourself Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-indigo-400/20 hover:border-indigo-400/40 bg-gradient-to-br from-indigo-400/5 to-transparent p-6 flex flex-col justify-between space-y-4 group transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold">
                ⚡ Code Output
              </span>
              <span className="text-[11px] font-mono text-slate-500">20 quizzes</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              Quiz Yourself
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Predict the output of tricky asynchronous code, middleware quirks, and Mongoose indexing behavior.
            </p>
          </div>

          <button
            onClick={handleQuizRandom}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Random Quiz</span>
            <span>→</span>
          </button>
        </motion.div>
      </div>

      {/* Progress Data Actions: Export, Import, Reset */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.48 }}
        className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>💾 Data & Progress Sync</span>
          </h4>
          <p className="text-xs text-slate-500">
            Export your completed concepts, quiz ratings, and spaced repetition card schedule as JSON.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportProgress}
            className="px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 cursor-pointer"
            title="Download your progress as JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Progress</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 cursor-pointer"
            title="Restore progress from a backup JSON file"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import Progress</span>
          </button>
        </div>
      </motion.div>

      {/* Quick stats footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-6 pt-4 border-t border-slate-800 flex-wrap"
      >
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">{allConcepts.length}</span> concepts
        </div>
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">{glossary.length}</span> terms
        </div>
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">14</span> viz types
        </div>
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">20</span> quizzes
        </div>
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">146</span> interview Qs
        </div>
        <div className="text-xs font-mono text-slate-600">
          Progress saved in <span className="text-slate-400">localStorage</span>
        </div>
      </motion.div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-mono flex items-center gap-2.5 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/95 border-rose-500/40 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
