import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * CacheFlow
 *
 * Left: Request/Client; Middle: Cache (Redis/HTTP Cache); Right: Primary DB / Origin.
 * Per step:
 * - Check: arrow client -> cache
 * - Hit: cache -> client (short-circuit in emerald)
 * - Miss: cache -> DB (amber/rose) -> DB stores in cache -> cache returns to client
 */

interface CacheFlowData {
  stage: 'idle' | 'check' | 'hit' | 'miss' | 'fetch_db' | 'store_cache' | 'invalidate'
  cacheStatus?: 'HIT' | 'MISS' | 'STALE'
  cachedValue?: string
  dbValue?: string
  keyName?: string
}

function parseCacheFlowData(highlights: string[] | undefined, currentStep: number): CacheFlowData {
  if (highlights && highlights.length > 0) {
    try {
      const parsed = JSON.parse(highlights[0])
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    } catch {
      const h = highlights[0]
      if (h === 'hit') return { stage: 'hit', cacheStatus: 'HIT', cachedValue: 'User:42 (200 OK)' }
      if (h === 'miss') return { stage: 'miss', cacheStatus: 'MISS' }
      if (h === 'fetch_db') return { stage: 'fetch_db', cacheStatus: 'MISS', dbValue: 'Fetched doc' }
      if (h === 'invalidate') return { stage: 'invalidate', cacheStatus: 'STALE' }
    }
  }

  // Fallback defaults per step
  if (currentStep === 0) return { stage: 'check', keyName: 'item:42' }
  if (currentStep === 1) return { stage: 'hit', cacheStatus: 'HIT', cachedValue: 'payload (hit)' }
  if (currentStep === 2) return { stage: 'miss', cacheStatus: 'MISS' }
  return { stage: 'fetch_db', cacheStatus: 'MISS', dbValue: 'raw record' }
}

export function CacheFlow({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]
  const data = parseCacheFlowData(step.highlights, currentStep)

  const isHit = data.stage === 'hit' || data.cacheStatus === 'HIT'
  const isMiss = data.stage === 'miss' || data.stage === 'fetch_db' || data.stage === 'store_cache'

  const handlePlay = () => {
    if (isPlaying) {
      clearInterval(timerRef.current!)
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      let s = currentStep
      timerRef.current = setInterval(() => {
        s = s + 1
        if (s >= steps.length) {
          clearInterval(timerRef.current!)
          setIsPlaying(false)
          return
        }
        onStep(s)
      }, 2000)
    }
  }

  const handleReset = () => {
    clearInterval(timerRef.current!)
    setIsPlaying(false)
    onReset()
  }

  useEffect(() => () => clearInterval(timerRef.current!), [])

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Top status banner */}
        <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">Flow Pattern: Cache-Aside / HTTP ETag</span>
          {data.cacheStatus && (
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                data.cacheStatus === 'HIT'
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                  : 'text-rose-400 bg-rose-400/10 border-rose-400/30'
              }`}
            >
              ● {data.cacheStatus}
            </span>
          )}
        </div>

        {/* 3 Pillars Flow Diagram */}
        <div className="p-8">
          <div className="grid grid-cols-3 gap-6 items-center relative">
            {/* Pillar 1: Client / App Request */}
            <motion.div
              animate={{ scale: data.stage === 'check' || isHit ? 1.03 : 1 }}
              className="p-4 rounded-xl border-2 border-slate-700 bg-slate-950/60 text-center flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-xs mb-2">
                REQ
              </div>
              <div className="text-sm font-mono font-bold text-slate-200">Client / App</div>
              <div className="text-[11px] text-slate-500 mt-1">GET /resource</div>
            </motion.div>

            {/* Pillar 2: Cache Layer */}
            <motion.div
              animate={{
                scale: isHit || data.stage === 'check' ? 1.05 : 1,
                borderColor: isHit ? '#34d399' : isMiss ? '#fbbf24' : '#334155',
              }}
              className={`p-4 rounded-xl border-2 text-center flex flex-col items-center relative transition-all duration-300 ${
                isHit
                  ? 'bg-emerald-400/10 shadow-lg shadow-emerald-400/10'
                  : isMiss
                  ? 'bg-amber-400/10'
                  : 'bg-slate-950/60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs mb-2 ${
                  isHit ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ⚡
              </div>
              <div className="text-sm font-mono font-bold text-slate-100">Cache (Redis / ETag)</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                {isHit ? '✓ Cached value exists' : isMiss ? '✗ Cache MISS' : 'In-memory store'}
              </div>
            </motion.div>

            {/* Pillar 3: Database / Origin */}
            <motion.div
              animate={{
                scale: data.stage === 'fetch_db' || data.stage === 'store_cache' ? 1.05 : 1,
                borderColor: data.stage === 'fetch_db' ? '#fb7185' : '#334155',
              }}
              className={`p-4 rounded-xl border-2 text-center flex flex-col items-center transition-all duration-300 ${
                data.stage === 'fetch_db'
                  ? 'bg-rose-400/10 shadow-lg shadow-rose-400/10 border-rose-400'
                  : 'bg-slate-950/60 border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-xs mb-2">
                🗄️
              </div>
              <div className="text-sm font-mono font-bold text-slate-200">Database</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {isHit ? 'Short-circuited (0 queries)' : 'Primary storage'}
              </div>
            </motion.div>
          </div>

          {/* Flow path indicator */}
          <div className="mt-6 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Active Path:</span>
            {isHit ? (
              <span className="text-emerald-400 font-semibold">
                Client ──▶ Cache (Hit) ──▶ Client (Bypasses Database)
              </span>
            ) : isMiss ? (
              <span className="text-amber-400 font-semibold">
                Client ──▶ Cache (Miss) ──▶ Database Fetch ──▶ Store in Cache
              </span>
            ) : (
              <span className="text-slate-400">Incoming request evaluating cache...</span>
            )}
          </div>
        </div>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`caption-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-t border-slate-800 px-5 py-3 bg-slate-950/40"
          >
            <p className="text-xs font-mono text-emerald-400 mb-0.5">{step.label}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{step.caption}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <PlayControls
        currentStep={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onStep={onStep}
        onReset={handleReset}
        stepLabel={step.label}
      />
    </div>
  )
}
