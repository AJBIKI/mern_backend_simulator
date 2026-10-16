import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { level1Concepts } from '@/content/level1'
import { level2Concepts } from '@/content/level2'
import { level3Concepts } from '@/content/level3'
import { useProgress } from '@/hooks/useProgress'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { ProgressRing } from '@/components/layout/ProgressRing'
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

function ConceptRow({ concept, isComplete, onClick }: { concept: Concept; isComplete: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-slate-800/50 transition-colors group"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
          isComplete ? 'bg-emerald-400' : 'bg-slate-700 group-hover:bg-slate-500'
        }`}
      />
      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors truncate">
        {concept.title}
      </span>
      {isComplete && (
        <span className="ml-auto text-emerald-400 text-xs flex-shrink-0">✓</span>
      )}
    </button>
  )
}

export function Home() {
  const navigate = useNavigate()
  const { levelProgress, isComplete } = useProgress()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-400 to-amber-400" />
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Backend Revision</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-100 tracking-tight leading-tight">
          Revise MERN Backend Concepts Fast.
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Visual, concept-first learning for backend developers. Each topic takes under 90 seconds to understand.
        </p>
      </motion.div>

      {/* Level cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {levels.map(({ level, label, color, ringColor, description, concepts, gradient, border, hover }, i) => {
          const prog = levelProgress(level)
          const done = concepts.filter(c => isComplete(c.id)).length

          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl bg-gradient-to-br ${gradient} border ${border} ${hover} transition-colors duration-200 p-5 space-y-4 flex flex-col`}
            >
              {/* Level header */}
              <div className="flex items-center justify-between">
                <LevelBadge level={level} />
                <div className="flex items-center gap-2">
                  <ProgressRing progress={prog} size={32} strokeWidth={3} color={ringColor} />
                  <span className="text-xs font-mono text-slate-500">{prog}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-600">
                  <span>{done}/{concepts.length} done</span>
                  <span>{prog}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prog}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 + 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>

              {/* Concept list */}
              <div className="flex-1 space-y-0.5">
                {concepts.map(c => (
                  <ConceptRow
                    key={c.id}
                    concept={c}
                    isComplete={isComplete(c.id)}
                    onClick={() => navigate(`/concept/${c.id}`)}
                  />
                ))}
              </div>

              {/* Start CTA */}
              <button
                onClick={() => navigate(`/concept/${concepts[0].id}`)}
                className="w-full py-2 rounded-lg text-sm font-medium border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all"
              >
                {done > 0 ? 'Continue →' : 'Start Level →'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Quick stats footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-6 pt-4 border-t border-slate-800"
      >
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">6</span> concepts
        </div>
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">4</span> viz types
        </div>
        <div className="text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-semibold">~90s</span> per concept
        </div>
        <div className="text-xs font-mono text-slate-600">
          Progress saved in <span className="text-slate-400">localStorage</span>
        </div>
      </motion.div>
    </div>
  )
}
