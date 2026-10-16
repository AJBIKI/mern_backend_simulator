import { motion } from 'framer-motion'

interface BlockOneLinerProps {
  text: string
}

export function BlockOneLiner({ text }: BlockOneLinerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <h1 className="text-2xl md:text-3xl font-bold text-slate-100 leading-tight tracking-tight">
        {text}
      </h1>
    </motion.div>
  )
}
