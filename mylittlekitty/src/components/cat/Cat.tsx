import { motion } from 'framer-motion'
import type { CatMood } from '../../game/types'

const FUR = '#f6b26b'
const FUR_DARK = '#e08e3c'
const LIGHT = '#ffe6c7'
const INK = '#4a2f27'
const PINK = '#f48fa8'

interface CatProps {
  mood: CatMood
  hat?: string
  collar?: string
  dirty?: boolean
}

const still = { transformBox: 'fill-box', transformOrigin: 'center' } as const

function Eye({ mood, x }: { mood: CatMood; x: number }) {
  const side = x < 100 ? -1 : 1
  const g = (children: React.ReactNode) => <g transform={`translate(${x} 90)`}>{children}</g>
  switch (mood) {
    case 'happy':
    case 'eating':
      return g(<path d="M-8 3 Q0 -9 8 3" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />)
    case 'sleeping':
      return g(<path d="M-8 -1 Q0 8 8 -1" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />)
    case 'sleepy':
      return g(
        <>
          <circle r="7.5" fill={INK} />
          <circle cx="-2.5" cy="-1" r="2" fill="#fff" />
          <path d="M-10 -9 H10 V-1 H-10Z" fill={FUR} />
          <path d="M-8 -1 H8" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </>,
      )
    case 'sad':
      return g(
        <>
          <circle r="7.5" fill={INK} />
          <circle cx="-2" cy="-2" r="3.2" fill="#fff" />
          <circle cx="2.5" cy="2.5" r="1.4" fill="#fff" />
          <path d={`M${-9 * side} -13 L${7 * side} -9`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          {side === 1 && (
            <motion.path
              d="M-1 10 q4 6 0 9 q-4 -3 0 -9z"
              fill="#8fd3ff"
              animate={{ y: [0, 10], opacity: [1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          )}
        </>,
      )
    case 'playing':
      return g(
        <>
          <circle r="9" fill={INK} />
          <circle cx="-3" cy="-3" r="3.5" fill="#fff" />
          <circle cx="3" cy="3" r="1.6" fill="#fff" />
        </>,
      )
    default:
      return g(
        <motion.g
          style={still}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.9, 0.94, 0.98, 1] }}
        >
          <circle r="7.5" fill={INK} />
          <circle cx="-2.5" cy="-2.5" r="2.8" fill="#fff" />
          <circle cx="2" cy="2" r="1.2" fill="#fff" />
        </motion.g>,
      )
  }
}

function Mouth({ mood }: { mood: CatMood }) {
  switch (mood) {
    case 'happy':
    case 'playing':
      return <path d="M91 105 Q100 121 109 105Z" fill="#c4566e" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    case 'sad':
      return <path d="M92 113 Q100 104 108 113" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    case 'hungry':
      return <ellipse cx="100" cy="110" rx="5" ry="6" fill="#c4566e" stroke={INK} strokeWidth="2.5" />
    case 'eating':
      return (
        <motion.ellipse
          cx="100"
          cy="109"
          rx="6"
          fill="#c4566e"
          stroke={INK}
          strokeWidth="2.5"
          animate={{ ry: [2, 6, 2] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
      )
    case 'sleepy':
      return <ellipse cx="100" cy="110" rx="4" ry="5" fill="#c4566e" stroke={INK} strokeWidth="2.5" />
    default:
      return <path d="M100 104 Q96 112 89 108 M100 104 Q104 112 111 108" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  }
}

function Hat({ id }: { id: string }) {
  switch (id) {
    case 'hat_party':
      return (
        <g transform="rotate(-10 100 50)">
          <path d="M84 56 L100 8 L116 56Z" fill="#8fb8f4" stroke="#6a95d8" strokeWidth="2" strokeLinejoin="round" />
          <path d="M90 40 L110 40 M87 49 L113 49" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="8" r="6" fill={PINK} />
        </g>
      )
    case 'hat_bow':
      return (
        <g transform="translate(130 50) rotate(15)">
          <path d="M0 0 L-20 -11 L-20 11Z M0 0 L20 -11 L20 11Z" fill={PINK} stroke="#d9647f" strokeWidth="2" strokeLinejoin="round" />
          <circle r="6" fill="#e0607f" />
        </g>
      )
    case 'hat_crown':
      return (
        <g>
          <path d="M76 54 L80 26 L91 40 L100 20 L109 40 L120 26 L124 54Z" fill="#f6c946" stroke="#d6a21f" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="100" cy="46" r="3.5" fill="#e0607f" />
          <circle cx="86" cy="48" r="2.5" fill="#8fb8f4" />
          <circle cx="114" cy="48" r="2.5" fill="#7ecbb4" />
        </g>
      )
    case 'hat_flower':
      return (
        <g>
          <path d="M70 52 Q100 36 130 52" fill="none" stroke="#6fbf73" strokeWidth="5" strokeLinecap="round" />
          {[78, 92, 108, 122].map((x, i) => (
            <circle key={x} cx={x} cy={i % 3 === 1 ? 42 : 47} r="6" fill={['#f48fa8', '#fff', '#ffd166', '#c3a6ff'][i]} stroke="#e6a0b4" strokeWidth="1" />
          ))}
        </g>
      )
    case 'hat_wizard':
      return (
        <g transform="rotate(-6 100 50)">
          <path d="M76 56 L102 6 L126 56Z" fill="#7c6ad8" stroke="#5a49b3" strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="100" cy="56" rx="34" ry="7" fill="#6a58c8" stroke="#5a49b3" strokeWidth="2" />
          <circle cx="102" cy="30" r="4" fill="#ffe27a" />
          <circle cx="92" cy="44" r="2.5" fill="#ffe27a" />
        </g>
      )
    default:
      return null
  }
}

function Collar({ id }: { id: string }) {
  switch (id) {
    case 'col_red':
      return <path d="M66 126 Q100 150 134 126" fill="none" stroke="#e05a6d" strokeWidth="8" strokeLinecap="round" />
    case 'col_bell':
      return (
        <g>
          <path d="M66 126 Q100 150 134 126" fill="none" stroke="#7ecbb4" strokeWidth="8" strokeLinecap="round" />
          <circle cx="100" cy="143" r="7" fill="#f6c946" stroke="#d6a21f" strokeWidth="2" />
          <path d="M96 145 H104" stroke="#d6a21f" strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'col_scarf':
      return (
        <g>
          <path d="M62 124 Q100 152 138 124" fill="none" stroke="#5bb8b0" strokeWidth="15" strokeLinecap="round" />
          <path d="M66 128 Q100 156 134 128" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="5 6" opacity=".6" />
          <rect x="112" y="136" width="14" height="30" rx="6" fill="#5bb8b0" transform="rotate(-8 119 136)" />
        </g>
      )
    case 'col_bowtie':
      return (
        <g transform="translate(100 138)">
          <path d="M0 0 L-18 -10 L-18 10Z M0 0 L18 -10 L18 10Z" fill="#4a6fd8" stroke="#34509e" strokeWidth="2" strokeLinejoin="round" />
          <circle r="5" fill="#34509e" />
        </g>
      )
    case 'col_medal':
      return (
        <g>
          <path d="M66 126 Q100 150 134 126" fill="none" stroke="#e05a6d" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="150" r="10" fill="#f6c946" stroke="#d6a21f" strokeWidth="2.5" />
          <path d="M100 144 l2.5 5 5.5 .8 -4 3.8 1 5.4 -5 -2.7 -5 2.7 1 -5.4 -4 -3.8 5.5 -.8Z" fill="#fff4b8" />
        </g>
      )
    default:
      return null
  }
}

export function Cat({ mood, hat, collar, dirty }: CatProps) {
  const headAnim = {
    idle: { y: [0, -1.5, 0], rotate: [0, 0, 0] },
    happy: { y: [0, -4, 0], rotate: [-2, 2, -2] },
    hungry: { y: [0, 1, 0], rotate: [-3, 0, -3] },
    sleepy: { y: [2, 5, 2], rotate: [3, 5, 3] },
    playing: { y: [0, -6, 0], rotate: [-6, 6, -6] },
    eating: { y: [0, 8, 0], rotate: [0, 3, 0] },
    sleeping: { y: [10, 12, 10], rotate: [9, 10, 9] },
    sad: { y: [4, 5, 4], rotate: [-4, -4, -4] },
  }[mood]
  const fast = mood === 'playing' || mood === 'eating'
  const tailSwing = mood === 'happy' || mood === 'playing' ? 18 : mood === 'sad' || mood === 'sleeping' ? 2 : 7

  return (
    <g>
      <motion.path
        d="M142 172 C186 176 192 124 166 108"
        fill="none"
        stroke={FUR}
        strokeWidth="15"
        strokeLinecap="round"
        style={{ transformOrigin: '142px 172px' }}
        animate={{ rotate: [-tailSwing, tailSwing, -tailSwing] }}
        transition={{ duration: mood === 'happy' || mood === 'playing' ? 0.9 : 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.g
        style={{ transformOrigin: '100px 195px' }}
        animate={{ scaleY: mood === 'sleeping' ? [1, 1.035, 1] : [1, 1.015, 1] }}
        transition={{ duration: mood === 'sleeping' ? 3.2 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="62" cy="182" rx="20" ry="14" fill={FUR} />
        <ellipse cx="138" cy="182" rx="20" ry="14" fill={FUR} />
        <ellipse cx="100" cy="150" rx="46" ry="44" fill={FUR} />
        <ellipse cx="100" cy="162" rx="27" ry="28" fill={LIGHT} />
        <path d="M58 140 q8 2 12 8 M56 156 q8 0 12 5 M142 140 q-8 2 -12 8 M144 156 q-8 0 -12 5" stroke={FUR_DARK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <ellipse cx="84" cy="192" rx="12" ry="8.5" fill={LIGHT} stroke={FUR} strokeWidth="2" />
        <ellipse cx="116" cy="192" rx="12" ry="8.5" fill={LIGHT} stroke={FUR} strokeWidth="2" />
        {dirty && (
          <g fill="#8a6a50" opacity=".35">
            <circle cx="72" cy="158" r="4" />
            <circle cx="126" cy="146" r="5" />
            <circle cx="110" cy="176" r="3.5" />
          </g>
        )}
      </motion.g>

      {collar && <Collar id={collar} />}

      <motion.g
        style={{ transformOrigin: '100px 128px' }}
        animate={headAnim}
        transition={{ duration: fast ? 0.5 : mood === 'sleeping' ? 3.2 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M58 70 L60 20 L96 50Z" fill={FUR} stroke={FUR} strokeWidth="6" strokeLinejoin="round" />
        <path d="M142 70 L140 20 L104 50Z" fill={FUR} stroke={FUR} strokeWidth="6" strokeLinejoin="round" />
        <path d="M65 56 L66 31 L84 49Z" fill={PINK} opacity=".75" />
        <path d="M135 56 L134 31 L116 49Z" fill={PINK} opacity=".75" />
        <ellipse cx="100" cy="90" rx="50" ry="43" fill={FUR} />
        <path d="M100 48 V62 M86 51 L89 63 M114 51 L111 63" stroke={FUR_DARK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M52 86 h10 M53 98 h9 M148 86 h-10 M147 98 h-9" stroke={FUR_DARK} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="100" cy="106" rx="23" ry="15" fill={LIGHT} />
        <ellipse cx="68" cy="105" rx="9" ry="6" fill={PINK} opacity=".45" />
        <ellipse cx="132" cy="105" rx="9" ry="6" fill={PINK} opacity=".45" />
        <Eye mood={mood} x={78} />
        <Eye mood={mood} x={122} />
        <path d="M94 98 H106 L100 105Z" fill={PINK} stroke="#d9647f" strokeWidth="1.5" strokeLinejoin="round" />
        <Mouth mood={mood} />
        <path d="M66 100 L44 96 M66 106 L44 108 M134 100 L156 96 M134 106 L156 108" stroke={INK} strokeWidth="1.8" strokeLinecap="round" opacity=".5" />
        {dirty && (
          <g fill="#8a6a50" opacity=".35">
            <circle cx="62" cy="72" r="4" />
            <circle cx="140" cy="76" r="3" />
          </g>
        )}
        {hat && <Hat id={hat} />}
      </motion.g>

      {dirty && (
        <g stroke="#9bb06a" strokeWidth="3" fill="none" strokeLinecap="round">
          {[30, 170].map((x, i) => (
            <motion.path
              key={x}
              d={`M${x} 150 q6 -8 0 -16 q-6 -8 0 -16`}
              animate={{ y: [0, -8], opacity: [0.9, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
        </g>
      )}
    </g>
  )
}
