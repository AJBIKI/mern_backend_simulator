import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * ProducerQueue
 *
 * Left: Producers (HTTP / Event producers)
 * Middle: Message Queue (Redis / BullMQ / RabbitMQ) with items
 * Right: Active Workers + Dead Letter Queue (DLQ)
 *
 * Highlights payload JSON schema:
 * {
 *   action: 'produce' | 'queue' | 'process' | 'retry' | 'dlq' | 'success',
 *   producerActive?: boolean,
 *   queueItems: string[],
 *   activeJob?: string,
 *   workerStatus: 'idle' | 'working' | 'failed' | 'success',
 *   dlqItems?: string[],
 *   stats?: { completed: number; failed: number }
 * }
 */

interface ProducerQueueData {
  action: 'produce' | 'queue' | 'process' | 'retry' | 'dlq' | 'success'
  producerActive?: boolean
  queueItems: string[]
  activeJob?: string
  workerStatus: 'idle' | 'working' | 'failed' | 'success'
  dlqItems?: string[]
  stats?: { completed: number; failed: number }
}

function parseData(highlights: string[] | undefined, currentStep: number): ProducerQueueData {
  if (highlights && highlights.length > 0) {
    try {
      const parsed = JSON.parse(highlights[0])
      if (parsed && typeof parsed === 'object') {
        return {
          action: parsed.action || 'process',
          producerActive: parsed.producerActive ?? false,
          queueItems: parsed.queueItems || [],
          activeJob: parsed.activeJob,
          workerStatus: parsed.workerStatus || 'idle',
          dlqItems: parsed.dlqItems || [],
          stats: parsed.stats,
        }
      }
    } catch {
      // String shorthand
      const h = highlights[0]
      if (h === 'produce') {
        return { action: 'produce', producerActive: true, queueItems: ['job:101'], workerStatus: 'idle' }
      }
      if (h === 'dlq') {
        return { action: 'dlq', queueItems: [], workerStatus: 'failed', dlqItems: ['job:101 (failed 3x)'], stats: { completed: 4, failed: 1 } }
      }
    }
  }

  // Fallback progression
  if (currentStep === 0) {
    return { action: 'produce', producerActive: true, queueItems: ['job:101'], workerStatus: 'idle' }
  } else if (currentStep === 1) {
    return { action: 'queue', producerActive: false, queueItems: ['job:101', 'job:102', 'job:103'], workerStatus: 'idle' }
  } else if (currentStep === 2) {
    return { action: 'process', queueItems: ['job:102', 'job:103'], activeJob: 'job:101', workerStatus: 'working' }
  } else if (currentStep === 3) {
    return { action: 'retry', queueItems: ['job:102', 'job:103'], activeJob: 'job:101 (retry #2)', workerStatus: 'failed' }
  }
  return { action: 'dlq', queueItems: ['job:103'], activeJob: 'job:102', workerStatus: 'working', dlqItems: ['job:101 (DLQ)'], stats: { completed: 8, failed: 1 } }
}

export function ProducerQueue({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]
  const data = parseData(step.highlights, currentStep)

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
        <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase">Queue Architecture: BullMQ / Redis</span>
          <div className="flex items-center gap-3">
            {data.stats && (
              <span className="text-[11px] font-mono text-slate-400">
                Completed: <span className="text-emerald-400 font-bold">{data.stats.completed}</span> | Failed:{' '}
                <span className="text-rose-400 font-bold">{data.stats.failed}</span>
              </span>
            )}
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                data.workerStatus === 'working'
                  ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                  : data.workerStatus === 'failed'
                  ? 'text-rose-400 bg-rose-400/10 border-rose-400/30'
                  : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
              }`}
            >
              {data.action.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 3 Columns: Producer | Queue | Consumer + DLQ */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Column 1: Producer */}
          <div className="flex flex-col items-center p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-center">
            <span className="text-xs font-mono uppercase text-slate-500 mb-2">1. Producers</span>
            <motion.div
              animate={{
                scale: data.producerActive ? 1.08 : 1,
                borderColor: data.producerActive ? '#34d399' : '#334155',
              }}
              className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-xl bg-slate-900 shadow-sm"
            >
              🚀
            </motion.div>
            <span className="text-xs font-mono font-semibold text-slate-300 mt-2">API Servers</span>
            <span className="text-[10px] font-mono text-slate-500">queue.add('sendEmail', data)</span>
          </div>

          {/* Column 2: Message Queue */}
          <div className="flex flex-col items-center p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span>2. Redis Queue</span>
              <span className="text-amber-400 font-bold">{data.queueItems.length} waiting</span>
            </div>

            <div className="w-full min-h-24 p-2.5 rounded-lg border border-dashed border-slate-700 bg-slate-900 flex flex-col gap-1.5 justify-center">
              <AnimatePresence>
                {data.queueItems.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs font-mono text-slate-600 italic">
                    queue empty
                  </motion.div>
                ) : (
                  data.queueItems.map((job, idx) => (
                    <motion.div
                      key={`${job}-${idx}`}
                      initial={{ scale: 0.8, opacity: 0, x: -10 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      exit={{ scale: 0.8, opacity: 0, x: 10 }}
                      className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="truncate">{job}</span>
                      <span className="text-[9px] text-slate-500 ml-2">#ready</span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: Worker & Dead Letter Queue (DLQ) */}
          <div className="flex flex-col gap-3">
            {/* Active Worker */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg ${
                  data.workerStatus === 'working'
                    ? 'border-amber-400 bg-amber-400/10'
                    : data.workerStatus === 'failed'
                    ? 'border-rose-400 bg-rose-400/10'
                    : 'border-emerald-400 bg-emerald-400/10'
                }`}
              >
                ⚙️
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono font-bold text-slate-200">Worker Thread / Pod</div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {data.activeJob ? (
                    <span className="text-amber-400">Processing: {data.activeJob}</span>
                  ) : (
                    <span className="text-slate-600">Idle / polling</span>
                  )}
                </div>
              </div>
            </div>

            {/* DLQ Box */}
            <div className="p-3 rounded-xl border border-rose-900/50 bg-rose-950/20">
              <div className="flex items-center justify-between text-[11px] font-mono text-rose-400 font-semibold mb-1">
                <span>Dead Letter Queue (DLQ)</span>
                <span>{data.dlqItems?.length || 0} failed</span>
              </div>
              <div className="min-h-8 flex flex-col gap-1 justify-center">
                {(!data.dlqItems || data.dlqItems.length === 0) ? (
                  <span className="text-[10px] font-mono text-slate-600 italic">0 exhausted retries</span>
                ) : (
                  data.dlqItems.map((item, idx) => (
                    <div key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300">
                      ⚠ {item}
                    </div>
                  ))
                )}
              </div>
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
