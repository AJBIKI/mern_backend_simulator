import { motion } from 'framer-motion'
import { CodeBlock } from '@/components/ui/CodeBlock'
import type { Snippet } from '@/content/types'

interface BlockCodeProps {
  snippet: Snippet
}

export function BlockCode({ snippet }: BlockCodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-2"
    >
      <h3 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
        Code Snippet
      </h3>
      <CodeBlock
        code={snippet.code}
        lang={snippet.lang}
        highlights={snippet.highlights}
      />
    </motion.div>
  )
}
