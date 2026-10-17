import { motion, AnimatePresence } from 'framer-motion'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'
import { useVizPlayback } from '@/hooks/useVizPlayback'

const PHASES = [
  { id: 'timers', label: 'Timers', angle: -90, color: '#fbbf24' },
  { id: 'pending', label: 'Pending\nI/O', angle: -30, color: '#818cf8' },
  { id: 'poll', label: 'Poll', angle: 30, color: '#34d399' },
  { id: 'check', label: 'Check', angle: 90, color: '#06b6d4' },
  { id: 'close', label: 'Close', angle: 150, color: '#f97316' },
  { id: 'microtask-queue', label: 'Microtasks', angle: -150, color: '#ec4899' },
]

function phasePosition(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.cos(rad) * r,
    y: Math.sin(rad) * r,
  }
}

export function EventLoopClock({ steps, currentStep, onStep, onReset }: VizProps) {
  const { isPlaying, handlePlay, handleReset } = useVizPlayback({
    currentStep,
    totalSteps: steps.length,
    onStep,
    onReset,
    intervalMs: 1800,
  })
  const step = steps[currentStep]
  const activePhase = step?.highlights?.[0] ?? ''

  const cx = 160
  const cy = 160
  const R = 110

  // Token angle based on current active phase
  const activeIdx = PHASES.findIndex(p => p.id === activePhase)
  const tokenAngle = activeIdx >= 0 ? PHASES[activeIdx].angle : -90
  const tokenPos = phasePosition(tokenAngle, R - 10)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6">
          {/* Clock SVG */}
          <div className="w-full max-w-[280px] sm:max-w-[320px] mx-auto flex-shrink-0">
            <svg viewBox="0 0 320 320" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* Outer ring */}
              <circle cx={cx} cy={cy} r={R + 20} fill="none" stroke="#1e293b" strokeWidth="1" />
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Phase nodes */}
              {PHASES.map(phase => {
                const pos = phasePosition(phase.angle, R)
                const isActive = activePhase === phase.id
                const lines = phase.label.split('\n')
                return (
                  <g key={phase.id}>
                    {/* Spoke */}
                    <line
                      x1={cx} y1={cy}
                      x2={cx + pos.x} y2={cy + pos.y}
                      stroke={isActive ? phase.color : '#1e293b'}
                      strokeWidth={isActive ? 1.5 : 1}
                      style={{ transition: 'stroke 0.3s' }}
                    />
                    {/* Node circle */}
                    <motion.circle
                      cx={cx + pos.x}
                      cy={cy + pos.y}
                      r={isActive ? 22 : 18}
                      fill={isActive ? `${phase.color}20` : '#1e293b'}
                      stroke={isActive ? phase.color : '#334155'}
                      strokeWidth={isActive ? 2 : 1}
                      animate={{ r: isActive ? 22 : 18 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                    {/* Phase label */}
                    {lines.map((line, li) => (
                      <text
                        key={li}
                        x={cx + pos.x}
                        y={cy + pos.y + (lines.length === 1 ? 4 : li * 12 - 4)}
                        textAnchor="middle"
                        fill={isActive ? phase.color : '#64748b'}
                        fontSize="8"
                        fontFamily="JetBrains Mono, monospace"
                        style={{ transition: 'fill 0.3s' }}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                )
              })}

              {/* Center hub */}
              <circle cx={cx} cy={cy} r={28} fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <text x={cx} y={cy - 4} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono, monospace">Event</text>
              <text x={cx} y={cy + 6} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono, monospace">Loop</text>

              {/* Animated token */}
              <AnimatePresence>
                <motion.circle
                  key={activePhase}
                  cx={cx + tokenPos.x}
                  cy={cy + tokenPos.y}
                  r={6}
                  fill="#34d399"
                  animate={{
                    cx: cx + tokenPos.x,
                    cy: cy + tokenPos.y,
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14, opacity: { duration: 1, repeat: Infinity } }}
                />
              </AnimatePresence>
            </svg>
          </div>

          {/* Phase legend + queue visualization */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Phase Legend</div>
            {PHASES.map(phase => (
              <div
                key={phase.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  activePhase === phase.id ? 'bg-slate-800' : ''
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                <span
                  className="text-xs font-mono transition-colors duration-300"
                  style={{ color: activePhase === phase.id ? phase.color : '#64748b' }}
                >
                  {phase.label.replace('\n', ' ')}
                </span>
                {activePhase === phase.id && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-slate-500 ml-auto"
                  >
                    ← active
                  </motion.span>
                )}
              </div>
            ))}
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
