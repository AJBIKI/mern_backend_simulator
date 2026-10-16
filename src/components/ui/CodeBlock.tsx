import { useEffect, useState, useRef } from 'react'
import { codeToHtml } from 'shiki'
import { motion } from 'framer-motion'

interface CodeBlockProps {
  code: string
  lang: 'js' | 'ts' | 'bash' | 'json'
  highlights?: Record<number, string> // line number (1-indexed) → color name
}

const highlightColors: Record<string, string> = {
  emerald: 'rgba(52, 211, 153, 0.08)',
  amber: 'rgba(251, 191, 36, 0.08)',
  rose: 'rgba(251, 113, 133, 0.08)',
}

const highlightBorder: Record<string, string> = {
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
}

export function CodeBlock({ code, lang, highlights = {} }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    codeToHtml(code, {
      lang,
      theme: 'vitesse-dark',
    }).then(result => {
      if (!cancelled) {
        setHtml(result)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [code, lang])

  // After html is set, inject highlight styles on each line
  useEffect(() => {
    if (!containerRef.current || !html) return
    const pre = containerRef.current.querySelector('pre')
    if (!pre) return

    // Shiki wraps each line in a <span class="line">
    const lines = pre.querySelectorAll('.line')
    lines.forEach((line, i) => {
      const lineNum = i + 1
      const el = line as HTMLElement
      // reset
      el.style.backgroundColor = ''
      el.style.borderLeft = ''
      el.style.paddingLeft = ''
      el.style.marginLeft = ''

      if (highlights[lineNum]) {
        const color = highlights[lineNum]
        el.style.backgroundColor = highlightColors[color] ?? 'rgba(255,255,255,0.04)'
        el.style.borderLeft = `2px solid ${highlightBorder[color] ?? '#64748b'}`
        el.style.paddingLeft = '10px'
        el.style.display = 'block'
      }
    })
  }, [html, highlights])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900"
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <div className="w-3 h-3 rounded-full bg-slate-600" />
        </div>
        <span className="font-mono text-xs text-slate-500 ml-2">{lang}</span>
      </div>

      {loading ? (
        <div className="p-5 font-mono text-sm text-slate-500 animate-pulse">
          Loading…
        </div>
      ) : (
        <div
          ref={containerRef}
          className="shiki-wrapper overflow-x-auto text-sm leading-6 [&>pre]:p-5 [&>pre]:m-0 [&>pre]:bg-transparent! [&>pre]:font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </motion.div>
  )
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
