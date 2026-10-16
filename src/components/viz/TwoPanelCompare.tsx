import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * TwoPanelCompare
 *
 * steps[i].highlights encodes panel data as a JSON string:
 * {
 *   left:  { title: string, rows: { label: string, value: string }[], activeRow?: number },
 *   right: { title: string, rows: { label: string, value: string }[], activeRow?: number },
 *   badge?: { side: 'left'|'right', text: string, color: 'emerald'|'amber'|'rose' }
 * }
 *
 * If highlights is absent, the component falls back to the step label/caption only.
 */

interface PanelRow {
  label: string
  value: string
}

interface PanelData {
  title: string
  rows: PanelRow[]
  activeRow?: number
  color?: string
}

interface StepData {
  left: PanelData
  right: PanelData
  badge?: { side: 'left' | 'right'; text: string; color: 'emerald' | 'amber' | 'rose' }
}

const badgeColors = {
  emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/40',
  amber: 'text-amber-400 bg-amber-400/10 border-amber-400/40',
  rose: 'text-rose-400 bg-rose-400/10 border-rose-400/40',
}

const panelBorderColors: Record<string, string> = {
  emerald: 'border-emerald-400/30',
  amber: 'border-amber-400/30',
  rose: 'border-rose-400/30',
  default: 'border-slate-700',
}

const rowHighlightColors: Record<string, string> = {
  emerald: 'bg-emerald-400/10 border-l-2 border-emerald-400',
  amber: 'bg-amber-400/10 border-l-2 border-amber-400',
  rose: 'bg-rose-400/10 border-l-2 border-rose-400',
  default: 'bg-slate-700/40 border-l-2 border-slate-500',
}

function parseStepData(highlights: string[] | undefined): StepData | null {
  if (!highlights || highlights.length === 0) return null
  try {
    return JSON.parse(highlights[0]) as StepData
  } catch {
    return null
  }
}

function Panel({
  data,
  badge,
  showBadge,
}: {
  data: PanelData
  badge?: { text: string; color: 'emerald' | 'amber' | 'rose' }
  showBadge: boolean
}) {
  const borderColor = panelBorderColors[data.color ?? 'default']
  return (
    <div className={`flex-1 rounded-xl border bg-slate-900 overflow-hidden ${borderColor}`}>
      {/* Panel header */}
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <span className="text-sm font-mono font-semibold text-slate-200">{data.title}</span>
        <AnimatePresence>
          {showBadge && badge && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`text-xs font-mono px-2 py-0.5 rounded-full border ${badgeColors[badge.color]}`}
            >
              {badge.text}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Rows */}
      <div className="p-2 space-y-1">
        {data.rows.map((row, i) => {
          const isActive = data.activeRow === i
          const hc = rowHighlightColors[isActive ? (data.color ?? 'default') : '']
          return (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0.55 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive ? rowHighlightColors[data.color ?? 'default'] : 'hover:bg-slate-800/40'
              }`}
            >
              <span className="text-xs font-mono text-slate-500 flex-shrink-0 w-24 pt-0.5">{row.label}</span>
              <span className="text-xs text-slate-300 flex-1 leading-relaxed">{row.value}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export function TwoPanelCompare({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]
  const data = parseStepData(step.highlights)

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
        {data ? (
          <div className="p-5">
            <div className="flex gap-4">
              <Panel
                data={data.left}
                badge={data.badge?.side === 'left' ? { text: data.badge.text, color: data.badge.color } : undefined}
                showBadge={!!data.badge && data.badge.side === 'left'}
              />

              {/* Divider */}
              <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                <div className="w-px flex-1 bg-slate-700" />
                <span className="text-slate-600 text-xs font-mono">vs</span>
                <div className="w-px flex-1 bg-slate-700" />
              </div>

              <Panel
                data={data.right}
                badge={data.badge?.side === 'right' ? { text: data.badge.text, color: data.badge.color } : undefined}
                showBadge={!!data.badge && data.badge.side === 'right'}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center">
            <p className="text-sm text-slate-500 font-mono italic">No panel data for this step.</p>
          </div>
        )}

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
