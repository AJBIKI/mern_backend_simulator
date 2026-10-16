import { motion, AnimatePresence } from 'framer-motion'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'
import { useState, useEffect, useRef } from 'react'

const LANES = ['Client', 'Server', 'Database'] as const
type Lane = typeof LANES[number]

interface Arrow {
  from: Lane
  to: Lane
}

// Map step highlight keys to arrows between lanes
function stepToArrow(highlights: string[]): Arrow | null {
  const h = highlights?.[0] ?? ''
  if (h === 'client-to-server') return { from: 'Client', to: 'Server' }
  if (h === 'server-to-client') return { from: 'Server', to: 'Client' }
  if (h === 'server-to-db') return { from: 'Server', to: 'Database' }
  if (h === 'db-to-server') return { from: 'Database', to: 'Server' }
  return null
}

function laneIndex(lane: Lane) {
  return LANES.indexOf(lane)
}

export function SequenceSwimlane({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = steps[currentStep]
  const arrow = stepToArrow(step.highlights ?? [])
  const activeLane = step.highlights?.[0]

  // Active lane from step highlights (client, server, database)
  const laneHighlight = (lane: Lane): boolean => {
    const h = step.highlights?.[0] ?? ''
    if (h === 'client') return lane === 'Client'
    if (h === 'server') return lane === 'Server'
    if (h === 'database') return lane === 'Database'
    if (h === 'client-to-server') return lane === 'Client' || lane === 'Server'
    if (h === 'server-to-client') return lane === 'Server' || lane === 'Client'
    if (h === 'server-to-db') return lane === 'Server' || lane === 'Database'
    if (h === 'db-to-server') return lane === 'Database' || lane === 'Server'
    return false
  }

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
      }, 1800)
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
      {/* Swimlane diagram */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Lane headers */}
        <div className="grid grid-cols-3 border-b border-slate-800">
          {LANES.map(lane => (
            <div
              key={lane}
              className={`px-4 py-3 text-center text-sm font-mono font-semibold transition-colors duration-300 ${
                laneHighlight(lane) ? 'text-slate-100 bg-slate-800' : 'text-slate-500 bg-slate-900'
              }`}
            >
              {lane}
            </div>
          ))}
        </div>

        {/* Swimlane body */}
        <div className="relative p-6" style={{ minHeight: 180 }}>
          {/* Vertical lane dividers */}
          <div className="absolute inset-y-0 left-1/3 border-l border-slate-800/60" />
          <div className="absolute inset-y-0 left-2/3 border-l border-slate-800/60" />

          {/* Animated arrow between lanes */}
          <AnimatePresence mode="wait">
            {arrow && (
              <motion.div
                key={`${arrow.from}-${arrow.to}-${currentStep}`}
                className="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ArrowBetween from={laneIndex(arrow.from)} to={laneIndex(arrow.to)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activity dot per active lane */}
          {LANES.map((lane, i) => (
            laneHighlight(lane) && (
              <motion.div
                key={`dot-${lane}-${currentStep}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `calc(${(i / 3) * 100 + 16.66}% - 8px)` }}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-400/20 border-2 border-emerald-400" />
              </motion.div>
            )
          ))}

          {/* Step label in center */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute bottom-4 left-0 right-0 text-center"
            >
              <span className="text-xs font-mono text-slate-400">{step.label}</span>
            </motion.div>
          </AnimatePresence>
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
            <p className="text-sm text-slate-400 leading-relaxed">{step.caption}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
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

// SVG arrow drawn between two lane columns (0=Client, 1=Server, 2=Database)
function ArrowBetween({ from, to }: { from: number; to: number }) {
  const fromX = `${(from / 3) * 100 + 16.66}%`
  const toX = `${(to / 3) * 100 + 16.66}%`
  const goingRight = to > from

  return (
    <svg
      viewBox="0 0 600 40"
      className="w-full"
      style={{ height: 40, overflow: 'visible' }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#34d399" />
        </marker>
      </defs>
      <motion.line
        x1={`${(from / 3) * 100 + 16.66}%`}
        y1="20"
        x2={`${(to / 3) * 100 + 16.66}%`}
        y2="20"
        stroke="#34d399"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
        strokeDasharray="4 3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </svg>
  )
}
