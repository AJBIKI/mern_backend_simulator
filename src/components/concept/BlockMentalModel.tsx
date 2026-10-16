import { motion } from 'framer-motion'

interface BlockMentalModelProps {
  text: string
}

export function BlockMentalModel({ text }: BlockMentalModelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800"
    >
      <span className="text-2xl flex-shrink-0 mt-0.5" role="img" aria-label="mental model">
        💡
      </span>
      <p className="text-slate-400 italic leading-relaxed text-base">{text}</p>
    </motion.div>
  )
}
