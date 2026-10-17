import { useVizPlayback } from '@/hooks/useVizPlayback'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * TokenBucket
 *
 * Simulates a rate-limiting token bucket.
 * Bucket capacity = N tokens.
 * Refill rate = refill drops added periodically or per step.
 * Incoming request consumes 1 token.
 * When empty (tokens === 0), request rejected with 429 Too Many Requests.
 */

interface TokenBucketData {
  capacity?: number
  tokens: number
  action: 'consume' | 'refill' | 'rejected'
  requestAllowed: boolean
  message?: string
}

function parseBucketData(highlights: string[] | undefined, currentStep: number): TokenBucketData {
  if (highlights && highlights.length > 0) {
    try {
      const parsed = JSON.parse(highlights[0])
      if (parsed && typeof parsed === 'object') {
        return {
          capacity: parsed.capacity ?? 5,
          tokens: parsed.tokens ?? 3,
          action: parsed.action ?? (parsed.tokens > 0 ? 'consume' : 'rejected'),
          requestAllowed: parsed.requestAllowed ?? (parsed.tokens > 0),
          message: parsed.message,
        }
      }
    } catch {
      if (highlights[0] === 'rejected' || highlights[0] === '429') {
        return { capacity: 5, tokens: 0, action: 'rejected', requestAllowed: false, message: '429 Rate Limit Exceeded' }
      }
      if (highlights[0] === 'refill') {
        return { capacity: 5, tokens: 4, action: 'refill', requestAllowed: true, message: 'Bucket refilled +2 tokens' }
      }
    }
  }

  // Fallback defaults per step
  const capacity = 5
  if (currentStep === 0) return { capacity, tokens: 5, action: 'consume', requestAllowed: true, message: 'Initial state: full bucket (5 tokens)' }
  if (currentStep === 1) return { capacity, tokens: 4, action: 'consume', requestAllowed: true, message: 'Req 1 arrives: -1 token, allowed (4 left)' }
  if (currentStep === 2) return { capacity, tokens: 1, action: 'consume', requestAllowed: true, message: 'Burst traffic: -3 tokens, allowed (1 left)' }
  if (currentStep === 3) return { capacity, tokens: 0, action: 'rejected', requestAllowed: false, message: 'Bucket depleted: 0 tokens left! 429 Too Many Requests' }
  return { capacity, tokens: 3, action: 'refill', requestAllowed: true, message: 'Refill interval elapsed: +3 tokens restored' }
}

export function TokenBucket({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const { isPlaying, handlePlay, handleReset } = useVizPlayback({
    currentStep,
    totalSteps: steps.length,
    onStep,
    onReset,
    intervalMs: 1800,
  })
  const step = steps[currentStep]
  const data = parseBucketData(step.highlights, currentStep)
  const capacity = data.capacity ?? 5

  

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase">Rate Limiter:</span>
            <span className="text-xs font-mono text-slate-300 font-semibold">
              Bucket Capacity: {capacity}
            </span>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              data.requestAllowed
                ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                : 'text-rose-400 bg-rose-400/10 border-rose-400/30'
            }`}
          >
            {data.requestAllowed ? '✓ 200 OK (Allowed)' : '✗ 429 Too Many Requests'}
          </span>
        </div>

        {/* Bucket Visualization */}
        <div className="p-8 flex flex-col md:flex-row items-center justify-around gap-8">
          {/* Incoming Request indicator */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-mono text-slate-500 mb-2">Incoming Request</div>
            <motion.div
              animate={{
                scale: data.action === 'consume' || data.action === 'rejected' ? 1.1 : 1,
                borderColor: data.requestAllowed ? '#34d399' : '#fb7185',
              }}
              className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-xs ${
                data.requestAllowed
                  ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                  : 'border-rose-400 bg-rose-400/10 text-rose-300'
              }`}
            >
              REQ
            </motion.div>
            <div className="mt-2 text-[11px] font-mono text-slate-400">Cost: 1 token</div>
          </div>

          {/* Center: The Physical Bucket */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono text-slate-500 mb-2">Token Reservoir</div>
            <div className="relative w-44 h-44 rounded-b-3xl border-b-4 border-x-4 border-slate-600 bg-slate-950/80 p-3 flex flex-col justify-end items-center overflow-hidden">
              {/* Dropping refill indicator */}
              {data.action === 'refill' && (
                <motion.div
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute top-2 w-4 h-4 rounded-full bg-amber-400 animate-bounce shadow-md shadow-amber-400/50"
                />
              )}

              {/* Tokens Inside Bucket */}
              <div className="flex flex-wrap gap-2 justify-center items-end max-w-36 z-10">
                {Array.from({ length: capacity }).map((_, i) => {
                  const hasToken = i < data.tokens
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{
                        scale: hasToken ? 1 : 0.6,
                        opacity: hasToken ? 1 : 0.15,
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border transition-colors ${
                        hasToken
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-400/30'
                          : 'bg-slate-800 border-slate-700 text-slate-600'
                      }`}
                    >
                      🪙
                    </motion.div>
                  )
                })}
              </div>

              {/* Empty indicator */}
              {data.tokens === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-rose-950/40 text-rose-400 font-mono text-xs font-bold"
                >
                  DEPLETED
                </motion.div>
              )}
            </div>

            <div className="mt-2 text-xs font-mono text-slate-400">
              Tokens: <span className="font-bold text-amber-400">{data.tokens}</span> / {capacity}
            </div>
          </div>

          {/* Refill Rate indicator */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-mono text-slate-500 mb-2">Refill Interval</div>
            <div className="w-16 h-16 rounded-2xl border-2 border-slate-700 bg-slate-950 flex flex-col items-center justify-center font-mono text-xs text-amber-400">
              <span>+1/sec</span>
              <span className="text-[9px] text-slate-500">steady</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-400">Replenishes over time</div>
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
