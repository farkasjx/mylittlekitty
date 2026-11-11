import { motion } from 'framer-motion'
import { t } from '../../i18n'
import { questTitle } from '../../i18n/content'
import { getTemplate, isQuestComplete } from '../../game/quests'
import { useGame } from '../../store/useGame'
import { Button, Card, CoinIcon, Meter, ScreenTitle } from '../ui/Primitives'

export function QuestsScreen() {
  const quests = useGame((s) => s.game.quests)
  const claim = useGame((s) => s.claim)
  const done = quests.items.filter((q) => q.claimed).length

  return (
    <div>
      <ScreenTitle title={t('q.title')} subtitle={t('q.subtitle', { done, total: quests.items.length })} />
      <div className="flex flex-col gap-3">
        {quests.items.map((q) => {
          const tpl = getTemplate(q.id)
          if (!tpl) return null
          const complete = isQuestComplete(q)
          return (
            <Card key={q.id} className={q.claimed ? 'opacity-70' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold">{q.claimed && <span aria-hidden>✅ </span>}{questTitle(tpl)}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs font-bold text-cocoa-soft">
                    <span>+{tpl.rewardXp} XP</span>
                    <span className="inline-flex items-center gap-1"><CoinIcon /> {tpl.rewardCoins}</span>
                  </div>
                </div>
                {q.claimed ? (
                  <span className="rounded-full bg-[#e4f7ee] px-3 py-1 text-xs font-extrabold text-[#2f6b57]">{t('q.claimed')}</span>
                ) : (
                  <motion.div animate={complete ? { scale: [1, 1.06, 1] } : undefined} transition={{ repeat: Infinity, duration: 1.2 }}>
                    <Button disabled={!complete} onClick={() => claim(q.id)} className="!py-2">
                      {complete ? t('q.claim') : t('q.inProgress')}
                    </Button>
                  </motion.div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Meter value={q.progress} max={tpl.target} color={complete ? '#7ecbb4' : '#f6a35a'} label={questTitle(tpl)} />
                <span className="text-xs font-extrabold tabular-nums">{q.progress}/{tpl.target}</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
