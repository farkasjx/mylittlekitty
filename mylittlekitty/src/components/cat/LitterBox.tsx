import { motion } from 'framer-motion'
import { LITTER } from '../../game/config'

const LUMPS = [[22, 12], [40, 18], [58, 10], [74, 17], [32, 24], [64, 25]]

export function LitterBox({ litter, onClick }: { litter: number; onClick?: () => void }) {
  const lumps = Math.round((litter / 100) * LUMPS.length)
  const messy = litter >= LITTER.messyThreshold
  return (
    <g transform="translate(290 276)" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <rect x="-6" y="-12" width="112" height="70" fill="transparent" />
      <path d="M0 22 H96 L88 56 H8Z" fill="#8fb8f4" stroke="#6a95d8" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="48" cy="22" rx="48" ry="11" fill="#6a95d8" />
      <ellipse cx="48" cy="22" rx="42" ry="8" fill="#f1e2c4" />
      {LUMPS.slice(0, lumps).map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x + 4} cy={y + 8} rx="6" ry="4" fill="#9c7a54" />
      ))}
      {messy && (
        <motion.text x="70" y="8" fontSize="14" animate={{ y: [8, 0, 8], opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
          〰️
        </motion.text>
      )}
    </g>
  )
}
