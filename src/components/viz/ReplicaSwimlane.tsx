import { useVizPlayback } from '@/hooks/useVizPlayback'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * ReplicaSwimlane
 *
 * Top: Primary node (Read/Write)
 * Below: 2-3 Secondary nodes (Read-Only)
 * Shows replication flow via oplog, replication lag, and Read Preference toggle (Primary vs SecondaryPreferred).
 *
 * Highlights JSON schema:
 * {
 *   operation: 'write_primary' | 'oplog_replicate' | 'sync_complete' | 'read_secondary',
 *   writeConcern?: 'w:1' | 'w:majority' | 'j:true',
 *   readPreference?: 'primary' | 'secondaryPreferred',
 *   primaryStatus: 'writing' | 'idle' | 'committed',
 *   secondaries: {
 *     id: string;
 *     label: string;
 *     lagMs: number;
 *     state: 'synced' | 'replicating' | 'lagging' | 'reading';
 *   }[]
 * }
 */

interface SecondaryNode {
  id: string
  label: string
  lagMs: number
  state: 'synced' | 'replicating' | 'lagging' | 'reading'
}

interface ReplicaData {
  operation: string
  writeConcern?: string
  readPreference?: string
  primaryStatus: 'writing' | 'idle' | 'committed'
  secondaries: SecondaryNode[]
}

const DEFAULT_SECONDARIES: SecondaryNode[] = [
  { id: 'sec-1', label: 'Secondary A (us-east)', lagMs: 0, state: 'synced' },
  { id: 'sec-2', label: 'Secondary B (us-west)', lagMs: 12, state: 'replicating' },
  { id: 'sec-3', label: 'Secondary C (eu-central)', lagMs: 120, state: 'lagging' },
]

function parseData(highlights: string[] | undefined, currentStep: number): ReplicaData {
  if (highlights && highlights.length > 0) {
    try {
      const parsed = JSON.parse(highlights[0])
      if (parsed && typeof parsed === 'object') {
        return {
          operation: parsed.operation || 'replicate',
          writeConcern: parsed.writeConcern || 'w:majority',
          readPreference: parsed.readPreference || 'primary',
          primaryStatus: parsed.primaryStatus || 'writing',
          secondaries: parsed.secondaries || DEFAULT_SECONDARIES,
        }
      }
    } catch {
      // String shorthand
    }
  }

  // Fallback defaults
  if (currentStep === 0) {
    return {
      operation: 'write_primary',
      writeConcern: 'w:majority',
      readPreference: 'primary',
      primaryStatus: 'writing',
      secondaries: [
        { id: 'sec-1', label: 'Secondary A', lagMs: 0, state: 'synced' },
        { id: 'sec-2', label: 'Secondary B', lagMs: 0, state: 'synced' },
      ],
    }
  } else if (currentStep === 1) {
    return {
      operation: 'oplog_replicate',
      writeConcern: 'w:majority',
      readPreference: 'primary',
      primaryStatus: 'committed',
      secondaries: [
        { id: 'sec-1', label: 'Secondary A', lagMs: 5, state: 'replicating' },
        { id: 'sec-2', label: 'Secondary B', lagMs: 45, state: 'lagging' },
      ],
    }
  }
  return {
    operation: 'read_secondary',
    writeConcern: 'w:majority',
    readPreference: 'secondaryPreferred',
    primaryStatus: 'idle',
    secondaries: [
      { id: 'sec-1', label: 'Secondary A', lagMs: 0, state: 'reading' },
      { id: 'sec-2', label: 'Secondary B', lagMs: 0, state: 'synced' },
    ],
  }
}

export function ReplicaSwimlane({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const { isPlaying, handlePlay, handleReset } = useVizPlayback({
    currentStep,
    totalSteps: steps.length,
    onStep,
    onReset,
    intervalMs: 1800,
  })
  const step = steps[currentStep]
  const data = parseData(step.highlights, currentStep)

  

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Top bar controls / metadata */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 uppercase">MongoDB Replica Set</span>
            {data.writeConcern && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                Write Concern: {data.writeConcern}
              </span>
            )}
          </div>
          {data.readPreference && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
              Read Pref: {data.readPreference}
            </span>
          )}
        </div>

        {/* Replica Topology Area */}
        <div className="p-6 flex flex-col items-center gap-6">
          {/* 1. Primary Node */}
          <div className="w-full max-w-md">
            <motion.div
              animate={{
                scale: data.primaryStatus === 'writing' ? 1.03 : 1,
                borderColor: data.primaryStatus === 'writing' ? '#34d399' : '#475569',
              }}
              className="p-4 rounded-xl border-2 bg-slate-950 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold font-mono">
                  PRI
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200">Primary Member (Leader)</div>
                  <div className="text-[11px] font-mono text-slate-400">Accepts all writes → writes to local.oplog</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                READ/WRITE
              </span>
            </motion.div>
          </div>

          {/* Oplog Replication Stream Arrows */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>▼</span>
            <span className="text-[11px] text-slate-400">Asynchronous Oplog Tailing & Replication</span>
            <span>▼</span>
          </div>

          {/* 2. Secondary Members Row */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.secondaries.map(sec => {
              const isReplicating = sec.state === 'replicating'
              const isLagging = sec.state === 'lagging'
              const isReading = sec.state === 'reading'

              let borderColor = 'border-slate-800'
              let badgeColor = 'text-slate-400 bg-slate-800 border-slate-700'
              if (isReading) {
                borderColor = 'border-amber-400'
                badgeColor = 'text-amber-300 bg-amber-400/10 border-amber-400/30'
              } else if (isReplicating) {
                borderColor = 'border-emerald-400'
                badgeColor = 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30'
              } else if (isLagging) {
                borderColor = 'border-rose-400'
                badgeColor = 'text-rose-300 bg-rose-400/10 border-rose-400/30'
              }

              return (
                <motion.div
                  key={sec.id}
                  animate={{ scale: isReading ? 1.03 : 1 }}
                  className={`p-3.5 rounded-xl border-2 bg-slate-950/70 ${borderColor} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300">{sec.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {sec.state.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Replication lag:</span>
                    <span className={`font-bold ${sec.lagMs > 50 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {sec.lagMs} ms
                    </span>
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
