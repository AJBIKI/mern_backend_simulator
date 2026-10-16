import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * ConnectionPool
 *
 * Simulates a database connection pool (e.g. Mongoose maxPoolSize: 5).
 * Highlights JSON schema:
 * {
 *   poolSize: number,
 *   activeSockets: number, // checked out
 *   idleSockets: number,   // ready in pool
 *   waitingQueue: number,  // requests queued waiting for a socket
 *   action: 'checkout' | 'query' | 'checkin' | 'exhausted',
 *   eventDesc?: string
 * }
 */

interface PoolData {
  poolSize: number
  activeSockets: number
  idleSockets: number
  waitingQueue: number
  action: 'checkout' | 'query' | 'checkin' | 'exhausted'
  eventDesc?: string
}

function parseData(highlights: string[] | undefined, currentStep: number): PoolData {
  if (highlights && highlights.length > 0) {
    try {
      const parsed = JSON.parse(highlights[0])
      if (parsed && typeof parsed === 'object') {
        return {
          poolSize: parsed.poolSize ?? 5,
          activeSockets: parsed.activeSockets ?? 2,
          idleSockets: parsed.idleSockets ?? 3,
          waitingQueue: parsed.waitingQueue ?? 0,
          action: parsed.action || 'query',
          eventDesc: parsed.eventDesc,
        }
      }
    } catch {
      // Fallback
    }
  }

  // Fallback defaults
  if (currentStep === 0) {
    return { poolSize: 5, activeSockets: 0, idleSockets: 5, waitingQueue: 0, action: 'checkin', eventDesc: 'Initial pool: 5 idle sockets' }
  } else if (currentStep === 1) {
    return { poolSize: 5, activeSockets: 3, idleSockets: 2, waitingQueue: 0, action: 'checkout', eventDesc: '3 requests checked out sockets' }
  } else if (currentStep === 2) {
    return { poolSize: 5, activeSockets: 5, idleSockets: 0, waitingQueue: 4, action: 'exhausted', eventDesc: 'Pool exhausted! 4 requests waiting in queue' }
  }
  return { poolSize: 5, activeSockets: 2, idleSockets: 3, waitingQueue: 0, action: 'checkin', eventDesc: 'Sockets returned to pool; queue drained' }
}

export function ConnectionPool({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]
  const data = parseData(step.highlights, currentStep)
  const poolSize = data.poolSize || 5

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
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 uppercase">MongoDB Driver Socket Pool</span>
            <span className="text-xs font-mono text-slate-300">maxPoolSize: {poolSize}</span>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              data.waitingQueue > 0
                ? 'text-rose-400 bg-rose-400/10 border-rose-400/30'
                : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
            }`}
          >
            {data.waitingQueue > 0 ? `⚠ ${data.waitingQueue} Waiting` : '● Pool Healthy'}
          </span>
        </div>

        {/* Pool Diagram Container */}
        <div className="p-6 space-y-6">
          {/* Sockets in Pool */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>TCP Sockets in Reservoir</span>
              <span>
                <span className="text-amber-400 font-bold">{data.activeSockets} Active</span> /{' '}
                <span className="text-emerald-400 font-bold">{data.idleSockets} Idle</span>
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950">
              {Array.from({ length: poolSize }).map((_, idx) => {
                const isActive = idx < data.activeSockets
                return (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      borderColor: isActive ? '#fbbf24' : '#10b981',
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      isActive ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{isActive ? '🔌' : '⚡'}</div>
                    <div className="text-[11px] font-mono font-bold">Socket #{idx + 1}</div>
                    <div className="text-[10px] font-mono opacity-70">{isActive ? 'BUSY (In Query)' : 'IDLE (Ready)'}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Wait Queue for Socket Exhaustion */}
          <div className="p-3.5 rounded-xl border border-dashed border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-slate-300">WaitQueue (Pending Requests)</div>
              <div className="text-[11px] font-mono text-slate-500">
                Queries block until a socket completes and checks in (waitQueueTimeoutMS).
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {data.waitingQueue === 0 ? (
                <span className="text-xs font-mono text-slate-600 italic">0 queued</span>
              ) : (
                Array.from({ length: Math.min(data.waitingQueue, 6) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 font-mono text-[10px] flex items-center justify-center font-bold"
                  >
                    ⏳
                  </motion.div>
                ))
              )}
            </div>
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
