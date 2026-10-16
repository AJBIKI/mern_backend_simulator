import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { level1Concepts } from '@/content/level1'
import { level2Concepts } from '@/content/level2'
import { level3Concepts } from '@/content/level3'
import { useProgress } from '@/hooks/useProgress'
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

function ConceptLink({ concept, isActive, isComplete }: { concept: Concept; isActive: boolean; isComplete: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/concept/${concept.id}`)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-2.5 group ${
        isActive
          ? 'bg-slate-800 text-slate-100'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {/* Completion dot */}
      <span
        className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors ${
          isComplete ? 'bg-emerald-400' : 'bg-slate-700 group-hover:bg-slate-600'
        }`}
      />
      <span className="truncate">{concept.title}</span>
    </button>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { isComplete } = useProgress()
  const currentId = location.pathname.startsWith('/concept/')
    ? location.pathname.replace('/concept/', '')
    : null

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        animate={{ width: collapsed ? 0 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative flex-shrink-0 overflow-hidden border-r border-slate-800 bg-slate-900 h-full"
      >
        <div className="w-64 h-full overflow-y-auto flex flex-col">
          {/* Logo area */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-800">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-amber-400 flex-shrink-0" />
            <span className="font-mono font-semibold text-sm text-slate-100">Backend Revision</span>
          </div>

          {/* Concept tree */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
            {levels.map(({ level, label, color, dot, concepts }) => (
              <div key={level}>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                  <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${color}`}>
                    L{level} — {label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {concepts.map(c => (
                    <ConceptLink
                      key={c.id}
                      concept={c}
                      isActive={c.id === currentId}
                      isComplete={isComplete(c.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Collapse toggle button on the edge */}
        <button
          onClick={onToggle}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all z-10 text-xs"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </motion.aside>
    </AnimatePresence>
  )
}
