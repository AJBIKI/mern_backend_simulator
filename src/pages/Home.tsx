import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { level1Concepts } from '@/content/level1'
import { level2Concepts } from '@/content/level2'
import { level3Concepts } from '@/content/level3'
import { allConcepts } from '@/content'
import { glossary } from '@/content/glossary'
import { useProgress } from '@/hooks/useProgress'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { ProgressRing } from '@/components/layout/ProgressRing'
import { getDueCardsCount } from '@/lib/flashcards'
import type { Concept } from '@/content/types'

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
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
    </div>
  )
}
