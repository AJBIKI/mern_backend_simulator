import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Concept } from '@/content/types'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { BlockOneLiner } from './BlockOneLiner'
import { BlockMentalModel } from './BlockMentalModel'
import { BlockViz } from './BlockViz'
import { BlockCode } from './BlockCode'
import { BlockTerms } from './BlockTerms'
import { BlockPitfalls } from './BlockPitfalls'
import { BlockNext } from './BlockNext'
import { BlockQuiz } from './BlockQuiz'
import { useProgress } from '@/hooks/useProgress'
import { useViewMode } from '@/hooks/useViewMode'

interface ConceptPageProps {
  concept: Concept
}

export function ConceptPage({ concept }: ConceptPageProps) {
  const { isComplete, markComplete, markIncomplete, markStarted } = useProgress()
  const { isInterviewMode } = useViewMode()
  const done = isComplete(concept.id)

  useEffect(() => {
    markStarted(concept.id)
  }, [concept.id, markStarted])

  useEffect(() => {
    if (window.location.hash === '#quiz') {
      setTimeout(() => {
        document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }, [concept.id])

  return (
    <motion.div
      key={concept.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-8 space-y-8"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <LevelBadge level={concept.level} />
            {isInterviewMode && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
                🎯 Interview Mode Active
              </span>
            )}
          </div>
          {/* Block 1: One-liner */}
          <BlockOneLiner text={concept.oneLiner} />
        </div>

        {/* Mark complete button */}
        <button
          onClick={() => done ? markIncomplete(concept.id) : markComplete(concept.id)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
            done
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }`}
        >
          {done ? '✓ Done' : '○ Mark done'}
        </button>
      </div>

      {/* Block 2: Mental model */}
      <BlockMentalModel text={concept.mentalModel} />

      {/* Block 3: Visualization */}
      <section>
        <h3 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Visualization
        </h3>
        <BlockViz component={concept.viz.component} steps={concept.viz.steps} />
      </section>

      {/* If Interview Mode: Show interview questions only (hide code snippet, terms, pitfalls, next) */}
      {isInterviewMode ? (
        <BlockPitfalls
          concept={concept}
          pitfalls={concept.pitfalls}
          interview={concept.interview}
          isInterviewMode={true}
        />
      ) : (
        <>
          {/* Block 4: Code */}
          <BlockCode snippet={concept.snippet} />

          {/* Block 5: Terms */}
          <BlockTerms termIds={concept.terms} />

          {/* Block 6: Pitfalls + Interview */}
          <BlockPitfalls
            concept={concept}
            pitfalls={concept.pitfalls}
            interview={concept.interview}
            isInterviewMode={false}
          />

          {/* Predict the Output Quiz */}
          <BlockQuiz conceptId={concept.id} />

          {/* Block 7: Next concepts */}
          <BlockNext nextIds={concept.next} />
        </>
      )}
    </motion.div>
  )
}
