import { useVizPlayback } from '@/hooks/useVizPlayback'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { VizProps } from '@/lib/registerViz'
import { PlayControls } from '@/components/ui/PlayControls'

/**
 * TreeTraversal
 *
 * Visualizes B-Tree index traversal (IXSCAN) vs exhaustive collection scan (COLLSCAN).
 * Highlights can encode a JSON payload:
 * {
 *   mode: 'IXSCAN' | 'COLLSCAN',
 *   activeNodeId: string,
 *   scannedNodeIds?: string[],
 *   comparison?: string,
 *   result?: string
 * }
 */

interface TreeNode {
  id: string
  label: string
  keys: string[]
  level: number
  parentId?: string
}

interface TreeTraversalData {
  mode: 'IXSCAN' | 'COLLSCAN'
  activeNodeId?: string
  scannedNodeIds?: string[]
  comparison?: string
  result?: string
}

const TREE_NODES: TreeNode[] = [
  { id: 'root', label: 'Root [status = "active"]', keys: ['pending', 'shipped'], level: 0 },
  { id: 'child-1', label: 'Leaf A [< pending]', keys: ['created', 'draft'], level: 1, parentId: 'root' },
  { id: 'child-2', label: 'Leaf B [active]', keys: ['active: A-M', 'active: N-Z'], level: 1, parentId: 'root' },
  { id: 'child-3', label: 'Leaf C [> shipped]', keys: ['completed', 'refunded'], level: 1, parentId: 'root' },
]

function parseTreeData(highlights: string[] | undefined, currentStep: number): TreeTraversalData {
  if (highlights && highlights.length > 0) {
    try {
      const parsed = JSON.parse(highlights[0])
      if (parsed && typeof parsed === 'object') {
        return {
          mode: parsed.mode || (parsed.isCollscan ? 'COLLSCAN' : 'IXSCAN'),
          activeNodeId: parsed.activeNodeId,
          scannedNodeIds: parsed.scannedNodeIds || (parsed.activeNodeId ? [parsed.activeNodeId] : []),
          comparison: parsed.comparison,
          result: parsed.result,
        }
      }
    } catch {
      if (highlights[0] === 'collscan') {
        return {
          mode: 'COLLSCAN',
          scannedNodeIds: ['root', 'child-1', 'child-2', 'child-3'],
          comparison: 'Scanning every node sequentially (O(n))',
        }
      }
      return {
        mode: 'IXSCAN',
        activeNodeId: highlights[0],
        scannedNodeIds: [highlights[0]],
      }
    }
  }

  // Fallback progression
  if (currentStep === 0) {
    return { mode: 'IXSCAN', activeNodeId: 'root', scannedNodeIds: ['root'], comparison: 'Check root bounds' }
  } else if (currentStep === 1) {
    return { mode: 'IXSCAN', activeNodeId: 'child-2', scannedNodeIds: ['root', 'child-2'], comparison: 'Direct branch match' }
  }
  return { mode: 'COLLSCAN', scannedNodeIds: ['root', 'child-1', 'child-2', 'child-3'], comparison: 'Full tree scan' }
}

export function TreeTraversal({ steps, currentStep, onStep, onPlay, onReset }: VizProps) {
  const { isPlaying, handlePlay, handleReset } = useVizPlayback({
    currentStep,
    totalSteps: steps.length,
    onStep,
    onReset,
    intervalMs: 1800,
  })
  const step = steps[currentStep]
  const data = parseTreeData(step.highlights, currentStep)

  const isIXSCAN = data.mode === 'IXSCAN'

  

  const rootNode = TREE_NODES[0]
  const childNodes = TREE_NODES.slice(1)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Header bar with Mode badge & comparison text */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-500">Scan Strategy:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                isIXSCAN
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                  : 'text-rose-400 bg-rose-400/10 border-rose-400/30'
              }`}
            >
              {data.mode}
            </span>
          </div>
          {data.comparison && (
            <span className="text-xs font-mono text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/20">
              {data.comparison}
            </span>
          )}
        </div>

        {/* Tree Visualizer Area */}
        <div className="p-6 relative flex flex-col items-center">
          {/* Level 0: Root node */}
          <div className="mb-8 flex justify-center">
            <TreeNodeComponent node={rootNode} data={data} isIXSCAN={isIXSCAN} />
          </div>

          {/* Level 1: Child nodes */}
          <div className="w-full flex justify-around gap-4 pt-4 border-t border-dashed border-slate-800">
            {childNodes.map(child => (
              <TreeNodeComponent key={child.id} node={child} data={data} isIXSCAN={isIXSCAN} />
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

function TreeNodeComponent({
  node,
  data,
  isIXSCAN,
}: {
  node: TreeNode
  data: TreeTraversalData
  isIXSCAN: boolean
}) {
  const isTarget = data.activeNodeId === node.id
  const isScanned = data.scannedNodeIds?.includes(node.id)

  let borderClass = 'border-slate-800 bg-slate-950/70 text-slate-500'
  if (isTarget) {
    borderClass = 'border-emerald-400 bg-emerald-400/15 text-emerald-300 ring-2 ring-emerald-400/30'
  } else if (isScanned) {
    borderClass = isIXSCAN
      ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400/80'
      : 'border-rose-400/40 bg-rose-400/10 text-rose-300'
  }

  return (
    <motion.div
      animate={{ scale: isTarget ? 1.05 : 1 }}
      className={`px-3 py-2 rounded-lg border-2 text-center transition-all duration-300 ${borderClass} min-w-36`}
    >
      <div className="text-[11px] font-mono font-bold mb-1 truncate">{node.label}</div>
      <div className="flex justify-center gap-1">
        {node.keys.map((k, idx) => (
          <span
            key={idx}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300"
          >
            {k}
          </span>
        ))}
      </div>
      {isTarget && (
        <span className="inline-block mt-1 text-[9px] font-mono uppercase font-bold text-emerald-400">
          ● Pointer matched
        </span>
      )}
    </motion.div>
  )
}
