import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d'
import Fuse from 'fuse.js'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Network,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react'
import { glossary } from '@/content/glossary'
import type { GlossaryTerm } from '@/content/types'
import { allConcepts, conceptMap } from '@/content'

interface GraphNode {
  id: string
  term: string
  definition: string
  concepts: string[]
  size: number
  color: string
  levelTag: '1' | '2' | '3' | 'multi' | 'slate'
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  weight: number
  opacity: number
}

// Level colors matching design system
const LEVEL_COLORS = {
  1: '#34d399',      // emerald-400
  2: '#fbbf24',      // amber-400
  3: '#fb7185',      // rose-400
  multi: '#94a3b8',  // slate-400
}

export function GraphPage() {
  const navigate = useNavigate()
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Resize handling
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // 1. Build Graph Nodes & Edges
  const graphData = useMemo(() => {
    // Generate Nodes
    const nodes: GraphNode[] = glossary.map(term => {
      const conceptIds = term.concepts || []
      const count = Math.max(1, conceptIds.length)

      // Calculate size: min 4px, max 18px proportional to occurrences
      const size = Math.min(18, Math.max(4, 3.5 + count * 2.2))

      // Determine level colors: first concept level or slate if multiple different levels
      const distinctLevels = new Set(
        conceptIds.map(cid => conceptMap[cid]?.level).filter(Boolean)
      )

      let color = LEVEL_COLORS.multi
      let levelTag: '1' | '2' | '3' | 'multi' | 'slate' = 'multi'

      if (distinctLevels.size === 1) {
        const lvl = Array.from(distinctLevels)[0] as 1 | 2 | 3
        color = LEVEL_COLORS[lvl]
        levelTag = String(lvl) as '1' | '2' | '3'
      } else if (distinctLevels.size === 0) {
        color = LEVEL_COLORS.multi
        levelTag = 'slate'
      }

      return {
        id: term.id,
        term: term.term,
        definition: term.definition,
        concepts: conceptIds,
        size,
        color,
        levelTag,
      }
    })

    // Generate Edges: co-occurrence in >= 2 concepts
    const pairCounts: Record<string, number> = {}
    for (const concept of allConcepts) {
      const terms = concept.terms || []
      for (let i = 0; i < terms.length; i++) {
        for (let j = i + 1; j < terms.length; j++) {
          const t1 = terms[i]
          const t2 = terms[j]
          const key = t1 < t2 ? `${t1}:::${t2}` : `${t2}:::${t1}`
          pairCounts[key] = (pairCounts[key] || 0) + 1
        }
      }
    }

    const links: GraphLink[] = []
    let maxWeight = 2
    for (const [key, count] of Object.entries(pairCounts)) {
      if (count >= 2) {
        if (count > maxWeight) maxWeight = count
        const [source, target] = key.split(':::')
        links.push({
          source,
          target,
          weight: count,
          opacity: 0.15 + (count / 6) * 0.6,
        })
      }
    }

    // Normalize opacity
    links.forEach(l => {
      l.opacity = Math.min(0.85, 0.2 + (l.weight / maxWeight) * 0.6)
    })

    return { nodes, links }
  }, [])

  // Quick adjacency index for instant O(1) hover lookup
  const { neighborMap, connectedLinkMap } = useMemo(() => {
    const neighborMap = new Map<string, Set<string>>()
    const connectedLinkMap = new Map<string, Set<GraphLink>>()

    graphData.nodes.forEach(n => {
      neighborMap.set(n.id, new Set())
      connectedLinkMap.set(n.id, new Set())
    })

    graphData.links.forEach(link => {
      const s = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source
      const t = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
      neighborMap.get(s)?.add(t)
      neighborMap.get(t)?.add(s)
      connectedLinkMap.get(s)?.add(link)
      connectedLinkMap.get(t)?.add(link)
    })

    return { neighborMap, connectedLinkMap }
  }, [graphData])

  // 2. Fuse.js Search Setup
  const fuse = useMemo(() => {
    return new Fuse(graphData.nodes, {
      keys: [
        { name: 'term', weight: 0.7 },
        { name: 'definition', weight: 0.3 },
      ],
      threshold: 0.35,
      minMatchCharLength: 2,
    })
  }, [graphData.nodes])

  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return null
    const results = fuse.search(searchQuery.trim())
    return new Set(results.map(r => r.item.id))
  }, [fuse, searchQuery])

  // Center on node if selected from search or click
  const focusNode = useCallback((node: GraphNode) => {
    if (fgRef.current && node.x !== undefined && node.y !== undefined) {
      fgRef.current.centerAt(node.x, node.y, 800)
      fgRef.current.zoom(3.5, 800)
    }
  }, [])

  // Node hover handler
  const handleNodeHover = useCallback((node: any) => {
    setHoverNodeId(node ? (node as GraphNode).id : null)
  }, [])

  // Node click handler
  const handleNodeClick = useCallback((node: any) => {
    const gNode = node as GraphNode
    setSelectedNode(gNode)
    focusNode(gNode)
  }, [focusNode])

  // Custom Canvas Rendering for Dark Mode & Developer Aesthetic
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const gNode = node as GraphNode
    const isHovered = hoverNodeId === gNode.id
    const isSelected = selectedNode?.id === gNode.id
    const isSearchMatch = matchingNodeIds ? matchingNodeIds.has(gNode.id) : false
    const isNeighbor = hoverNodeId ? neighborMap.get(hoverNodeId)?.has(gNode.id) : false

    const isHighlighted = isHovered || isSelected || isSearchMatch || isNeighbor
    const isDimmed = (hoverNodeId && !isHighlighted) || (matchingNodeIds && !isSearchMatch)

    const r = gNode.size || 5

    ctx.save()
    ctx.globalAlpha = isDimmed ? 0.12 : 1

    // Node Circle
    ctx.beginPath()
    ctx.arc(gNode.x || 0, gNode.y || 0, r, 0, 2 * Math.PI, false)
    ctx.fillStyle = gNode.color
    ctx.fill()

    // Outer Glow Ring for Highlighted Nodes
    if (isHighlighted) {
      ctx.lineWidth = Math.max(2 / globalScale, 1.2)
      ctx.strokeStyle = isSearchMatch || isSelected ? '#ffffff' : gNode.color
      ctx.stroke()

      if (isHovered || isSelected) {
        ctx.beginPath()
        ctx.arc(gNode.x || 0, gNode.y || 0, r + 4 / globalScale, 0, 2 * Math.PI, false)
        ctx.lineWidth = 1 / globalScale
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.stroke()
      }
    }

    // Node Label
    const showLabel = isHighlighted || globalScale > 2.0 || r >= 11
    if (showLabel && !isDimmed) {
      const fontSize = Math.max(10 / globalScale, 3)
      ctx.font = `${Math.round(fontSize)}px JetBrains Mono, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Label background pill for legibility
      const text = gNode.term
      const textWidth = ctx.measureText(text).width
      const textY = (gNode.y || 0) + r + 2.5 / globalScale

      ctx.fillStyle = 'rgba(2, 6, 23, 0.75)'
      ctx.fillRect(
        (gNode.x || 0) - textWidth / 2 - 2 / globalScale,
        textY - 1 / globalScale,
        textWidth + 4 / globalScale,
        fontSize + 2 / globalScale
      )

      ctx.fillStyle = isHighlighted ? '#ffffff' : '#cbd5e1'
      ctx.fillText(text, gNode.x || 0, textY)
    }

    ctx.restore()
  }, [hoverNodeId, selectedNode, matchingNodeIds, neighborMap])

  // Custom Link Rendering
  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const sNode = link.source as GraphNode
    const tNode = link.target as GraphNode

    if (!sNode || !tNode || sNode.x === undefined || tNode.x === undefined) return

    const isConnectedToHover = hoverNodeId === sNode.id || hoverNodeId === tNode.id
    const isDimmed = hoverNodeId ? !isConnectedToHover : (matchingNodeIds ? !(matchingNodeIds.has(sNode.id) && matchingNodeIds.has(tNode.id)) : false)

    ctx.save()
    if (isConnectedToHover) {
      ctx.globalAlpha = 0.9
      ctx.strokeStyle = '#60a5fa' // sky-400
      ctx.lineWidth = Math.max(2 / globalScale, 1.2)
    } else {
      ctx.globalAlpha = isDimmed ? 0.03 : link.opacity || 0.25
      ctx.strokeStyle = '#64748b' // slate-500
      ctx.lineWidth = Math.max(1 / globalScale, 0.6)
    }

    ctx.beginPath()
    ctx.moveTo(sNode.x, sNode.y || 0)
    ctx.lineTo(tNode.x, tNode.y || 0)
    ctx.stroke()
    ctx.restore()
  }, [hoverNodeId, matchingNodeIds])

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden flex" ref={containerRef}>
      {/* Top Floating Controls & Search */}
      <div className="absolute top-5 left-6 z-20 flex flex-col gap-3 w-80 sm:w-96 pointer-events-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 380+ backend terms..."
            className="w-full bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-100 text-sm rounded-xl pl-9 pr-8 py-2.5 shadow-xl placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search match stats */}
        {matchingNodeIds && (
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 flex items-center justify-between shadow-lg">
            <span>Found {matchingNodeIds.size} matching terms</span>
            {matchingNodeIds.size > 0 && (
              <button
                onClick={() => {
                  const firstId = Array.from(matchingNodeIds)[0]
                  const node = graphData.nodes.find(n => n.id === firstId)
                  if (node) {
                    setSelectedNode(node)
                    focusNode(node)
                  }
                }}
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                Jump to first <Sparkles className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Top-Right Graph Controls */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 p-1 rounded-xl shadow-xl">
        <button
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 300)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 300)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            fgRef.current?.zoomToFit(600, 40)
          }}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main ForceGraph Canvas */}
      <div className="flex-1 w-full h-full">
        {dimensions.width > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#020617"
            nodeRelSize={1}
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={(node, color, ctx) => {
              const gNode = node as GraphNode
              const r = (gNode.size || 5) + 3
              ctx.fillStyle = color
              ctx.beginPath()
              ctx.arc(gNode.x || 0, gNode.y || 0, r, 0, 2 * Math.PI, false)
              ctx.fill()
            }}
            linkCanvasObject={drawLink}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            d3AlphaDecay={0.03}
            d3VelocityDecay={0.3}
          />
        )}
      </div>

      {/* Bottom-Left Legend */}
      <div className="absolute bottom-6 left-6 z-20 bg-slate-900/90 backdrop-blur border border-slate-800/90 rounded-2xl p-4 shadow-2xl text-xs flex flex-col gap-2.5 max-w-xs">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase">
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          Terminology Graph
        </div>

        {/* Level Badges */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span>Level 1 (Basic)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span>Level 2 (Interm.)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm" />
            <span>Level 3 (Adv.)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm" />
            <span>Multi-level</span>
          </div>
        </div>

        {/* Size Indicator */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
          <span>Node size:</span>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Usage Frequency</span>
            <span className="w-3.5 h-3.5 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>

      {/* Right Side Detail Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-md border-l border-slate-800 z-30 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Glossary Concept Node
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Term Title */}
              <div>
                <h2 className="text-2xl font-bold font-mono text-slate-100 mb-2">
                  {selectedNode.term}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700 bg-slate-800 text-slate-300">
                    ID: {selectedNode.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                    {selectedNode.concepts.length} Concept Reference{selectedNode.concepts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Definition */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Definition
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {selectedNode.definition}
                </p>
              </div>

              {/* Appears In Concepts */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Appears In ({selectedNode.concepts.length} Concept{selectedNode.concepts.length !== 1 ? 's' : ''})
                </h3>

                <div className="space-y-2.5">
                  {selectedNode.concepts.map(cid => {
                    const concept = conceptMap[cid]
                    if (!concept) return null

                    const levelBadgeClass =
                      concept.level === 1
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : concept.level === 2
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-400'

                    return (
                      <Link
                        key={cid}
                        to={`/concept/${cid}`}
                        className="group block p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${levelBadgeClass}`}>
                              L{concept.level}
                            </span>
                            <span className="font-semibold text-slate-200 group-hover:text-white text-sm transition">
                              {concept.title}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {concept.oneLiner}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 flex items-center justify-between font-mono">
              <span>Scroll to zoom · Drag to pan</span>
              <button
                onClick={() => focusNode(selectedNode)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Center Node <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
