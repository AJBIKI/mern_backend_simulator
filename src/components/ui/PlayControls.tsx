import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface PlayControlsProps {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  onPlay: () => void
  onStep: (step: number) => void
  onReset: () => void
  stepLabel?: string
}

export function PlayControls({
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onStep,
  onReset,
  stepLabel,
}: PlayControlsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-all"
        aria-label="Reset"
      >
        <RotateCcw size={13} />
        Reset
      </button>

      {/* Play / Pause */}
      <button
        onClick={onPlay}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-sm transition-all"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Step forward */}
      <button
        onClick={() => onStep(Math.min(currentStep + 1, totalSteps - 1))}
        disabled={currentStep >= totalSteps - 1}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next step"
      >
        <SkipForward size={13} />
        Step
      </button>

      {/* Step dots */}
      <div className="flex items-center gap-1.5 ml-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => onStep(i)}
            animate={{ scale: i === currentStep ? 1.3 : 1 }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentStep
                ? 'bg-slate-200'
                : i < currentStep
                ? 'bg-slate-500'
                : 'bg-slate-700'
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Step counter */}
      <span className="text-xs text-slate-500 font-mono ml-1">
        {currentStep + 1} / {totalSteps}
        {stepLabel && <span className="ml-2 text-slate-400">{stepLabel}</span>}
      </span>
    </div>
  )
}
