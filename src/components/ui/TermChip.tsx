import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { glossaryMap } from '@/content/glossary'

interface TermChipProps {
  termId: string
}

export function TermChip({ termId }: TermChipProps) {
  const term = glossaryMap[termId]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!term) {
    return (
      <span className="font-mono text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
        {termId}
      </span>
    )
  }

  return (
    <span ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="font-mono text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-slate-100 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded cursor-pointer transition-all duration-150 select-none"
      >
        {term.term}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3"
          >
            <p className="text-xs font-mono font-semibold text-slate-200 mb-1">{term.term}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{term.definition}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
