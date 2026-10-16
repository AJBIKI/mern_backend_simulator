import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

const LANE_CONFIG = [
  { id: 'call-stack', label: 'Call Stack', color: '#818cf8' },
  { id: 'microtask-queue', label: 'Microtask Queue', color: '#ec4899' },
  { id: 'macrotask-queue', label: 'Macrotask Queue', color: '#fbbf24' },
]

// Example tasks per step (hardcoded for demo queue content)
const TASKS_PER_STEP: Record<number, Record<string, string[]>> = {
  0: { 'call-stack': ['main()'], 'microtask-queue': [], 'macrotask-queue': [] },
  1: { 'call-stack': ['main()', 'setTimeout cb'], 'microtask-queue': [], 'macrotask-queue': ['setTimeout(0)'] },
  2: { 'call-stack': ['main()'], 'microtask-queue': ['Promise.then'], 'macrotask-queue': ['setTimeout(0)'] },
  3: { 'call-stack': ['Promise.then'], 'microtask-queue': [], 'macrotask-queue': ['setTimeout(0)'] },
  4: { 'call-stack': ['setTimeout cb'], 'microtask-queue': [], 'macrotask-queue': [] },
  5: { 'call-stack': [], 'microtask-queue': [], 'macrotask-queue': [] },
}

export function QueueLanes({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]
  const activeLane = step.highlights?.[0] ?? ''

  const tasks = TASKS_PER_STEP[currentStep] ?? TASKS_PER_STEP[0]

  const handlePlay = () => {
    if (isPlaying) {
      clearInterval(timerRef.current!)
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      timerRef.current = setInterval(() => {
        onStep(Math.min(currentStep + 1, steps.length - 1))
        if (currentStep >= steps.length - 2) {
          clearInterval(timerRef.current!)
          setIsPlaying(false)
        }
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
        <div className="p-6 space-y-3">
          {LANE_CONFIG.map(lane => {
            const isActive = activeLane === lane.id
            const laneItems = tasks[lane.id] ?? []
            return (
              <motion.div
                key={lane.id}
                animate={{ borderColor: isActive ? lane.color : '#1e293b' }}
                className="rounded-lg border-2 p-3 transition-colors duration-300"
                style={{ borderColor: isActive ? lane.color : '#1e293b', backgroundColor: isActive ? `${lane.color}08` : 'transparent' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lane.color }} />
                  <span className="text-xs font-mono font-semibold" style={{ color: isActive ? lane.color : '#64748b' }}>
                    {lane.label}
                  </span>
                  <span className="text-xs text-slate-600 ml-auto font-mono">{laneItems.length} item{laneItems.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 min-h-8 flex-wrap">
                  <AnimatePresence>
                    {laneItems.length === 0 ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-700 font-mono italic"
                      >
                        empty
                      </motion.span>
                    ) : (
                      laneItems.map((item, i) => (
                        <motion.div
                          key={`${item}-${i}`}
                          initial={{ opacity: 0, scale: 0.8, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: 10 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          className="px-2.5 py-1 rounded font-mono text-xs border"
                          style={{
                            backgroundColor: `${lane.color}15`,
                            borderColor: `${lane.color}40`,
                            color: lane.color,
                          }}
                        >
                          {item}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
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
