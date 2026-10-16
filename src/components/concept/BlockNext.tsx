import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { conceptMap } from '@/content'
import { LevelBadge } from '@/components/ui/LevelBadge'

interface BlockNextProps {
  nextIds: string[]
}

export function BlockNext({ nextIds }: BlockNextProps) {
  const navigate = useNavigate()
  const concepts = nextIds.map(id => conceptMap[id]).filter(Boolean)

  if (concepts.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="space-y-3"
    >
      <h3 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
        Up Next
      </h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {concepts.map(c => (
          <button
            key={c.id}
            onClick={() => navigate(`/concept/${c.id}`)}
            className="text-left p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all duration-200 group"
          >
            <LevelBadge level={c.level} className="mb-2" />
            <p className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors leading-tight">
              {c.title}
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
              {c.oneLiner}
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
