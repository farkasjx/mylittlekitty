/** Original SVG decor pieces for the room. Each is a drop-in replaceable illustration. */
import { motion } from 'framer-motion'
import { ROOM } from './roomDims'


export function Wallpaper({ id }: { id?: string }) {
  const h = ROOM.wallBottom
  switch (id) {
    case 'wp_pink':
      return (
        <g>
          <rect width={ROOM.width} height={h} fill="#ffd9e2" />
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 10 }).map((__, c) => (
              <circle key={`${r}-${c}`} cx={c * 44 + (r % 2) * 22 + 10} cy={r * 32 + 18} r="4" fill="#fff" opacity=".7" />
            )),
          )}
        </g>
      )
    case 'wp_mint':
      return (
        <g>
          <rect width={ROOM.width} height={h} fill="#d4f1e4" />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={i * 44 + 14} width="22" height={h} fill="#bfe8d6" />
          ))}
        </g>
      )
    case 'wp_night':
      return (
        <g>
          <rect width={ROOM.width} height={h} fill="#3e4079" />
          {[[40, 40], [120, 90], [210, 30], [300, 120], [350, 50], [70, 170], [180, 160], [260, 200], [380, 180]].map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 3.5 : 2.2}
              fill="#ffe9a8"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </g>
      )
    default:
      return (
        <g>
          <rect width={ROOM.width} height={h} fill="#fff0dc" />
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={i * 90 - 10} width="40" height={h} fill="#ffe6c8" opacity=".6" />
          ))}
        </g>
      )
  }
}

export function Floor({ id }: { id?: string }) {
  const y = ROOM.wallBottom
  const h = ROOM.height - y
  return (
    <g>
      {id === 'fl_checker' ? (
        <>
          <rect y={y} width={ROOM.width} height={h} fill="#f7f1e8" />
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 11 }).map((__, c) =>
              (r + c) % 2 === 0 ? (
                <rect key={`${r}-${c}`} x={c * 40 - 10} y={y + r * 31} width="40" height="31" fill="#cfe3dc" />
              ) : null,
            ),
          )}
        </>
      ) : (
        <>
          <rect y={y} width={ROOM.width} height={h} fill="#e8b98a" />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2={ROOM.width} y1={y + 18 + i * 28} y2={y + 18 + i * 28} stroke="#d4a171" strokeWidth="2" />
          ))}
        </>
      )}
      <rect y={y - 6} width={ROOM.width} height="10" fill="#fff" opacity=".55" />
      {id === 'fl_carpet' && (
        <g>
          <ellipse cx="200" cy="316" rx="170" ry="34" fill="#f4a9c0" />
          <ellipse cx="200" cy="316" rx="150" ry="27" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="8 8" opacity=".7" />
        </g>
      )}
    </g>
  )
}

export function Window({ id }: { id?: string }) {
  if (!id) {
    return (
      <g transform="translate(290 40)">
        <rect width="72" height="84" rx="8" fill="#fff" stroke="#e6c9a8" strokeWidth="5" />
        <rect x="9" y="9" width="54" height="66" rx="4" fill="#ffe6d5" />
        <g fill="#f6b26b">
          <ellipse cx="36" cy="50" rx="10" ry="8" />
          <circle cx="22" cy="38" r="4.5" />
          <circle cx="32" cy="30" r="4.5" />
          <circle cx="44" cy="30" r="4.5" />
          <circle cx="52" cy="38" r="4.5" />
        </g>
      </g>
    )
  }
  if (id === 'win_night') {
    return (
      <g transform="translate(270 28)">
        <rect width="104" height="112" rx="10" fill="#fff" stroke="#e6c9a8" strokeWidth="6" />
        <rect x="8" y="8" width="88" height="96" rx="5" fill="#2f3b7a" />
        <path d="M66 24 a16 16 0 1 0 14 24 a13 13 0 1 1 -14 -24Z" fill="#ffe27a" />
        {[[22, 24], [40, 50], [78, 70], [28, 82], [60, 90]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="#fff" />
        ))}
        <line x1="52" x2="52" y1="8" y2="104" stroke="#fff" strokeWidth="5" />
        <line x1="8" x2="96" y1="56" y2="56" stroke="#fff" strokeWidth="5" />
      </g>
    )
  }
  const garden = id === 'win_garden'
  return (
    <g transform="translate(270 28)">
      <rect width="104" height="112" rx="10" fill="#fff" stroke="#e6c9a8" strokeWidth="6" />
      <rect x="8" y="8" width="88" height="96" rx="5" fill={garden ? '#9fd8f6' : '#bfe6fb'} />
      <circle cx="74" cy="30" r="12" fill="#ffe27a" />
      <ellipse cx="34" cy="34" rx="16" ry="7" fill="#fff" />
      <ellipse cx="46" cy="30" rx="12" ry="8" fill="#fff" />
      {garden && (
        <g>
          <rect x="8" y="84" width="88" height="20" fill="#8fd18a" />
          {[22, 44, 66, 84].map((x, i) => (
            <g key={x}>
              <line x1={x} x2={x} y1="96" y2="84" stroke="#5fae5a" strokeWidth="2" />
              <circle cx={x} cy="82" r="4.5" fill={['#f48fa8', '#ffd166', '#fff', '#c3a6ff'][i]} />
            </g>
          ))}
        </g>
      )}
      <line x1="52" x2="52" y1="8" y2="104" stroke="#fff" strokeWidth="5" />
      <line x1="8" x2="96" y1="56" y2="56" stroke="#fff" strokeWidth="5" />
      {!garden && (
        <g>
          <path d="M-8 -4 H34 Q26 50 34 104 H-8Z" fill="#ff9fb5" opacity=".92" />
          <path d="M112 -4 H70 Q78 50 70 104 H112Z" fill="#ff9fb5" opacity=".92" />
          <rect x="-12" y="-8" width="128" height="8" rx="4" fill="#e0607f" />
        </g>
      )}
    </g>
  )
}

export function Shelf({ id }: { id?: string }) {
  return (
    <g transform="translate(28 110)">
      <rect x="0" y="40" width="130" height="9" rx="4" fill="#c98f5e" />
      <path d="M14 49 v14 M116 49 v14" stroke="#b27a4c" strokeWidth="5" strokeLinecap="round" />
      {id === 'shelf_plant' && (
        <g>
          <path d="M44 40 h34 l-5 -24 h-24Z" fill="#e0866b" />
          <path d="M61 18 q-22 -4 -24 -22 q20 2 24 22 M61 18 q22 -4 24 -22 q-20 2 -24 22 M61 18 q-4 -26 2 -34 q8 14 -2 34" fill="#6fbf73" />
        </g>
      )}
      {id === 'shelf_books' && (
        <g>
          <rect x="22" y="6" width="16" height="34" rx="2" fill="#f48fa8" />
          <rect x="40" y="12" width="14" height="28" rx="2" fill="#8fb8f4" />
          <rect x="56" y="2" width="18" height="38" rx="2" fill="#f6c946" />
          <rect x="78" y="14" width="30" height="8" rx="2" fill="#7ecbb4" />
          <rect x="80" y="24" width="28" height="8" rx="2" fill="#c3a6ff" />
          <rect x="82" y="33" width="26" height="7" rx="2" fill="#f48fa8" />
        </g>
      )}
      {id === 'shelf_lamp' && (
        <g>
          <rect x="50" y="34" width="24" height="6" rx="3" fill="#b27a4c" />
          <rect x="60" y="14" width="4" height="22" fill="#b27a4c" />
          <path d="M44 16 L52 -8 H72 L80 16Z" fill="#ffd98a" stroke="#f0b95a" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="62" cy="16" rx="18" ry="4" fill="#fff0c2" opacity=".8" />
        </g>
      )}
      {id === 'shelf_trophy' && (
        <g>
          <rect x="48" y="30" width="28" height="10" rx="2" fill="#b27a4c" />
          <rect x="58" y="20" width="8" height="12" fill="#d6a21f" />
          <path d="M46 -2 H78 Q78 22 62 22 Q46 22 46 -2Z" fill="#f6c946" stroke="#d6a21f" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M46 4 Q36 4 38 12 Q40 18 48 16 M78 4 Q88 4 86 12 Q84 18 76 16" fill="none" stroke="#d6a21f" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {id === 'shelf_fish' && (
        <g>
          <ellipse cx="62" cy="22" rx="28" ry="18" fill="#bfe6fb" stroke="#fff" strokeWidth="3" />
          <path d="M36 40 h52" stroke="#e6c9a8" strokeWidth="3" />
          <motion.g animate={{ x: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="62" cy="24" rx="8" ry="5" fill="#ff9a62" />
            <path d="M54 24 l-8 -5 v10Z" fill="#ff9a62" />
            <circle cx="67" cy="22" r="1.4" fill="#4a2f27" />
          </motion.g>
        </g>
      )}
    </g>
  )
}

export function Bed({ id }: { id?: string }) {
  if (!id) return null
  return (
    <g transform="translate(34 286)">
      {id === 'bed_basket' && (
        <g>
          <ellipse cx="78" cy="30" rx="82" ry="26" fill="#c98f5e" />
          <ellipse cx="78" cy="24" rx="66" ry="17" fill="#ffe6c7" />
          <path d="M16 36 q62 20 124 0" fill="none" stroke="#a8743f" strokeWidth="3" strokeDasharray="6 6" />
        </g>
      )}
      {id === 'bed_cloud' && (
        <g fill="#e8f2ff" stroke="#c9ddf7" strokeWidth="2">
          <ellipse cx="78" cy="32" rx="84" ry="24" />
          <circle cx="26" cy="22" r="20" />
          <circle cx="56" cy="12" r="22" />
          <circle cx="98" cy="12" r="22" />
          <circle cx="130" cy="22" r="20" />
          <ellipse cx="78" cy="22" rx="52" ry="12" fill="#f5f9ff" stroke="none" />
        </g>
      )}
      {id === 'bed_tent' && (
        <g>
          <ellipse cx="78" cy="34" rx="76" ry="14" fill="#e6c9a8" />
          <path d="M10 34 L78 -14 L146 34Z" fill="#8fd1c2" stroke="#6db5a5" strokeWidth="3" strokeLinejoin="round" />
          <path d="M52 34 Q78 4 104 34Z" fill="#5a4a6a" />
          <path d="M78 -14 V-26" stroke="#6db5a5" strokeWidth="3" />
          <path d="M78 -26 l14 5 -14 5Z" fill="#f48fa8" />
        </g>
      )}
      {id === 'bed_cushion' && (
        <g>
          <ellipse cx="78" cy="30" rx="78" ry="22" fill="#f48fa8" />
          <ellipse cx="78" cy="25" rx="62" ry="15" fill="#ffc2d1" />
          <circle cx="78" cy="25" r="3" fill="#f48fa8" />
        </g>
      )}
    </g>
  )
}
