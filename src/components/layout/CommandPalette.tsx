import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse, { type FuseResult } from 'fuse.js'
import { allConcepts, type Concept } from '@/content'
import { glossaryMap } from '@/content/glossary'

const RECENT_SEARCHES_KEY = 'backend-revision-recent-searches'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchItem {
  id: string
  level: 1 | 2 | 3
  title: string
  oneLiner: string
  termNames: string[]
  pitfalls: string[]
  concept: Concept
}

// Prepare Fuse documents once
const searchItems: SearchItem[] = allConcepts.map(c => ({
  id: c.id,
  level: c.level,
  title: c.title,
  oneLiner: c.oneLiner,
  termNames: (c.terms || []).map(t => glossaryMap[t]?.term || t),
  pitfalls: c.pitfalls || [],
  concept: c,
}))

const fuse = new Fuse(searchItems, {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'termNames', weight: 0.25 },
    { name: 'oneLiner', weight: 0.2 },
    { name: 'pitfalls', weight: 0.15 },
  ],
  threshold: 0.4,
  includeMatches: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
})

function extractSnippet(result: FuseResult<SearchItem>): string {
  if (result.matches && result.matches.length > 0) {
    // Check if match came from a pitfall
    const pitfallMatch = result.matches.find(m => m.key === 'pitfalls')
    if (pitfallMatch && pitfallMatch.value) {
      return `Pitfall: ${pitfallMatch.value}`
    }
    // Check if match came from a glossary term
    const termMatch = result.matches.find(m => m.key === 'termNames')
    if (termMatch && termMatch.value) {
      return `Term: ${termMatch.value}`
    }
    // Check if match came from oneLiner
    const oneLinerMatch = result.matches.find(m => m.key === 'oneLiner')
    if (oneLinerMatch && oneLinerMatch.value) {
      return oneLinerMatch.value
    }
  }
  return result.item.oneLiner
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Load recent searches on mount or when opened
  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, 5))
          }
        }
      } catch {
        // ignore
      }
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Save recent search helper
  const recordRecentSearch = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5)
    setRecentSearches(updated)
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  // Clear single or all recent searches
  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch {
      // ignore
    }
  }

  // Filter or search concepts
  const results: { concept: Concept; snippet: string }[] = useMemo(() => {
    const q = query.trim()
    if (!q) {
      // When empty, show first 8 concepts as quick recommendations
      return searchItems.slice(0, 8).map(item => ({
        concept: item.concept,
        snippet: item.oneLiner,
      }))
    }
    const fuseMatches = fuse.search(q)
    return fuseMatches.map(res => ({
      concept: res.item.concept,
      snippet: extractSnippet(res),
    }))
  }, [query])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Navigate to concept
  const handleSelect = (concept: Concept) => {
    if (query.trim()) {
      recordRecentSearch(query.trim())
    }
    onClose()
    navigate(`/concept/${concept.id}`)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].concept)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
              <svg
                className="w-5 h-5 text-slate-400 flex-shrink-0"
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
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search concepts, one-liners, terms, or pitfalls..."
                className="w-full bg-transparent border-0 text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-slate-500 hover:text-slate-300 text-xs font-mono px-1"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                ESC
              </kbd>
            </div>

            {/* Recent Searches Row (if query is empty and recent searches exist) */}
            {!query && recentSearches.length > 0 && (
              <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-950/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                  <span className="text-slate-500 font-mono text-[11px] flex-shrink-0">Recent:</span>
                  {recentSearches.map(item => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors flex-shrink-0"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] font-mono text-slate-500 hover:text-slate-300 ml-2 flex-shrink-0"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {results.length > 0 ? (
                results.map(({ concept, snippet }, idx) => {
                  const isSelected = idx === selectedIndex
                  const levelColors = {
                    1: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
                    2: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
                    3: 'bg-rose-400/10 text-rose-400 border-rose-400/30',
                  }
                  return (
                    <button
                      key={concept.id}
                      ref={el => {
                        itemRefs.current[idx] = el
                      }}
                      onClick={() => handleSelect(concept)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-100 flex items-start gap-3 group ${
                        isSelected
                          ? 'bg-slate-800/90 border border-slate-700 text-slate-100'
                          : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                      }`}
                    >
                      {/* Level Badge */}
                      <span
                        className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${levelColors[concept.level]}`}
                      >
                        L{concept.level}
                      </span>

                      {/* Title + Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-semibold text-sm truncate ${
                              isSelected ? 'text-slate-100' : 'text-slate-200'
                            }`}
                          >
                            {concept.title}
                          </span>
                          {isSelected && (
                            <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1 flex-shrink-0">
                              <span>Go</span>
                              <span className="text-xs">↵</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-sans">
                          {snippet}
                        </p>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No concepts found matching &ldquo;<span className="text-slate-300">{query}</span>&rdquo;
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">↵</kbd> select
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">esc</kbd> close
                </span>
              </div>
              <span className="text-slate-600">
                {results.length} {results.length === 1 ? 'concept' : 'concepts'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
