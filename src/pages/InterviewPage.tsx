import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { allConcepts, type Concept } from '@/content'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { getInterviewAnswer } from '@/lib/interviewAnswers'
import { useProgress } from '@/hooks/useProgress'
import { SEO } from '@/components/common/SEO'

interface InterviewItem {
  concept: Concept
  conceptId: string
  conceptTitle: string
  level: 1 | 2 | 3
  questionIndex: number
  question: string
  key: string
}

export function InterviewPage() {
  const navigate = useNavigate()
  const { recordInterviewResult, getInterviewResult } = useProgress()

  const [levelFilter, setLevelFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'got' | 'missed' | 'unseen'>('all')

  const [currentItem, setCurrentItem] = useState<InterviewItem | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  // Session stats
  const [sessionAttempted, setSessionAttempted] = useState(0)
  const [sessionGot, setSessionGot] = useState(0)

  // Flatten all interview questions across all 73 concepts
  const allItems: InterviewItem[] = useMemo(() => {
    const list: InterviewItem[] = []
    allConcepts.forEach(c => {
      (c.interview || []).forEach((q, idx) => {
        list.push({
          concept: c,
          conceptId: c.id,
          conceptTitle: c.title,
          level: c.level,
          questionIndex: idx,
          question: q,
          key: `${c.id}::${idx}`,
        })
      })
    })
    return list
  }, [])

  // Filter items by level and status
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (levelFilter !== 'all' && item.level !== levelFilter) return false
      const status = getInterviewResult(item.key)
      if (statusFilter === 'got' && status !== 'got') return false
      if (statusFilter === 'missed' && status !== 'missed') return false
      if (statusFilter === 'unseen' && status !== undefined) return false
      return true
    })
  }, [allItems, levelFilter, statusFilter, getInterviewResult])

  // Pick a random question
  const pickRandom = useCallback((candidates: InterviewItem[], currentKey?: string) => {
    if (candidates.length === 0) {
      setCurrentItem(null)
      return
    }
    const pool = candidates.length > 1 && currentKey
      ? candidates.filter(c => c.key !== currentKey)
      : candidates
    const random = pool[Math.floor(Math.random() * pool.length)]
    setCurrentItem(random)
    setIsFlipped(false)
  }, [])

  // Initial pick or when filtered pool changes
  useEffect(() => {
    pickRandom(filteredItems, currentItem?.key)
  }, [filteredItems]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    pickRandom(filteredItems, currentItem?.key)
  }

  const handleMarkGot = () => {
    if (!currentItem) return
    recordInterviewResult(currentItem.key, 'got')
    setSessionAttempted(n => n + 1)
    setSessionGot(n => n + 1)
    setTimeout(() => handleNext(), 300)
  }

  const handleMarkMissed = () => {
    if (!currentItem) return
    recordInterviewResult(currentItem.key, 'missed')
    setSessionAttempted(n => n + 1)
    setTimeout(() => handleNext(), 300)
  }

  const sessionAccuracy = sessionAttempted > 0 ? Math.round((sessionGot / sessionAttempted) * 100) : 0
  const currentStatus = currentItem ? getInterviewResult(currentItem.key) : undefined
  const answerLines = currentItem ? getInterviewAnswer(currentItem.concept, currentItem.questionIndex) : []

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <SEO
        title="Interview Practice — Backend Revision"
        description="Flashcard style interview practice with 146 questions and 3-line model answers across 73 backend concepts."
      />
      {/* Top Bar: Title & Session Stats */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
              🎯 Interview Practice
            </span>
            <span className="text-xs font-mono text-slate-500">
              {allItems.length} questions across 73 concepts
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1 font-mono">
            Backend Interview Flashcards
          </h1>
        </div>

        {/* Session Stats */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <div className="text-slate-400">
            Session: <span className="text-slate-100 font-bold">{sessionAttempted}</span> attempted
          </div>
          <span className="text-slate-700">•</span>
          <div className="text-slate-400">
            Accuracy: <span className="text-emerald-400 font-bold">{sessionAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs font-mono">
        {/* Level filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 mr-1">Level:</span>
          {(['all', 1, 2, 3] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded transition-colors ${
                levelFilter === lvl
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {lvl === 'all' ? 'All' : `L${lvl}`}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 mr-1">Status:</span>
          {(['all', 'unseen', 'got', 'missed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Card Area */}
      {currentItem ? (
        <div className="space-y-6">
          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(f => !f)}
            className="w-full h-[400px] sm:h-[450px] [perspective:1200px] cursor-pointer select-none group"
            title="Click card to flip"
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="w-full h-full [transform-style:preserve-3d] relative"
            >
              {/* FRONT: Question */}
              <div
                className={`absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-slate-900 border p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-colors duration-200 overflow-hidden ${
                  currentStatus === 'got'
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : currentStatus === 'missed'
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : 'border-slate-800 group-hover:border-slate-700'
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <LevelBadge level={currentItem.level} />
                    <Link
                      to={`/concept/${currentItem.conceptId}`}
                      onClick={e => e.stopPropagation()}
                      className="text-xs font-mono text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-4"
                    >
                      {currentItem.conceptTitle}
                    </Link>
                  </div>

                  {currentStatus && (
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                        currentStatus === 'got'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {currentStatus === 'got' ? '✓ Previously Got' : '✗ Previously Missed'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto my-3 pr-1 flex flex-col justify-center text-center">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400/80 font-bold mb-2 block">
                    Question #{currentItem.questionIndex + 1}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-semibold text-slate-100 leading-relaxed font-sans break-words max-w-xl mx-auto">
                    {currentItem.question}
                  </h2>
                </div>

                <div className="flex-shrink-0 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <span>↻ Click card to reveal 3-line answer</span>
                  </span>
                  <span>{filteredItems.length} in this filter</span>
                </div>
              </div>

              {/* BACK: 3-line Answer */}
              <div
                className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-slate-900 border p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-colors duration-200 overflow-hidden ${
                  currentStatus === 'got'
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : currentStatus === 'missed'
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : 'border-slate-800 group-hover:border-slate-700'
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <span>💡</span> 3-Line Model Answer
                  </span>
                  <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
                    {currentItem.conceptTitle}
                  </span>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto my-3 pr-1 space-y-3">
                  {answerLines.map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed p-3 rounded-xl bg-slate-950/50 border border-slate-800/70">
                      <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                        {lIdx + 1}
                      </span>
                      <p className="text-slate-200 font-sans break-words">{line}</p>
                    </div>
                  ))}
                </div>

                <div className="flex-shrink-0 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span>↻ Click card to flip back</span>
                  </span>
                  <Link
                    to={`/concept/${currentItem.conceptId}`}
                    onClick={e => e.stopPropagation()}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors underline"
                  >
                    Open concept revision →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons Below Card */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkGot}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm font-mono transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <span>✓</span>
                <span>Mark got it</span>
              </button>

              <button
                onClick={handleMarkMissed}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm font-mono transition-all shadow-[0_0_15px_rgba(244,63,94,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <span>✗</span>
                <span>Mark missed</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm font-mono transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Next question</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4 p-8">
          <div className="text-3xl">🎉</div>
          <h3 className="text-lg font-semibold text-slate-200 font-mono">
            No questions match this filter
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You may have completed all questions in this category or no questions exist with the selected status.
          </p>
          <button
            onClick={() => {
              setLevelFilter('all')
              setStatusFilter('all')
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs transition-colors"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  )
}
