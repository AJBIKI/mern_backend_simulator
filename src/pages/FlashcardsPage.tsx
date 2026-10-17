import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  Flame,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  BookOpen
} from 'lucide-react'
import {
  getAllFlashcardsWithProgress,
  loadStoredProgress,
  saveStoredProgress,
  applySM2,
  getWeakestCards,
  type CardProgress,
  type FlashcardSource,
  type SM2Rating
} from '@/lib/flashcards'
import { SEO } from '@/components/common/SEO'

const levelColors = {
  1: {
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  2: {
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
  },
  3: {
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    dot: 'bg-rose-400',
  },
}

export function FlashcardsPage() {
  const [allCards, setAllCards] = useState<CardProgress[]>(getAllFlashcardsWithProgress)
  const [levelFilter, setLevelFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | FlashcardSource>('all')
  const [isFlipped, setIsFlipped] = useState(false)
  const [isStudyAnyway, setIsStudyAnyway] = useState(false)
  const [sessionCards, setSessionCards] = useState<CardProgress[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionDone, setSessionDone] = useState(0)

  // Listen to cross-component flashcards updates
  useEffect(() => {
    const handleUpdate = () => {
      setAllCards(getAllFlashcardsWithProgress())
    }
    window.addEventListener('flashcards-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('flashcards-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Due cards calculation (now <= dueAt)
  const now = Date.now()
  const totalDueCount = useMemo(() => {
    return allCards.filter(c => c.dueAt <= now).length
  }, [allCards, now])

  // Filtered pool based on selected level and source
  const filteredPool = useMemo(() => {
    return allCards.filter(card => {
      if (levelFilter !== 'all' && card.level !== levelFilter) return false
      if (sourceFilter !== 'all' && card.source !== sourceFilter) return false
      return true
    })
  }, [allCards, levelFilter, sourceFilter])

  // Filtered due cards
  const filteredDueCards = useMemo(() => {
    return filteredPool.filter(c => c.dueAt <= now)
  }, [filteredPool, now])

  // Build / reset the session cards when filters or mode changes
  const initSession = useCallback((studyAnywayOverride = false) => {
    setIsFlipped(false)
    setCurrentIndex(0)
    setSessionDone(0)

    if (studyAnywayOverride || (filteredDueCards.length === 0 && isStudyAnyway)) {
      const weakest = getWeakestCards(filteredPool, 10)
      setSessionCards(weakest)
      setIsStudyAnyway(true)
    } else {
      setSessionCards(filteredDueCards)
      setIsStudyAnyway(false)
    }
  }, [filteredDueCards, filteredPool, isStudyAnyway])

  // Sync session cards if not actively in an ongoing session
  useEffect(() => {
    if (sessionCards.length === 0 || currentIndex >= sessionCards.length) {
      initSession(isStudyAnyway)
    }
  }, [levelFilter, sourceFilter, isStudyAnyway, initSession, sessionCards.length, currentIndex])

  const currentCard: CardProgress | undefined = sessionCards[currentIndex]

  // Answer handler
  const handleRating = (rating: SM2Rating) => {
    if (!currentCard) return

    const updated = applySM2(currentCard, rating)
    const stored = loadStoredProgress()
    stored[updated.cardId] = {
      ease: updated.ease,
      interval: updated.interval,
      dueAt: updated.dueAt,
      lapses: updated.lapses,
    }
    saveStoredProgress(stored)

    // Update in-memory allCards
    setAllCards(prev => prev.map(c => c.cardId === updated.cardId ? updated : c))
    setSessionDone(prev => prev + 1)
    setIsFlipped(false)

    // If 'again', append card to end of session queue to practice once more
    if (rating === 'again') {
      setSessionCards(prev => [...prev, updated])
    }

    setCurrentIndex(prev => prev + 1)
  }

  // Keyboard shortcut: Space / Enter to flip, 1-4 for rating
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        setIsFlipped(prev => !prev)
      } else if (isFlipped) {
        if (e.key === '1') handleRating('again')
        if (e.key === '2') handleRating('hard')
        if (e.key === '3') handleRating('good')
        if (e.key === '4') handleRating('easy')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentCard])

  const totalInSession = sessionCards.length

  // Structured answer renderer ensuring responsive formatting & no overflow
  const renderAnswerContent = (card: CardProgress) => {
    if (card.source === 'interview') {
      const lines = card.back.split('\n').filter(Boolean)
      return (
        <div className="space-y-2.5">
          {lines.map((line, idx) => {
            const isPrinciple = line.startsWith('Core Principle:')
            const isWatchOut = line.startsWith('Watch Out:')
            const isProdRule = line.startsWith('Production Rule:')

            const badgeColor = isPrinciple
              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              : isWatchOut
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : isProdRule
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700'

            const prefix = isPrinciple
              ? 'Core Principle'
              : isWatchOut
              ? 'Watch Out'
              : isProdRule
              ? 'Production Rule'
              : `Point ${idx + 1}`

            const text = line.replace(/^(Core Principle:|Watch Out:|Production Rule:)\s*/, '')

            return (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border font-semibold mb-1.5 ${badgeColor}`}>
                  {prefix}
                </span>
                <p className="text-slate-200 leading-relaxed font-sans break-words">{text}</p>
              </div>
            )
          })}
        </div>
      )
    }

    if (card.source === 'term') {
      const parts = card.back.split('\n\nAppears in: ')
      const definition = parts[0]
      const appearsIn = parts[1]

      return (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-400" /> Definition
            </span>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans font-medium break-words">
              {definition}
            </p>
          </div>

          {appearsIn && (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block mb-1">
                Appears in Concepts:
              </span>
              <p className="text-slate-400 leading-relaxed font-mono text-[11px] break-words">
                {appearsIn}
              </p>
            </div>
          )}
        </div>
      )
    }

    // Default / Pitfall
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs sm:text-sm space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Critical Pitfall to Avoid</span>
        </div>
        <p className="text-slate-200 leading-relaxed font-sans break-words">
          {card.back}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEO
        title="Spaced Repetition Flashcards — Backend Revision"
        description="SM-2 spaced repetition cards covering backend terminology, pitfalls, and interview answers."
      />
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Spaced Repetition Flashcards
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono">
                SM-2 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active recall algorithm prioritizing cards right as you're about to forget them.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Due Today:</span>
              <span className="font-mono font-bold text-emerald-400">{totalDueCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span className="text-slate-400">Session:</span>
              <span className="font-mono font-bold text-sky-400">{sessionDone} / {Math.max(totalInSession, sessionDone)}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="max-w-4xl mx-auto mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5" /> Level:
            </span>
            {(['all', 1, 2, 3] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => { setLevelFilter(lvl); setIsStudyAnyway(false); }}
                className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {lvl === 'all' ? 'All' : `Level ${lvl}`}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 mr-1 font-medium">Source:</span>
            {(['all', 'term', 'pitfall', 'interview'] as const).map(src => (
              <button
                key={src}
                onClick={() => { setSourceFilter(src); setIsStudyAnyway(false); }}
                className={`px-2.5 py-1 rounded-md transition capitalize font-medium cursor-pointer ${
                  sourceFilter === src
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {src === 'all' ? 'All' : src === 'term' ? 'Terms' : src === 'pitfall' ? 'Pitfalls' : 'Interview'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Flashcard Body */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col justify-center">
        {currentCard ? (
          <div className="flex flex-col items-center w-full">
            {/* Session Progress Bar */}
            <div className="w-full mb-4">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                <span className="font-mono">Card {currentIndex + 1} of {sessionCards.length}</span>
                <span className="font-mono">{Math.round(((currentIndex) / Math.max(sessionCards.length, 1)) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${((currentIndex) / Math.max(sessionCards.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* 3D Flipping Card Container */}
            <div
              className="w-full h-[430px] sm:h-[470px] cursor-pointer select-none perspective-[1200px]"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* FRONT FACE */}
                <div
                  className={`w-full h-full rounded-2xl border p-6 sm:p-8 bg-slate-900/95 shadow-2xl flex flex-col justify-between absolute inset-0 overflow-hidden ${
                    levelColors[currentCard.level].badge.split(' ')[0]
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Card Header */}
                  <div className="flex-shrink-0 flex items-center justify-between gap-3 text-xs pb-3 sm:pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-mono flex-shrink-0 ${levelColors[currentCard.level].badge}`}>
                        Level {currentCard.level}
                      </span>
                      <span className="text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[320px]">
                        {currentCard.conceptTitle}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-slate-800 flex-shrink-0">
                      {currentCard.source}
                    </span>
                  </div>

                  {/* Question Prompt Body */}
                  <div className="flex-1 min-h-0 overflow-y-auto my-3 sm:my-4 pr-1 sm:pr-2 flex flex-col justify-center text-center">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400/90 font-semibold mb-3 block flex-shrink-0">
                      {currentCard.source === 'term' ? 'Terminology Question' : currentCard.source === 'pitfall' ? 'Common Pitfall' : 'Interview Question'}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-semibold text-slate-100 leading-relaxed font-sans break-words max-w-xl mx-auto">
                      {currentCard.front}
                    </h2>
                  </div>

                  {/* Card Footer prompt */}
                  <div className="flex-shrink-0 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono">Press Space or click to flip</span>
                    <span className="flex items-center gap-1 hover:text-slate-300 font-medium text-slate-400">
                      Show answer <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* BACK FACE */}
                <div
                  className={`w-full h-full rounded-2xl border p-6 sm:p-8 bg-slate-900/95 shadow-2xl flex flex-col justify-between absolute inset-0 overflow-hidden border-emerald-500/30`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* Card Header */}
                  <div className="flex-shrink-0 flex items-center justify-between gap-3 text-xs pb-3 sm:pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-mono flex-shrink-0 ${levelColors[currentCard.level].badge}`}>
                        Level {currentCard.level}
                      </span>
                      <span className="text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[320px]">
                        {currentCard.conceptTitle}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono text-xs flex items-center gap-1 font-semibold flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Answer
                    </span>
                  </div>

                  {/* Answer Content Body */}
                  <div className="flex-1 min-h-0 overflow-y-auto my-3 sm:my-4 pr-1 sm:pr-2">
                    {renderAnswerContent(currentCard)}
                  </div>

                  {/* Card Footer */}
                  <div className="flex-shrink-0 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <Link
                      to={`/concept/${currentCard.conceptId}`}
                      onClick={e => e.stopPropagation()}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition"
                    >
                      Read full concept <ArrowRight className="w-3 h-3" />
                    </Link>
                    <span className="font-mono text-slate-500 text-[11px]">
                      Ease: {currentCard.ease} | Lapses: {currentCard.lapses}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Controls Below Card */}
            <div className="w-full mt-5">
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="unflipped-controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold tracking-wide shadow-lg shadow-amber-500/20 transition transform active:scale-95 flex items-center gap-2 text-sm cursor-pointer"
                    >
                      Show Answer <span className="text-xs opacity-75 font-mono">(Space)</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="flipped-controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
                  >
                    {/* Again Button */}
                    <button
                      onClick={() => handleRating('again')}
                      className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium transition flex flex-col items-center justify-center gap-1 shadow-sm group cursor-pointer"
                    >
                      <span className="text-sm font-semibold flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition" /> Again
                      </span>
                      <span className="text-[11px] font-mono text-rose-400/80">{'< 1 min'} · (1)</span>
                    </button>

                    {/* Hard Button */}
                    <button
                      onClick={() => handleRating('hard')}
                      className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium transition flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-semibold">Hard</span>
                      <span className="text-[11px] font-mono text-amber-400/80">
                        {Math.max(1, currentCard.interval > 0 ? Math.round(currentCard.interval * 1.2) : 1)}d · (2)
                      </span>
                    </button>

                    {/* Good Button */}
                    <button
                      onClick={() => handleRating('good')}
                      className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-medium transition flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-semibold">Good</span>
                      <span className="text-[11px] font-mono text-sky-400/80">
                        {currentCard.interval > 0 ? Math.round(currentCard.interval * currentCard.ease) : 1}d · (3)
                      </span>
                    </button>

                    {/* Easy Button */}
                    <button
                      onClick={() => handleRating('easy')}
                      className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium transition flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-semibold">Easy</span>
                      <span className="text-[11px] font-mono text-emerald-400/80">
                        {currentCard.interval > 0 ? Math.round(currentCard.interval * currentCard.ease * 1.3) : 3}d · (4)
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Nothing due. Come back tomorrow.
            </h2>
            <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              You've cleared all scheduled cards in this category! Your memory retention is primed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => initSession(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400" /> Study anyway (10 weakest cards)
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-sm flex items-center justify-center transition"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
