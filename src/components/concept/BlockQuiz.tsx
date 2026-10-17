import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { quizzesByConcept, type Quiz } from '@/content/quizzes'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { useProgress } from '@/hooks/useProgress'

interface BlockQuizProps {
  conceptId: string
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const { recordQuizResult, getQuizResult } = useProgress()
  const savedResult = getQuizResult(quiz.id)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (idx: number) => {
    if (revealed) return
    setSelectedIndex(idx)
    setRevealed(true)
    const isCorrect = idx === quiz.correctIndex
    recordQuizResult(quiz.id, isCorrect)
  }

  const handleReset = () => {
    setSelectedIndex(null)
    setRevealed(false)
  }

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
      {/* Quiz Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold">
            Predict the Output
          </span>
          {savedResult && (
            <span className="text-xs font-mono text-slate-500">
              {savedResult.correct ? '✓ Solved' : `${savedResult.attempts} attempt${savedResult.attempts > 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        {revealed && (
          <button
            onClick={handleReset}
            className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
          >
            ↺ Try again
          </button>
        )}
      </div>

      {/* Question */}
      <h4 className="text-sm font-medium text-slate-200">
        {quiz.question}
      </h4>

      {/* Code snippet */}
      <CodeBlock code={quiz.code} lang="js" />

      {/* Options */}
      <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
        {quiz.options.map((option, idx) => {
          const isSelected = selectedIndex === idx
          const isCorrect = idx === quiz.correctIndex
          const showCorrectGlow = revealed && isCorrect
          const showWrongGlow = revealed && isSelected && !isCorrect

          let style = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'

          if (showCorrectGlow) {
            style = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.18)] font-medium'
          } else if (showWrongGlow) {
            style = 'border-rose-500 bg-rose-500/10 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.18)]'
          } else if (revealed) {
            style = 'border-slate-800/60 bg-slate-950/30 text-slate-500 opacity-60'
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={revealed}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all duration-200 flex items-start gap-2.5 ${style}`}
            >
              {/* Radio Indicator */}
              <span
                className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] mt-0.5 transition-colors ${
                  showCorrectGlow
                    ? 'border-emerald-400 bg-emerald-500 text-slate-950 font-bold'
                    : showWrongGlow
                    ? 'border-rose-400 bg-rose-500 text-slate-950 font-bold'
                    : isSelected
                    ? 'border-indigo-400 bg-indigo-500 text-slate-950'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                {showCorrectGlow ? '✓' : showWrongGlow ? '✗' : String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 break-words leading-relaxed">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation Box (reveals after answering) */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`overflow-hidden rounded-lg border p-4 text-xs leading-relaxed ${
              selectedIndex === quiz.correctIndex
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-mono font-semibold">
              <span className={selectedIndex === quiz.correctIndex ? 'text-emerald-400' : 'text-amber-400'}>
                {selectedIndex === quiz.correctIndex ? '🎉 Correct!' : '💡 Explanation:'}
              </span>
            </div>
            <p className="text-slate-400 font-sans">{quiz.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function BlockQuiz({ conceptId }: BlockQuizProps) {
  const quizList = quizzesByConcept[conceptId]

  if (!quizList || quizList.length === 0) {
    return null
  }

  return (
    <section id="quiz" className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>⚡</span> Practice: Predict the Output
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          {quizList.length} {quizList.length === 1 ? 'quiz' : 'quizzes'}
        </span>
      </div>

      <div className="space-y-4">
        {quizList.map(q => (
          <QuizCard key={q.id} quiz={q} />
        ))}
      </div>
    </section>
  )
}
