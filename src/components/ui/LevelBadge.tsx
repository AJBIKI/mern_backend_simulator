import { motion } from 'framer-motion'

interface LevelBadgeProps {
  level: 1 | 2 | 3
  className?: string
}

const levelConfig = {
  1: { label: 'Basic', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  2: { label: 'Intermediate', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  3: { label: 'Advanced', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
}

export function LevelBadge({ level, className = '' }: LevelBadgeProps) {
  const { label, color } = levelConfig[level]
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      Level {level} · {label}
    </motion.span>
  )
}

export function levelColor(level: 1 | 2 | 3): string {
  return { 1: 'emerald', 2: 'amber', 3: 'rose' }[level]
}

export function levelStroke(level: 1 | 2 | 3): string {
  return {
    1: '#34d399', // emerald-400
    2: '#fbbf24', // amber-400
    3: '#fb7185', // rose-400
  }[level]
}
