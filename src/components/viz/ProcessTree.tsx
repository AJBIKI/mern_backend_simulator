import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * ProcessTree
 *
 * Visualizes master process, cluster forks, and worker_threads sharing workloads.
 * Highlights JSON schema:
 * {
 *   mode: 'cluster' | 'worker_threads',
 *   masterStatus: 'healthy' | 'spawning' | 'restarting',
 *   portShared: number,
 *   workers: {
 *     id: string;
 *     pid: number;
 *     cpuUsage: number;
 *     status: 'online' | 'busy' | 'crashed' | 'respawning';
 *     activeTask?: string;
 *   }[]
 * }
 */

interface ProcessNode {
  id: string
  pid: number
  cpuUsage: number
  status: 'online' | 'busy' | 'crashed' | 'respawning'
  activeTask?: string
}

interface ProcessTreeData {
  mode: 'cluster' | 'worker_threads'
  masterStatus: 'healthy' | 'spawning' | 'restarting'
  portShared?: number
  workers: ProcessNode[]
}

const DEFAULT_WORKERS: ProcessNode[] = [
  { id: 'w1', pid: 10451, cpuUsage: 25, status: 'busy', activeTask: 'GET /orders' },
  { id: 'w2', pid: 10452, cpuUsage: 88, status: 'busy', activeTask: 'bcrypt.hash' },
  { id: 'w3', pid: 10453, cpuUsage: 10, status: 'online', activeTask: 'idle' },
  { id: 'w4', pid: 10454, cpuUsage: 14, status: 'online', activeTask: 'idle' },
]

function parseData(highlights: string[] | undefined, currentStep: number): ProcessTreeData {
  if (highlights && highlights.length > 0) {
    try {
      const parsed = JSON.parse(highlights[0])
      if (parsed && typeof parsed === 'object') {
        return {
          mode: parsed.mode || 'cluster',
          masterStatus: parsed.masterStatus || 'healthy',
          portShared: parsed.portShared || 3000,
          workers: parsed.workers || DEFAULT_WORKERS,
        }
      }
    } catch {
      // Fallback
    }
  }

  // Fallback defaults
  if (currentStep === 0) {
    return { mode: 'cluster', masterStatus: 'spawning', portShared: 3000, workers: DEFAULT_WORKERS }
  } else if (currentStep === 1) {
    return {
      mode: 'cluster',
      masterStatus: 'healthy',
      portShared: 3000,
      workers: [
        { id: 'w1', pid: 10451, cpuUsage: 92, status: 'busy', activeTask: 'Heavy CPU Task' },
        { id: 'w2', pid: 10452, cpuUsage: 12, status: 'online', activeTask: 'Serving HTTP' },
        { id: 'w3', pid: 10453, cpuUsage: 0, status: 'crashed', activeTask: 'uncaughtException' },
        { id: 'w4', pid: 10454, cpuUsage: 8, status: 'online', activeTask: 'Serving HTTP' },
      ],
    }
  }
  return {
    mode: 'cluster',
    masterStatus: 'healthy',
    portShared: 3000,
    workers: [
      { id: 'w1', pid: 10451, cpuUsage: 18, status: 'online', activeTask: 'Ready' },
      { id: 'w2', pid: 10452, cpuUsage: 22, status: 'online', activeTask: 'Ready' },
      { id: 'w3', pid: 10459, cpuUsage: 5, status: 'respawning', activeTask: 'PM2 auto-respawned' },
      { id: 'w4', pid: 10454, cpuUsage: 15, status: 'online', activeTask: 'Ready' },
    ],
  }
}

export function ProcessTree({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
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
        {/* Top bar info */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase">
            Process Model: {data.mode === 'cluster' ? 'Node.js Cluster / PM2' : 'worker_threads'}
          </span>
          {data.portShared && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded border border-emerald-400/30">
              Shared Port: {data.portShared} (SO_REUSEPORT)
            </span>
          )}
        </div>

        {/* Tree Canvas */}
        <div className="p-6 flex flex-col items-center gap-6">
          {/* Primary / Master Process */}
          <motion.div
            animate={{ scale: data.masterStatus === 'healthy' ? 1 : 1.03 }}
            className="w-full max-w-sm p-4 rounded-xl border-2 border-slate-700 bg-slate-950 text-center shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-200">
                Primary Manager Process (PID 10400)
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              {data.mode === 'cluster' ? 'Listens on port & delegates connections' : 'Parent JS thread'}
            </div>
          </motion.div>

          {/* Fork Lines */}
          <div className="w-2/3 border-t-2 border-dashed border-slate-700 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-[10px] font-mono text-slate-500">
              IPC / Thread Channel
            </span>
          </div>

          {/* Worker Nodes Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.workers.map(worker => {
              const isBusy = worker.status === 'busy'
              const isCrashed = worker.status === 'crashed'
              const isRespawn = worker.status === 'respawning'

              let borderClass = 'border-slate-800 bg-slate-950/70'
              let badgeColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
              if (isCrashed) {
                borderClass = 'border-rose-400/50 bg-rose-950/20'
                badgeColor = 'text-rose-400 bg-rose-400/10 border-rose-400/30'
              } else if (isRespawn) {
                borderClass = 'border-amber-400/50 bg-amber-950/20'
                badgeColor = 'text-amber-400 bg-amber-400/10 border-amber-400/30'
              } else if (isBusy) {
                borderClass = 'border-amber-400/40 bg-slate-950'
                badgeColor = 'text-amber-300 bg-amber-400/10 border-amber-400/30'
              }

              return (
                <motion.div
                  key={worker.id}
                  animate={{ scale: isBusy ? 1.03 : 1 }}
                  className={`p-3 rounded-xl border-2 ${borderClass} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300">Worker (PID {worker.pid})</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {worker.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>CPU Load:</span>
                      <span className={worker.cpuUsage > 75 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {worker.cpuUsage}%
                      </span>
                    </div>
                    {worker.activeTask && (
                      <div className="text-[10px] text-slate-500 truncate">
                        Task: <span className="text-slate-400">{worker.activeTask}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
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
