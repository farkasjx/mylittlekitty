import { useState } from 'react'
import { t } from '../../i18n'
import { achDesc, achName } from '../../i18n/content'
import { ACHIEVEMENTS } from '../../game/achievements'
import { bondLevel, deriveMood } from '../../game/behavior'
import { BOND_THRESHOLDS } from '../../game/config'
import { useGame } from '../../store/useGame'
import { Cat } from '../cat/Cat'
import { Button, Card, Meter, ScreenTitle } from '../ui/Primitives'

export function ProfileScreen() {
  const game = useGame((s) => s.game)
  const reset = useGame((s) => s.resetGame)
  const [confirming, setConfirming] = useState(false)
  const bond = bondLevel(game.affection)
  const c = game.counters
  const days = Math.max(1, Math.ceil((game.lastSimulated - game.createdAt) / 86_400_000))
  const stats: [string, number][] = [
    [t('cnt.feeds'), c.feeds],
    [t('cnt.pets'), c.pets],
    [t('cnt.plays'), c.plays],
    [t('cnt.sleeps'), c.sleeps],
    [t('cnt.grooms'), c.grooms],
    [t('cnt.litters'), c.litters],
    [t('cnt.wishes'), c.wishes],
    [t('cnt.minigames'), c.minigames],
    [t('cnt.bestScore'), c.bestScore],
    [t('cnt.coinsEarned'), c.coinsEarned],
  ]

  return (
    <div className="flex flex-col gap-3">
      <ScreenTitle title={t('p.title')} />
      <Card className="flex items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-peach">
          <svg viewBox="10 20 180 190" className="h-full w-full">
            <Cat mood={deriveMood(game.stats, null)} hat={game.equipped.hat} collar={game.equipped.collar} />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-extrabold">{game.name}</div>
          <div className="text-sm font-bold text-cocoa-soft">{t('p.sub', { l: game.level, d: days })}</div>
          <div className="mt-1 text-sm font-extrabold text-rose-deep">{bond.title}</div>
          <Meter value={bond.next ? game.affection - BOND_THRESHOLDS[bond.index] : 1} max={bond.next ? bond.next - BOND_THRESHOLDS[bond.index] : 1} color="#f48fa8" label="♥" />
          <div className="mt-0.5 text-xs text-cocoa-soft">{bond.next ? t('p.affection', { a: Math.floor(game.affection), b: bond.next }) : t('p.affectionMax', { a: Math.floor(game.affection) })}</div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-cocoa-soft">{t('p.stats')}</h2>
        <dl className="grid grid-cols-2 gap-2">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-peach/60 px-3 py-2">
              <dt className="text-xs text-cocoa-soft">{label}</dt>
              <dd className="text-lg font-extrabold">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-cocoa-soft">
          {t('p.achievements', { a: Object.keys(game.achievements).length, b: ACHIEVEMENTS.length })}
        </h2>
        <ul className="flex flex-col gap-2">
          {ACHIEVEMENTS.map((a) => {
            const got = game.achievements[a.id] !== undefined
            return (
              <li key={a.id} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${got ? 'bg-[#fff3cf]' : 'bg-black/5 opacity-70'}`}>
                <span className={`text-2xl ${got ? '' : 'grayscale'}`} aria-hidden>{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold">{achName(a)}</div>
                  <div className="text-xs text-cocoa-soft">{achDesc(a)}</div>
                </div>
                {got && <span className="text-xs font-extrabold text-[#2f6b57]">{t('p.unlocked')}</span>}
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        {confirming ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">{t('p.confirm')}</p>
            <div className="flex gap-2">
              <Button variant="soft" className="flex-1" onClick={() => setConfirming(false)}>{t('p.keep')}</Button>
              <Button className="flex-1" onClick={reset}>{t('p.erase')}</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" className="w-full" onClick={() => setConfirming(true)}>{t('p.startOver')}</Button>
        )}
      </Card>
    </div>
  )
}
