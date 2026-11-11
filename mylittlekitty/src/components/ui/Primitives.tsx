import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white/80 p-4 shadow-soft backdrop-blur ${className}`}>{children}</div>
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-1 pb-3 pt-1">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-cocoa-soft">{subtitle}</p>}
    </div>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'soft' | 'ghost'
  className?: string
  label?: string
}

export function Button({ children, onClick, disabled, variant = 'primary', className = '', label }: ButtonProps) {
  const styles = {
    primary: 'bg-rose text-white shadow-pop hover:bg-rose-deep',
    soft: 'bg-peach text-cocoa shadow-pop hover:bg-peach-deep',
    ghost: 'bg-transparent text-cocoa-soft hover:bg-peach',
  }[variant]
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.94 }}
      whileHover={disabled ? undefined : { y: -1 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-45 ${styles} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export function Meter({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.round((Math.min(max, Math.max(0, value)) / max) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3 w-full overflow-hidden rounded-full bg-black/10"
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}

export const CoinIcon = () => (
  <span aria-hidden className="inline-block h-4 w-4 rounded-full border-2 border-[#d6a21f] bg-butter align-[-2px]" />
)
