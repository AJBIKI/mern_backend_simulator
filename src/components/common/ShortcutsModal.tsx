import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, Keyboard, Sparkles } from 'lucide-react'

const DISMISSED_KEY = 'backend-revision-shortcuts-dismissed'

interface ShortcutRowProps {
  keys: string[]
  description: string
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-slate-300 font-sans">{description}</span>
      <div className="flex items-center gap-1 font-mono">
        {keys.map((k, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold shadow-sm">
              {k}
            </kbd>
            {idx < keys.length - 1 && <span className="text-slate-500 text-[10px]">then</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  // Keyboard '?' shortcut to toggle modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const toggleDismiss = () => {
    const next = !isDismissed
    setIsDismissed(next)
    try {
      localStorage.setItem(DISMISSED_KEY, String(next))
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Floating '?' trigger button bottom-right */}
      {!isDismissed && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white shadow-xl backdrop-blur flex items-center justify-center font-mono text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Keyboard shortcuts (?)"
          aria-label="Open keyboard shortcuts cheat-sheet"
        >
          ?
        </button>
      )}

      {/* Cheat-sheet Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.16 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 font-mono">
                    Keyboard Shortcuts
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcuts Groups */}
              <div className="space-y-4">
                {/* Global shortcuts */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold mb-2">
                    Global (Any Page)
                  </h4>
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1">
                    <ShortcutRow keys={['⌘K', 'Ctrl+K']} description="Open search palette" />
                    <ShortcutRow keys={['G', 'H']} description="Go to Home" />
                    <ShortcutRow keys={['G', 'I']} description="Go to Interview Practice" />
                    <ShortcutRow keys={['G', 'F']} description="Go to Flashcards" />
                    <ShortcutRow keys={['G', 'G']} description="Go to Terminology Graph" />
                    <ShortcutRow keys={['?']} description="Toggle shortcuts help" />
                  </div>
                </div>

                {/* Concept page shortcuts */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/90 font-semibold mb-2">
                    On Concept Page
                  </h4>
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1">
                    <ShortcutRow keys={['←', '→']} description="Step visualizer backward / forward" />
                    <ShortcutRow keys={['Space']} description="Play / pause visualizer" />
                    <ShortcutRow keys={['N']} description="Next concept in curriculum" />
                    <ShortcutRow keys={['P']} description="Previous concept in curriculum" />
                    <ShortcutRow keys={['I']} description="Toggle Interview Mode" />
                    <ShortcutRow keys={['S']} description="Toggle Simple explanation mode" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={toggleDismiss}
                  className="hover:text-slate-300 transition flex items-center gap-1.5 font-mono text-[11px]"
                >
                  <span>{isDismissed ? '☑ Floating ? hidden' : '☐ Hide floating ? button'}</span>
                </button>
                <span className="font-mono text-[11px]">Press ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
