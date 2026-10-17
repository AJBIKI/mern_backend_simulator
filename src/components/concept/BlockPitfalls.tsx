import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Concept } from '@/content/types'
import { getInterviewAnswer } from '@/lib/interviewAnswers'
import { useProgress } from '@/hooks/useProgress'

interface BlockPitfallsProps {
  concept?: Concept
  pitfalls: string[]
  interview: string[]
  isInterviewMode?: boolean
}

export function BlockPitfalls({ concept, pitfalls, interview, isInterviewMode }: BlockPitfallsProps) {
  const { recordInterviewResult, getInterviewResult } = useProgress()
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({})

  const toggleReveal = (idx: number) => {
    setRevealedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // Interview Question Item Component
  const renderInterviewQuestion = (q: string, i: number) => {
    const key = concept ? `${concept.id}::${i}` : `q::${i}`
    const status = getInterviewResult(key)
    const isRevealed = !!revealedQuestions[i]
    const answerLines = concept ? getInterviewAnswer(concept, i) : null

    return (
      <div
        key={i}
        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
          status === 'got'
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : status === 'missed'
            ? 'bg-rose-500/5 border-rose-500/30'
            : 'bg-slate-900 border-slate-800'
        } p-4 space-y-3`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <span className="text-amber-400 flex-shrink-0 mt-0.5 text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
              Q{i + 1}
            </span>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">{q}</p>
          </div>

          {/* Status badge if answered */}
          {status && (
            <span
              className={`flex-shrink-0 text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                status === 'got'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {status === 'got' ? '✓ Got it' : '✗ Missed'}
            </span>
          )}
        </div>

        {/* Reveal Answer Button */}
        <div className="pt-1 flex items-center justify-between">
          <button
            onClick={() => toggleReveal(i)}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            <span>{isRevealed ? 'Hide answer' : 'Reveal answer'}</span>
            <span className="text-[10px]">{isRevealed ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* 3-Line Answer */}
        <AnimatePresence>
          {isRevealed && answerLines && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300"
            >
              {answerLines.map((line, lIdx) => (
                <div key={lIdx} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono text-indigo-400 flex-shrink-0">{lIdx + 1}.</span>
                  <span className="text-slate-300">{line}</span>
                </div>
              ))}

              {/* Got it / Missed Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/60">
                <span className="text-[11px] font-mono text-slate-500 mr-1">Self-eval:</span>
                <button
                  onClick={() => recordInterviewResult(key, 'got')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                    status === 'got'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                  }`}
                >
                  ✓ Got it
                </button>
                <button
                  onClick={() => recordInterviewResult(key, 'missed')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                    status === 'missed'
                      ? 'bg-rose-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                  }`}
                >
                  ✗ Missed
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Interview Mode view: Full width interview questions only
  if (isInterviewMode) {
    return (
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> Interview Questions
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {interview.length} {interview.length === 1 ? 'question' : 'questions'}
          </span>
        </div>
        <div className="space-y-3">
          {interview.map((q, i) => renderInterviewQuestion(q, i))}
        </div>
      </section>
    )
  }

  // Reading Mode view: 2-column grid (Pitfalls + Interview Questions)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid md:grid-cols-2 gap-4"
    >
      {/* Pitfalls */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-semibold text-rose-400/80 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚠</span> Common Pitfalls
        </h3>
        <div className="space-y-2">
          {pitfalls.map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-400/5 border border-rose-400/10"
            >
              <span className="text-rose-400 flex-shrink-0 mt-0.5 text-sm">✗</span>
              <p className="text-sm text-slate-400 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interview Qs */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-semibold text-amber-400/80 uppercase tracking-wider flex items-center gap-1.5">
          <span>❓</span> Interview Questions
        </h3>
        <div className="space-y-2">
          {interview.map((q, i) => renderInterviewQuestion(q, i))}
        </div>
      </div>
    </motion.div>
  )
}
