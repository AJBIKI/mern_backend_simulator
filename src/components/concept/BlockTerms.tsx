import { motion } from 'framer-motion'
import { TermChip } from '@/components/ui/TermChip'

interface BlockTermsProps {
  termIds: string[]
}

export function BlockTerms({ termIds }: BlockTermsProps) {
  if (termIds.length === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-2"
    >
      <h3 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
        Terminology
      </h3>
      <div className="flex flex-wrap gap-2">
        {termIds.map(id => (
          <TermChip key={id} termId={id} />
        ))}
      </div>
    </motion.div>
  )
}
