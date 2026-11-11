import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { t } from '../../i18n'
import { itemName } from '../../i18n/content'
import { deriveMood, idleMessage } from '../../game/behavior'
import { levelXpRequired, LITTER, STAT_MAX, WISH_REWARD } from '../../game/config'
import { ITEMS } from '../../game/items'
import { foodCount } from '../../game/mechanics'
import type { ActionId, StatKey } from '../../game/types'
import { useGame } from '../../store/useGame'
import { RoomScene } from '../cat/RoomScene'
import { itemIcon, STAT_META } from '../ui/meta'
import { Button, CoinIcon, Meter } from '../ui/Primitives'

const STAT_ORDER: StatKey[] = ['hunger', 'happiness', 'energy', 'cleanliness']

function TopBar() {
  const game = useGame((s) => s.game)
  const need = levelXpRequired(game.level)
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-white/80 p-3 shadow-soft">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose text-lg font-extrabold text-white shadow-pop" aria-label={`Lv ${game.level}`}>
        {game.level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="truncate text-base font-extrabold">{game.name}</span>
          <span className="text-xs font-bold text-cocoa-soft">{game.xp}/{need} XP</span>
        </div>
        <Meter value={game.xp} max={need} color="#f48fa8" label="XP" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl bg-[#fff3cf] px-3 py-1.5 text-sm font-extrabold" aria-label={`${game.coins}`}>
        <CoinIcon />
        <motion.span key={game.coins} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
          {game.coins}
        </motion.span>
      </div>
    </div>
  )
}

function SpeechBubble() {
  const message = useGame((s) => s.message)
  const mood = useGame((s) => deriveMood(s.game.stats, s.activity))
  const [expiredId, setExpiredId] = useState(-1)

  useEffect(() => {
    if (!message.text) return
    const timer = setTimeout(() => setExpiredId(message.id), 3500)
    return () => clearTimeout(timer)
  }, [message])

  const text = message.text && message.id !== expiredId ? message.text : idleMessage(mood)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center px-4" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, y: -8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          className="relative rounded-2xl bg-white px-4 py-2 text-sm font-bold shadow-soft"
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function StatBars() {
  const stats = useGame((s) => s.game.stats)
  const litter = useGame((s) => s.game.litter)
  const litterFill = 100 - litter
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-3xl bg-white/80 p-4 shadow-soft">
      {STAT_ORDER.map((k) => {
        const m = STAT_META[k]
        const fill = m.fill(stats[k])
        return (
          <div key={k}>
            <div className="mb-1 flex items-center justify-between text-xs font-extrabold">
              <span>
                <span aria-hidden>{m.icon}</span> {t(m.label)}
              </span>
              <span className={fill < 25 ? 'text-rose-deep' : 'text-cocoa-soft'}>{Math.round(fill)}</span>
            </div>
            <Meter value={fill} max={STAT_MAX} color={m.color} label={t(m.label)} />
          </div>
        )
      })}
      <div className="col-span-2">
        <div className="mb-1 flex items-center justify-between text-xs font-extrabold">
          <span>
            <span aria-hidden>🧹</span> {t('stat.litter')}
          </span>
          <span className={litter >= LITTER.messyThreshold ? 'text-rose-deep' : 'text-cocoa-soft'}>{Math.round(litterFill)}</span>
        </div>
        <Meter value={litterFill} max={STAT_MAX} color="#b08968" label={t('stat.litter')} />
      </div>
    </div>
  )
}

function WishCard() {
  const name = useGame((s) => s.game.name)
  const wish = useGame((s) => s.game.wish)
  if (!wish) return null
  const icon = ACTION_BUTTONS.find((a) => a.id === wish)?.icon
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-[#fff3cf] p-3 shadow-soft">
      <span className="text-3xl" aria-hidden>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-cocoa-soft">{t('wish.title', { name })}</div>
        <div className="text-sm font-extrabold">{t(`wish.${wish}`)}</div>
      </div>
      <div className="text-right text-[11px] font-extrabold text-rose-deep">
        {t('wish.bonus', { xp: WISH_REWARD.xp, coins: WISH_REWARD.coins })}
      </div>
    </div>
  )
}

function FoodSheet({ onClose }: { onClose: () => void }) {
  const inventory = useGame((s) => s.game.inventory)
  const game = useGame((s) => s.game)
  const act = useGame((s) => s.act)
  const foods = ITEMS.filter((i) => i.category === 'food' && (i.unlimited || (inventory[i.id] ?? 0) > 0))
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa/30 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-label={t('act.feed')}
        className="w-full max-w-md rounded-3xl bg-cream p-4 shadow-soft"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-extrabold">{t('food.title', { name: game.name })}</h2>
        <div className="grid grid-cols-2 gap-2">
          {foods.map((f) => {
            const count = foodCount(game, f.id)
            return (
              <button
                key={f.id}
                onClick={() => {
                  act('feed', { foodId: f.id })
                  onClose()
                }}
                className="rounded-2xl bg-white p-3 text-left shadow-pop transition-transform active:scale-95"
              >
                <div className="text-2xl" aria-hidden>{itemIcon(f)}</div>
                <div className="text-sm font-extrabold">{itemName(f)}</div>
                <div className="text-xs text-cocoa-soft">{count === Infinity ? t('food.unlimited') : `x${count}`}</div>
              </button>
            )
          })}
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={onClose}>
          {t('common.cancel')}
        </Button>
      </motion.div>
    </motion.div>
  )
}

const ACTION_BUTTONS: { id: ActionId; label: string; icon: string }[] = [
  { id: 'feed', label: 'act.feed', icon: '🍖' },
  { id: 'pet', label: 'act.pet', icon: '🤚' },
  { id: 'play', label: 'act.play', icon: '🧶' },
  { id: 'sleep', label: 'act.sleep', icon: '🌙' },
  { id: 'groom', label: 'act.groom', icon: '🫧' },
  { id: 'litter', label: 'act.litter', icon: '🧹' },
]

export function HomeScreen({ onMinigame }: { onMinigame: () => void }) {
  const game = useGame((s) => s.game)
  const activity = useGame((s) => s.activity)
  const act = useGame((s) => s.act)
  const setSnooze = useGame((s) => s.setSnooze)
  const [feeding, setFeeding] = useState(false)
  const mood = deriveMood(game.stats, activity)
  const busy = activity === 'sleeping'

  const onAction = (id: ActionId) => {
    if (id === 'feed') setFeeding(true)
    else act(id)
  }

  return (
    <div className="flex flex-col gap-3">
      <TopBar />
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-soft ring-4 ring-white">
        <div className="aspect-[400/360] w-full">
          <RoomScene
            equipped={game.equipped}
            mood={mood}
            activity={activity}
            dirty={game.stats.cleanliness < 30}
            litter={game.litter}
            onLitterClick={() => act('litter')}
            onCatClick={() => act('pet')}
          />
        </div>
        <SpeechBubble />
      </div>
      <WishCard />
      <StatBars />
      <div className="grid grid-cols-3 gap-2">
        {ACTION_BUTTONS.map((a) => (
          <motion.button
            key={a.id}
            whileTap={{ scale: 0.9 }}
            disabled={busy}
            onClick={() => onAction(a.id)}
            className="flex flex-col items-center gap-0.5 rounded-2xl bg-white py-2.5 text-xs font-extrabold shadow-pop transition-colors hover:bg-peach disabled:opacity-50"
          >
            <span className="text-2xl leading-none" aria-hidden>{a.icon}</span>
            {t(a.label)}
          </motion.button>
        ))}
      </div>
      <Button variant="soft" onClick={onMinigame} disabled={busy} className="flex items-center justify-center gap-2">
        <span aria-hidden>🧶</span> {t('home.minigame')}
      </Button>
      {game.snoozed && (
        <p role="status" className="rounded-2xl bg-sky/40 px-3 py-2 text-center text-xs font-bold">
          <span aria-hidden>😴</span> {t('snooze.banner', { name: game.name })}
        </p>
      )}
      <Button variant={game.snoozed ? 'primary' : 'ghost'} onClick={() => setSnooze(!game.snoozed)} className="flex items-center justify-center gap-2">
        <span aria-hidden>😴</span> {t(game.snoozed ? 'snooze.off' : 'snooze.on')}
      </Button>
      {!game.snoozed && <p className="-mt-1 text-center text-[11px] text-cocoa-soft">{t('snooze.hint')}</p>}
      <AnimatePresence>{feeding && <FoodSheet onClose={() => setFeeding(false)} />}</AnimatePresence>
    </div>
  )
}
