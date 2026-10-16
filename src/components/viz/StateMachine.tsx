import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * StateMachine
 *
 * Visualizes state transition flow.
 * Steps can provide in highlights[0] either:
 * - A simple state ID or JSON string specifying:
 *   {
 *     states?: { id: string; label: string; desc?: string }[];
 *     activeState: string;
 *     transitionLabel?: string;
 *     status?: 'idle' | 'success' | 'warning' | 'error';
 *   }
 * If states are not passed in highlights, default or inferred states are displayed.
 */

interface StateNode {
  id: string
  label: string
  desc?: string
}

interface StateMachineData {
  states?: StateNode[]
  activeState: string
  transitionLabel?: string
  status?: 'idle' | 'success' | 'warning' | 'error'
}

const statusColors = {
  idle: {
    border: 'border-slate-700',
    bg: 'bg-slate-800/60',
    text: 'text-slate-400',
    glow: 'rgba(100, 116, 139, 0.2)',
  },
  success: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-400/15',
    text: 'text-emerald-300',
    glow: 'rgba(52, 211, 153, 0.4)',
  },
  warning: {
    border: 'border-amber-400',
    bg: 'bg-amber-400/15',
    text: 'text-amber-300',
    glow: 'rgba(251, 191, 36, 0.4)',
  },
  error: {
    border: 'border-rose-400',
    bg: 'bg-rose-400/15',
    text: 'text-rose-300',
    glow: 'rgba(251, 113, 133, 0.4)',
  },
}

function parseStateData(highlights: string[] | undefined, defaultStates: StateNode[]): StateMachineData {
  if (!highlights || highlights.length === 0) {
    return { states: defaultStates, activeState: defaultStates[0]?.id || 'start' }
  }
  try {
    const parsed = JSON.parse(highlights[0])
    if (parsed && typeof parsed === 'object') {
      return {
        states: parsed.states || defaultStates,
        activeState: parsed.activeState || defaultStates[0]?.id || 'start',
        transitionLabel: parsed.transitionLabel,
        status: parsed.status || 'success',
      }
    }
  } catch {
    // String identifier
    return {
      states: defaultStates,
      activeState: highlights[0],
      status: 'success',
    }
  }
  return { states: defaultStates, activeState: defaultStates[0]?.id || 'start' }
}

export function StateMachine({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]

  // Default states built from steps if not explicitly passed
  const inferredStates: StateNode[] = steps.map((s, idx) => ({
    id: `state-${idx}`,
    label: s.label,
  }))

  const data = parseStateData(step.highlights, inferredStates)
  const states = data.states && data.states.length > 0 ? data.states : inferredStates
  const activeIndex = states.findIndex(
    s => s.id === data.activeState || s.label.toLowerCase() === data.activeState.toLowerCase()
  )
  const currentIdx = activeIndex >= 0 ? activeIndex : currentStep % states.length

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
        {/* State nodes container */}
        <div className="p-8">
          <div className="flex items-center justify-between relative">
            {states.map((st, i) => {
              const isActive = i === currentIdx
              const isPast = i < currentIdx
              const status = isActive ? (data.status || 'success') : isPast ? 'success' : 'idle'
              const color = statusColors[status]

              return (
                <div key={st.id || i} className="flex items-center flex-1 last:flex-none">
                  {/* Node */}
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.08 : 1,
                        boxShadow: isActive ? `0 0 20px ${color.glow}` : 'none',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className={`relative z-10 min-w-28 px-4 py-3 rounded-xl border-2 text-center transition-colors duration-300 ${
                        isActive ? `${color.border} ${color.bg}` : isPast ? 'border-slate-700 bg-slate-800/80' : 'border-slate-800 bg-slate-950/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? (status === 'error' ? 'bg-rose-400' : status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse') : isPast ? 'bg-slate-400' : 'bg-slate-700'
                          }`}
                        />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          S{i + 1}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-mono font-bold leading-tight transition-colors ${
                          isActive ? color.text : isPast ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {st.label}
                      </div>
                      {st.desc && (
                        <div className="text-[10px] text-slate-400 mt-1 font-mono truncate max-w-24">
                          {st.desc}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Connecting arrow / line */}
                  {i < states.length - 1 && (
                    <div className="flex-1 relative flex items-center justify-center px-2">
                      <div className="w-full h-0.5 bg-slate-800 relative">
                        <motion.div
                          animate={{
                            width: i < currentIdx ? '100%' : '0%',
                            backgroundColor: i < currentIdx ? '#34d399' : '#334155',
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full absolute left-0 top-0"
                        />
                      </div>
                      <span className="absolute right-0 text-slate-600 text-xs font-mono">▶</span>
                      {isActive && data.transitionLabel && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-5 text-[10px] font-mono text-amber-400/90 whitespace-nowrap bg-slate-950 px-1.5 py-0.5 rounded border border-amber-400/20"
                        >
                          {data.transitionLabel}
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>
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
