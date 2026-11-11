import { ITEMS } from '../../game/items'
import { t } from '../../i18n'
import { itemName } from '../../i18n/content'
import type { EquipSlot } from '../../game/types'
import { useGame } from '../../store/useGame'
import { RoomScene } from '../cat/RoomScene'
import { itemIcon, SLOT_LABELS } from '../ui/meta'
import { Card, ScreenTitle } from '../ui/Primitives'
import type { Tab } from '../ui/BottomNav'

const ROOM_SLOTS: EquipSlot[] = ['wallpaper', 'floor', 'window', 'shelf', 'bed']

export function RoomScreen({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const game = useGame((s) => s.game)
  const equipItem = useGame((s) => s.equipItem)
  const unequipSlot = useGame((s) => s.unequipSlot)

  return (
    <div className="flex flex-col gap-3">
      <ScreenTitle title={t('room.title')} subtitle={t('room.subtitle')} />
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-4 ring-white">
        <div className="aspect-[400/360] w-full">
          <RoomScene equipped={game.equipped} mood="idle" activity={null} dirty={false} showCat={false} />
        </div>
      </div>
      {ROOM_SLOTS.map((slot) => {
        const options = ITEMS.filter((i) => i.slot === slot && (game.inventory[i.id] ?? 0) > 0)
        const current = game.equipped[slot]
        return (
          <Card key={slot} className="!p-3">
            <div className="mb-2 text-sm font-extrabold">{t(SLOT_LABELS[slot])}</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => unequipSlot(slot)}
                aria-pressed={!current}
                className={`rounded-2xl px-3 py-2 text-xs font-extrabold shadow-pop ${!current ? 'bg-rose text-white' : 'bg-peach'}`}
              >
                {t('room.none')}
              </button>
              {options.map((i) => (
                <button
                  key={i.id}
                  onClick={() => equipItem(i.id)}
                  aria-pressed={current === i.id}
                  className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-extrabold shadow-pop ${current === i.id ? 'bg-rose text-white' : 'bg-peach'}`}
                >
                  <span aria-hidden>{itemIcon(i)}</span>
                  {itemName(i)}
                </button>
              ))}
            </div>
          </Card>
        )
      })}
      <button onClick={() => onNavigate('shop')} className="rounded-2xl bg-white py-3 text-sm font-extrabold shadow-pop">
        {t('room.more')}
      </button>
    </div>
  )
}
