import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

const STAGE_LABELS = ['Request In', 'Logger', 'Auth', 'Body Parser', 'Route Handler']

type StageState = 'idle' | 'active' | 'pass' | 'stop' | 'throw'

function getStageState(stageIndex: number, currentStep: number, stepHighlights: string[]): StageState {
  const highlightKey = stepHighlights?.[0] ?? ''
  const stageNum = parseInt(highlightKey.replace('stage-', ''), 10)

  if (isNaN(stageNum)) return stageIndex < currentStep ? 'pass' : 'idle'
  if (stageIndex === stageNum) return 'active'
  if (stageIndex < stageNum) return 'pass'
  return 'idle'
}

const stageColors: Record<StageState, string> = {
  idle: 'border-slate-700 bg-slate-800/50 text-slate-500',
  active: 'border-emerald-400 bg-emerald-400/10 text-emerald-300',
  pass: 'border-slate-600 bg-slate-800 text-slate-400',
  stop: 'border-rose-400 bg-rose-400/10 text-rose-300',
  throw: 'border-amber-400 bg-amber-400/10 text-amber-300',
}

const stageDot: Record<StageState, string> = {
  idle: 'bg-slate-700',
  active: 'bg-emerald-400',
  pass: 'bg-slate-500',
  stop: 'bg-rose-400',
  throw: 'bg-amber-400',
}

export function AnimatedPipeline({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]
  const highlights = step.highlights ?? []

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
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Pipeline stages */}
        <div className="p-6">
          <div className="flex items-center gap-0">
            {STAGE_LABELS.map((label, i) => {
              const state = getStageState(i, currentStep, highlights)
              const isLast = i === STAGE_LABELS.length - 1
              return (
                <div key={i} className="flex items-center flex-1">
                  <motion.div
                    animate={{ scale: state === 'active' ? 1.05 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`relative flex-1 border-2 rounded-lg px-2 py-3 text-center transition-all duration-300 ${stageColors[state]}`}
                  >
                    <div className="text-xs font-mono font-medium leading-tight">{label}</div>
                    <div className={`mt-1 mx-auto w-2 h-2 rounded-full ${stageDot[state]}`} />
                    {state === 'active' && (
                      <motion.div
                        className="absolute inset-0 rounded-lg border-2 border-emerald-400"
                        animate={{ opacity: [0.6, 0.2, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  {!isLast && (
                    <div className="flex-shrink-0 w-6 flex items-center justify-center">
                      <motion.div
                        animate={{
                          backgroundColor: state === 'pass' || state === 'active' ? '#34d399' : '#334155',
                        }}
                        className="w-full h-0.5 transition-all duration-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Token moving along pipeline */}
          <div className="mt-4 relative h-6">
            <motion.div
              animate={{
                left: `${(currentStep / (steps.length - 1)) * 90 + 2}%`,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute top-0 w-5 h-5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30 flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-slate-900" />
            </motion.div>
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
