import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * URLMatcher
 *
 * Each step's highlights[0] is a JSON string:
 * {
 *   url: string,
 *   routes: { pattern: string, method: string, active: boolean, match: boolean | null }[],
 *   params?: Record<string, string>   // extracted params on match
 * }
 */

interface RouteRow {
  pattern: string
  method: string
  active: boolean
  match: boolean | null  // null = not yet tested
}

interface URLMatcherStep {
  url: string
  routes: RouteRow[]
  params?: Record<string, string>
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-400 bg-emerald-400/10',
  POST: 'text-amber-400 bg-amber-400/10',
  PUT: 'text-blue-400 bg-blue-400/10',
  PATCH: 'text-violet-400 bg-violet-400/10',
  DELETE: 'text-rose-400 bg-rose-400/10',
}

function parseStep(highlights: string[] | undefined): URLMatcherStep | null {
  if (!highlights?.[0]) return null
  try {
    return JSON.parse(highlights[0]) as URLMatcherStep
  } catch {
    return null
  }
}

function highlightURL(url: string, params: Record<string, string> = {}): React.ReactNode {
  if (Object.keys(params).length === 0) {
    return <span className="text-slate-200">{url}</span>
  }
  // Highlight param values in the URL
  let result = url
  const parts: React.ReactNode[] = []
  let remaining = url
  Object.entries(params).forEach(([, val]) => {
    const idx = remaining.indexOf(val)
    if (idx >= 0) {
      parts.push(<span key={remaining.slice(0, idx)} className="text-slate-300">{remaining.slice(0, idx)}</span>)
      parts.push(<span key={val} className="text-emerald-400 font-semibold">{val}</span>)
      remaining = remaining.slice(idx + val.length)
    }
  })
  if (remaining) parts.push(<span key="rest" className="text-slate-300">{remaining}</span>)
  return parts.length > 0 ? parts : <span className="text-slate-200">{url}</span>
}

export function URLMatcher({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = steps[currentStep]
  const data = parseStep(step.highlights)

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
          <div className="p-5 space-y-4">
            {/* URL bar */}
            <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3">
              <div className="text-xs font-mono text-slate-500 mb-1 uppercase tracking-wider">Incoming Request URL</div>
              <div className="font-mono text-base leading-relaxed">
                {highlightURL(data.url, data.params)}
              </div>
            </div>

            {/* Route table */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider px-1 mb-2">Route Patterns</div>
              {data.routes.map((route, i) => (
                <motion.div
                  key={`${route.pattern}-${i}`}
                  animate={{
                    scale: route.active ? 1.015 : 1,
                    backgroundColor: route.active
                      ? route.match === true
                        ? 'rgba(52, 211, 153, 0.07)'
                        : route.match === false
                        ? 'rgba(251, 113, 133, 0.07)'
                        : 'rgba(255,255,255,0.03)'
                      : 'transparent',
                  }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors duration-300"
                  style={{
                    borderColor: route.active
                      ? route.match === true
                        ? 'rgba(52,211,153,0.35)'
                        : route.match === false
                        ? 'rgba(251,113,133,0.35)'
                        : 'rgba(100,116,139,0.4)'
                      : 'rgba(30,41,59,0.6)',
                  }}
                >
                  {/* Method badge */}
                  <span className={`flex-shrink-0 text-xs font-mono font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[route.method] ?? 'text-slate-400 bg-slate-700'}`}>
                    {route.method}
                  </span>

                  {/* Pattern */}
                  <span className="flex-1 font-mono text-sm text-slate-300">{route.pattern}</span>

                  {/* Match badge */}
                  <AnimatePresence>
                    {route.active && route.match !== null && (
                      <motion.span
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex-shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
                          route.match
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                            : 'text-rose-400 bg-rose-400/10 border-rose-400/30'
                        }`}
                      >
                        {route.match ? '✓ match' : '✗ miss'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Extracted params */}
            <AnimatePresence>
              {data.params && Object.keys(data.params).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg bg-emerald-400/5 border border-emerald-400/20 p-3"
                >
                  <div className="text-xs font-mono text-emerald-400/70 uppercase tracking-wider mb-2">Extracted Params (req.params)</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.params).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1.5 bg-slate-800 border border-emerald-400/20 rounded px-2.5 py-1">
                        <span className="font-mono text-xs text-slate-400">{key}:</span>
                        <span className="font-mono text-xs text-emerald-400 font-semibold">"{val}"</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center">
            <p className="text-sm text-slate-500 font-mono italic">No URL data for this step.</p>
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
