import { AnimatePresence, motion } from 'framer-motion'
import type { Activity, CatMood } from '../../game/types'

const heart = 'M0 4 C-8 -4 -4 -12 0 -6 C4 -12 8 -4 0 4Z'

/** Transient particles that sell the cat's current action. All drawn in room coordinates. */
export function Effects({ activity, mood }: { activity: Activity | null; mood: CatMood }) {
  return (
    <AnimatePresence>
      {activity === 'petted' &&
        [0, 1, 2, 3, 4].map((i) => (
          <motion.path
            key={`h${i}`}
            d={heart}
            fill="#ff6f91"
            transform={`translate(${170 + i * 18} 140) scale(1.5)`}
            initial={{ y: 0, opacity: 0, scale: 0.4 }}
            animate={{ y: -70 - (i % 3) * 14, opacity: [0, 1, 0], scale: 1.2 }}
            transition={{ duration: 1.5, delay: i * 0.18 }}
          />
        ))}
      {activity === 'sleeping' &&
        [0, 1, 2].map((i) => (
          <motion.text
            key={`z${i}`}
            x={190 + i * 22}
            y={150 - i * 10}
            fontSize={20 + i * 6}
            fontWeight="800"
            fill="#7a86d6"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -34 }}
            transition={{ duration: 2.2, delay: i * 0.6, repeat: Infinity }}
          >
            Z
          </motion.text>
        ))}
      {activity === 'eating' && (
        <motion.g key="bowl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
          <ellipse cx="200" cy="334" rx="46" ry="12" fill="#8fb8f4" />
          <path d="M156 326 h88 q-4 24 -44 24 q-40 0 -44 -24Z" fill="#a9c9fa" />
          <ellipse cx="200" cy="326" rx="40" ry="8" fill="#7a5a48" />
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={180 + i * 20}
              cy={322}
              r="3.5"
              fill="#f6c46b"
              animate={{ y: [-14, -2], x: [0, (i - 1) * 8], opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.g>
      )}
      {activity === 'playing' && (
        <motion.g key="yarn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.g
            animate={{ x: [0, -50, 0], y: [0, -26, 0, -14, 0], rotate: [0, -360, -720] }}
            transition={{ duration: 1.3, repeat: Infinity }}
            style={{ transformOrigin: '312px 322px' }}
          >
            <circle cx="312" cy="322" r="17" fill="#f48fa8" />
            <path d="M298 316 q14 -10 28 4 M296 326 q16 -8 30 6 M304 336 q12 -6 20 -6" fill="none" stroke="#d9647f" strokeWidth="2.5" />
          </motion.g>
          {[0, 1, 2].map((i) => (
            <motion.path
              key={i}
              d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2Z"
              fill="#ffd166"
              transform={`translate(${130 + i * 70} ${150 + (i % 2) * 30})`}
              animate={{ scale: [0, 1.2, 0], rotate: 90 }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.g>
      )}
      {activity === 'grooming' &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <motion.circle
            key={`b${i}`}
            cx={150 + i * 20}
            cy={280 - (i % 2) * 20}
            r={5 + (i % 3) * 2}
            fill="#e8f6ff"
            stroke="#a9d6f5"
            strokeWidth="2"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -80 }}
            transition={{ duration: 1.6, delay: i * 0.12 }}
          />
        ))}
      {!activity && mood === 'hungry' && (
        <motion.g key="thought" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ transformOrigin: '300px 160px' }}>
          <circle cx="262" cy="196" r="4" fill="#fff" />
          <circle cx="276" cy="182" r="6" fill="#fff" />
          <ellipse cx="310" cy="150" rx="36" ry="28" fill="#fff" stroke="#f3d9c4" strokeWidth="2" />
          <ellipse cx="310" cy="152" rx="14" ry="9" fill="#ff9a62" />
          <path d="M296 152 l-10 -7 v14Z" fill="#ff9a62" />
          <circle cx="318" cy="149" r="2" fill="#4a2f27" />
        </motion.g>
      )}
      {!activity && mood === 'sleepy' && (
        <motion.text key="sleepyz" x="268" y="130" fontSize="22" fontWeight="800" fill="#7a86d6" animate={{ opacity: [0.2, 1, 0.2], y: [130, 118, 130] }} transition={{ duration: 2.4, repeat: Infinity }}>
          z
        </motion.text>
      )}
    </AnimatePresence>
  )
}
