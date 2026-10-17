import { useNavigate, useLocation } from 'react-router-dom'
import { ProgressRing } from './ProgressRing'
import { useProgress } from '@/hooks/useProgress'
import { useViewMode } from '@/hooks/useViewMode'
import { conceptMap } from '@/content'

interface TopBarProps {
  onToggleSidebar: () => void
  onOpenSearch: () => void
}

export function TopBar({ onToggleSidebar, onOpenSearch }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { totalProgress, levelProgress } = useProgress()
  const { mode, setMode, isInterviewMode } = useViewMode()

  // Breadcrumb
  const isConceptPage = location.pathname.startsWith('/concept/')
  const conceptId = isConceptPage ? location.pathname.replace('/concept/', '') : null
  const concept = conceptId ? conceptMap[conceptId] : null
  const isInterviewPage = location.pathname === '/interview'

  return (
    <header className="flex-shrink-0 h-12 flex items-center gap-2.5 px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-20">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-sm"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <button
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-slate-300 transition-colors font-mono text-xs"
        >
          Backend Revision
        </button>
        {isInterviewPage && (
          <>
            <span className="text-slate-700">/</span>
            <span className="text-amber-400 font-mono text-xs">Interview Practice</span>
          </>
        )}
        {concept && (
          <>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 font-mono text-xs truncate">
              {`L${concept.level}`}
            </span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-200 text-xs truncate">{concept.title}</span>
          </>
        )}
      </nav>

      {/* Reading ↔ Interview Mode Toggle */}
      <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono flex-shrink-0">
        <button
          onClick={() => setMode('reading')}
          className={`px-2 py-1 rounded transition-colors ${
            mode === 'reading'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Reading Mode (Full concept explanation + code)"
        >
          📖 <span className="hidden sm:inline">Reading</span>
        </button>
        <button
          onClick={() => setMode('interview')}
          className={`px-2 py-1 rounded transition-colors ${
            mode === 'interview'
              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Interview Mode (Hide code, focus on interview questions)"
        >
          🎯 <span className="hidden sm:inline">Interview</span>
        </button>
      </div>

      {/* Practice Flashcards Link */}
      <button
        onClick={() => navigate('/interview')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex-shrink-0 ${
          isInterviewPage
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title="Open Random Interview Questions Flashcards"
      >
        <span>⚡</span>
        <span className="hidden md:inline">Practice</span>
      </button>

      {/* Search trigger button */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all text-xs font-mono group flex-shrink-0"
        aria-label="Open search palette (Cmd+K / Ctrl+K)"
      >
        <svg
          className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="hidden xl:inline text-slate-400 group-hover:text-slate-200">Search</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 group-hover:border-slate-700">
          ⌘K
        </kbd>
      </button>

      {/* Level progress rings */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {([1, 2, 3] as const).map(level => {
          const colors = { 1: '#34d399', 2: '#fbbf24', 3: '#fb7185' }
          const labels = { 1: 'B', 2: 'I', 3: 'A' }
          const prog = levelProgress(level)
          return (
            <div key={level} className="flex items-center gap-1" title={`Level ${level}: ${prog}%`}>
              <ProgressRing progress={prog} size={22} strokeWidth={2.5} color={colors[level]} />
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">{labels[level]}</span>
            </div>
          )
        })}

        {/* Overall */}
        <div className="flex items-center gap-1 ml-1" title={`Total Progress: ${totalProgress()}%`}>
          <ProgressRing progress={totalProgress()} size={26} strokeWidth={2.5} color="#818cf8" />
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">{totalProgress()}%</span>
        </div>
      </div>
    </header>
  )
}
