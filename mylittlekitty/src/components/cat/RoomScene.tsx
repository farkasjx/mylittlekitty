import { motion } from 'framer-motion'
import type { Activity, CatMood, Game } from '../../game/types'
import { Cat } from './Cat'
import { LitterBox } from './LitterBox'
import { Effects } from './Effects'
import { Bed, Floor, Shelf, Wallpaper, Window } from './RoomDecor'
import { ROOM } from './roomDims'

interface RoomSceneProps {
  equipped: Game['equipped']
  mood: CatMood
  activity: Activity | null
  dirty: boolean
  showCat?: boolean
  litter?: number
  onLitterClick?: () => void
  onCatClick?: () => void
}

export function RoomScene({ equipped, mood, activity, dirty, showCat = true, onCatClick, litter, onLitterClick }: RoomSceneProps) {
  const sleeping = mood === 'sleeping'
  const onBed = sleeping && !!equipped.bed
  const catX = onBed ? 8 : 100
  const catY = onBed ? 112 : 128

  return (
    <svg viewBox={`0 0 ${ROOM.width} ${ROOM.height}`} className="h-full w-full select-none" role="img" aria-label="The kitty's room">
      <Wallpaper id={equipped.wallpaper} />
      <Floor id={equipped.floor} />
      <Window id={equipped.window} />
      <Shelf id={equipped.shelf} />
      <Bed id={equipped.bed} />
      <ellipse cx={onBed ? 110 : 200} cy={onBed ? 318 : 328} rx="70" ry="10" fill="#000" opacity=".08" />
      {litter !== undefined && <LitterBox litter={litter} onClick={onLitterClick} />}
      {showCat && (
        <motion.g
          initial={false}
          animate={{ x: catX, y: catY }}
          transition={{ type: 'spring', stiffness: 70, damping: 14 }}
          onClick={onCatClick}
          style={{ cursor: onCatClick ? 'pointer' : 'default' }}
        >
          <motion.g
            key={activity === 'playing' ? 'play' : 'still'}
            animate={activity === 'playing' ? { y: [0, -14, 0, -8, 0] } : { y: 0 }}
            transition={{ duration: 0.9, repeat: activity === 'playing' ? Infinity : 0 }}
          >
            <rect x="30" y="10" width="140" height="190" fill="transparent" />
            <Cat mood={mood} hat={equipped.hat} collar={equipped.collar} dirty={dirty} />
          </motion.g>
        </motion.g>
      )}
      {showCat && (
        <g transform={onBed ? 'translate(-92 8)' : undefined}>
          <Effects activity={activity} mood={mood} />
        </g>
      )}
    </svg>
  )
}
