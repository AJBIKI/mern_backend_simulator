import { motion } from 'framer-motion'

interface BlockPitfallsProps {
  pitfalls: string[]
  interview: string[]
}

export function BlockPitfalls({ pitfalls, interview }: BlockPitfallsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid md:grid-cols-2 gap-4"
    >
      {/* Pitfalls */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-semibold text-rose-400/80 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚠</span> Common Pitfalls
        </h3>
        <div className="space-y-2">
          {pitfalls.map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-400/5 border border-rose-400/10"
            >
              <span className="text-rose-400 flex-shrink-0 mt-0.5 text-sm">✗</span>
              <p className="text-sm text-slate-400 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interview Qs */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-semibold text-amber-400/80 uppercase tracking-wider flex items-center gap-1.5">
          <span>❓</span> Interview Questions
        </h3>
        <div className="space-y-2">
          {interview.map((q, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-400/5 border border-amber-400/10"
            >
              <span className="text-amber-400 flex-shrink-0 mt-0.5 text-sm font-mono font-bold">Q{i + 1}</span>
              <p className="text-sm text-slate-300 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
