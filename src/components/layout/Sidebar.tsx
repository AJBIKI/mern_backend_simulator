import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { level1Concepts } from '@/content/level1'
import { level2Concepts } from '@/content/level2'
import { level3Concepts } from '@/content/level3'
import { useProgress, type ProgressFilter, type ConceptStatus } from '@/hooks/useProgress'
import type { Concept } from '@/content/types'

const levels = [
  { level: 1 as const, label: 'Basic', color: 'text-emerald-400', dot: 'bg-emerald-400', concepts: level1Concepts },
  { level: 2 as const, label: 'Intermediate', color: 'text-amber-400', dot: 'bg-amber-400', concepts: level2Concepts },
  { level: 3 as const, label: 'Advanced', color: 'text-rose-400', dot: 'bg-rose-400', concepts: level3Concepts },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function ConceptLink({
  concept,
  isActive,
  status,
}: {
  concept: Concept
  isActive: boolean
  status: ConceptStatus
}) {
  const navigate = useNavigate()
  const isDone = status === 'done'
  const isInProgress = status === 'in_progress'

  return (
    <button
      onClick={() => navigate(`/concept/${concept.id}`)}
      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center gap-2 group ${
        isActive
          ? 'bg-slate-800 text-slate-100 font-medium'
          : isDone
          ? 'text-slate-400 opacity-60 hover:opacity-100 hover:bg-slate-800/40 hover:text-slate-200'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {/* Status indicator: checkmark for completed, amber half for in progress, slate dot for not started */}
      {isDone ? (
        <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
          ✓
        </span>
      ) : isInProgress ? (
        <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-bold">
          ◐
        </span>
      ) : (
        <span className="flex-shrink-0 w-1.5 h-1.5 mx-1 rounded-full bg-slate-700 group-hover:bg-slate-500 transition-colors" />
      )}
      <span className="truncate flex-1">{concept.title}</span>
    </button>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { getStatus, levelStats } = useProgress()
  const [filter, setFilter] = useState<ProgressFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const currentId = location.pathname.startsWith('/concept/')
    ? location.pathname.replace('/concept/', '')
    : null

  // Filter and search logic
  const filteredLevels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return levels.map(lvl => {
      const filteredConcepts = lvl.concepts.filter(c => {
        const status = getStatus(c.id)
        if (filter !== 'all' && status !== filter) return false
        if (q && !c.title.toLowerCase().includes(q)) return false
        return true
      })
      const stats = levelStats(lvl.level)
      return {
        ...lvl,
        filteredConcepts,
        stats,
      }
    })
  }, [filter, searchQuery, getStatus, levelStats])

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <AnimatePresence initial={false}>
        <motion.aside
          animate={{ width: collapsed ? 0 : 256 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed md:relative inset-y-0 left-0 z-50 md:z-auto flex-shrink-0 overflow-hidden border-r border-slate-800 bg-slate-900 h-full shadow-2xl md:shadow-none"
        >
          <div className="w-64 h-full overflow-hidden flex flex-col">
            {/* Logo area */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-400 via-amber-400 to-rose-400 flex-shrink-0" />
                <span className="font-mono font-semibold text-sm text-slate-100 truncate">
                  Backend Revision
                </span>
              </div>
              <button
                onClick={onToggle}
                className="md:hidden text-slate-400 hover:text-slate-100 p-1 text-sm font-mono cursor-pointer"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

          {/* Controls: search input + filter tabs */}
          <div className="p-2.5 border-b border-slate-800/80 space-y-2 flex-shrink-0 bg-slate-900/60">
            {/* Sidebar search input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter list..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-md px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none transition-colors"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-mono"
                  aria-label="Clear filter"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-mono pointer-events-none">
                  /
                </span>
              )}
            </div>

            {/* Filter tabs: All | Not started | In progress | Done */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => setFilter('all')}
                className={`py-1 rounded text-center truncate transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="All concepts"
              >
                All
              </button>
              <button
                onClick={() => setFilter('not_started')}
                className={`py-1 rounded text-center truncate transition-colors ${
                  filter === 'not_started'
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Not started"
              >
                New
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`py-1 rounded text-center truncate transition-colors ${
                  filter === 'in_progress'
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="In progress"
              >
                Active
              </button>
              <button
                onClick={() => setFilter('done')}
                className={`py-1 rounded text-center truncate transition-colors ${
                  filter === 'done'
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Done"
              >
                Done
              </button>
            </div>
          </div>

          {/* Concept tree */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
            {filteredLevels.map(({ level, label, color, dot, filteredConcepts, stats }) => (
              <div key={level}>
                {/* Level header with X/Y done */}
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                    <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider truncate ${color}`}>
                      L{level} — {label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                    {stats.done}/{stats.total} done
                  </span>
                </div>

                {/* Concept list */}
                {filteredConcepts.length > 0 ? (
                  <div className="space-y-0.5">
                    {filteredConcepts.map(c => (
                      <ConceptLink
                        key={c.id}
                        concept={c}
                        isActive={c.id === currentId}
                        status={getStatus(c.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="px-2 py-1 text-[11px] font-mono text-slate-600 italic">
                    No matching concepts
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom Navigation Links */}
          <div className="p-2 border-t border-slate-800 bg-slate-900/90 flex-shrink-0 space-y-1">
            <button
              onClick={() => navigate('/flashcards')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all group ${
                location.pathname === '/flashcards'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-amber-400 flex-shrink-0">🗂️</span>
                <span className="truncate">Flashcards</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 flex-shrink-0">
                →
              </span>
            </button>

            <button
              onClick={() => navigate('/graph')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all group ${
                location.pathname === '/graph'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-indigo-400 flex-shrink-0">🌐</span>
                <span className="truncate">Terminology Graph</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 flex-shrink-0">
                →
              </span>
            </button>

            <button
              onClick={() => navigate('/interview')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all group ${
                location.pathname === '/interview'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400 flex-shrink-0">🎯</span>
                <span className="truncate">Interview Practice</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 flex-shrink-0">
                →
              </span>
            </button>
          </div>
        </div>

        {/* Collapse toggle button on the edge (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute top-4 -right-3 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all z-10 text-xs cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </motion.aside>
    </AnimatePresence>
    </>
  )
}
