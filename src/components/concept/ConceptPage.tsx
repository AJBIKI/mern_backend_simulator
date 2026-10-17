import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Concept } from '@/content/types'
import { allConcepts } from '@/content'
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
import { useSimpleMode } from '@/hooks/useSimpleMode'
import { Sparkles } from 'lucide-react'

interface ConceptPageProps {
  concept: Concept
}

export function ConceptPage({ concept }: ConceptPageProps) {
  const navigate = useNavigate()
  const { isComplete, markComplete, markIncomplete, markStarted } = useProgress()
  const { isInterviewMode, toggleMode } = useViewMode()
  const { isSimple, toggleSimpleMode } = useSimpleMode()
  const done = isComplete(concept.id)

  const hasSimple = Boolean(concept.simple)
  const activeSimple = isSimple && hasSimple

  const currentOneLiner = activeSimple && concept.simple ? concept.simple.oneLiner : concept.oneLiner
  const currentMentalModel = activeSimple && concept.simple ? concept.simple.mentalModel : concept.mentalModel
  const currentSnippet = activeSimple && concept.simple?.snippet ? concept.simple.snippet : concept.snippet

  useEffect(() => {
    markStarted(concept.id)
  }, [concept.id, markStarted])

  // Concept-specific keyboard shortcuts: N (next), P (prev), I (interview), S (simple)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      const key = e.key.toLowerCase()
      if (key === 'n') {
        e.preventDefault()
        if (concept.next && concept.next.length > 0) {
          navigate(`/concept/${concept.next[0]}`)
        } else {
          const idx = allConcepts.findIndex(c => c.id === concept.id)
          if (idx !== -1 && idx < allConcepts.length - 1) {
            navigate(`/concept/${allConcepts[idx + 1].id}`)
          }
        }
      } else if (key === 'p') {
        e.preventDefault()
        const idx = allConcepts.findIndex(c => c.id === concept.id)
        if (idx > 0) {
          navigate(`/concept/${allConcepts[idx - 1].id}`)
        }
      } else if (key === 'i') {
        e.preventDefault()
        toggleMode()
      } else if (key === 's') {
        if (hasSimple) {
          e.preventDefault()
          toggleSimpleMode()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [concept, hasSimple, navigate, toggleMode, toggleSimpleMode])

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
      className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={concept.level} />
            {isInterviewMode && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
                🎯 Interview Mode Active
              </span>
            )}
            {activeSimple && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Simple Explanation
              </span>
            )}
          </div>
          {/* Block 1: One-liner with fade transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSimple ? 'simple-oneliner' : 'precise-oneliner'}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.18 }}
            >
              <BlockOneLiner text={currentOneLiner} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Explain Simply Toggle (only shown if concept.simple exists) */}
          {hasSimple && (
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
              <button
                onClick={() => isSimple && toggleSimpleMode()}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  !isSimple
                    ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Detailed technical precision"
              >
                Precise
              </button>
              <button
                onClick={() => !isSimple && toggleSimpleMode()}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  isSimple
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Simple kid-friendly mental model"
              >
                <span>🐣</span> Simple
              </button>
            </div>
          )}

          {/* Mark complete button */}
          <button
            onClick={() => done ? markIncomplete(concept.id) : markComplete(concept.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 cursor-pointer ${
              done
                ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            {done ? '✓ Done' : '○ Mark done'}
          </button>
        </div>
      </div>

      {/* Block 2: Mental model with fade transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSimple ? 'simple-mental' : 'precise-mental'}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <BlockMentalModel text={currentMentalModel} />
        </motion.div>
      </AnimatePresence>

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
          {/* Block 4: Code with fade transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSimple ? 'simple-code' : 'precise-code'}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.18 }}
            >
              <BlockCode snippet={currentSnippet} />
            </motion.div>
          </AnimatePresence>

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
