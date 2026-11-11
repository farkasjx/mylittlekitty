import { getItem } from '../../game/items'
import { t } from '../../i18n'
import { itemName } from '../../i18n/content'
import type { ItemCategory, ItemDef } from '../../game/types'
import { useGame } from '../../store/useGame'
import { itemIcon, SLOT_LABELS } from '../ui/meta'
import { Button, Card, ScreenTitle } from '../ui/Primitives'

const ORDER: ItemCategory[] = ['food', 'toy', 'accessory', 'bed', 'decoration']

export function ItemRow({ item }: { item: ItemDef }) {
  const game = useGame((s) => s.game)
  const equipItem = useGame((s) => s.equipItem)
  const unequipSlot = useGame((s) => s.unequipSlot)
  const count = game.inventory[item.id] ?? 0
  const isEquipped = !!item.slot && game.equipped[item.slot] === item.id

  return (
    <Card className={`flex items-center gap-3 !p-3 ${isEquipped ? 'ring-2 ring-rose' : ''}`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-peach text-2xl" aria-hidden>
        {itemIcon(item)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-extrabold">
          {itemName(item)}
          {item.category === 'food' && !item.unlimited && <span className="text-cocoa-soft"> x{count}</span>}
        </div>
        <div className="truncate text-xs text-cocoa-soft">
          {item.slot ? t(SLOT_LABELS[item.slot]) : item.category === 'toy' ? t('inv.toyHint') : t('inv.foodHint')}
        </div>
      </div>
      {item.slot && (
        <Button
          variant={isEquipped ? 'soft' : 'primary'}
          className="!px-3 !py-2"
          onClick={() => (isEquipped ? unequipSlot(item.slot!) : equipItem(item.id))}
        >
          {isEquipped ? t('inv.remove') : t('inv.equip')}
        </Button>
      )}
    </Card>
  )
}

export function InventoryScreen() {
  const inventory = useGame((s) => s.game.inventory)
  const owned = Object.keys(inventory).flatMap((id) => {
    const item = getItem(id)
    return item ? [item] : []
  })
  const shown = ORDER.map((c) => ({ c, items: owned.filter((i) => i.category === c) })).filter((g) => g.items.length > 0)

  return (
    <div>
      <ScreenTitle title={t('inv.title')} subtitle={t('inv.subtitle')} />
      <div className="flex flex-col gap-4">
        {shown.map(({ c, items }) => (
          <section key={c}>
            <h2 className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-cocoa-soft">{t(`cat.${c}`)}</h2>
            <div className="flex flex-col gap-2">
              {items.map((i) => (
                <ItemRow key={i.id} item={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
