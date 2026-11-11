import { useState } from 'react'
import { SHOP_ITEMS } from '../../game/items'
import { t } from '../../i18n'
import { itemDesc, itemName } from '../../i18n/content'
import type { ItemCategory, ItemDef } from '../../game/types'
import { useGame } from '../../store/useGame'
import { itemIcon } from '../ui/meta'
import { Button, Card, CoinIcon, ScreenTitle } from '../ui/Primitives'

const CATEGORIES: ItemCategory[] = ['food', 'toy', 'accessory', 'decoration', 'bed']

function ShopCard({ item }: { item: ItemDef }) {
  const game = useGame((s) => s.game)
  const buy = useGame((s) => s.buy)
  const owned = game.inventory[item.id] ?? 0
  const locked = game.level < item.minLevel
  const isFood = item.category === 'food'
  const soldOut = !isFood && owned > 0
  const poor = game.coins < item.price

  return (
    <Card className="flex flex-col gap-1 !p-3">
      <div className="flex items-start justify-between">
        <span className="text-3xl" aria-hidden>{locked ? '🔒' : itemIcon(item)}</span>
        {isFood && owned > 0 && <span className="rounded-full bg-peach px-2 py-0.5 text-xs font-extrabold">x{owned}</span>}
      </div>
      <div className="text-sm font-extrabold">{itemName(item)}</div>
      <p className="min-h-8 text-xs leading-snug text-cocoa-soft">{locked ? t('shop.unlocksAt', { n: item.minLevel }) : itemDesc(item)}</p>
      <Button
        variant={soldOut ? 'soft' : 'primary'}
        disabled={locked || soldOut || poor}
        onClick={() => buy(item.id)}
        className="mt-1 !py-2"
        label={t('shop.buy', { item: itemName(item) })}
      >
        {soldOut ? t('shop.owned') : (
          <span className="inline-flex items-center gap-1.5">
            <CoinIcon /> {item.price}
          </span>
        )}
      </Button>
    </Card>
  )
}

export function ShopScreen() {
  const coins = useGame((s) => s.game.coins)
  const [cat, setCat] = useState<ItemCategory>('food')
  const items = SHOP_ITEMS.filter((i) => i.category === cat)
  return (
    <div>
      <ScreenTitle title={t('shop.title')} subtitle={t('shop.coins', { n: coins })} />
      <div role="tablist" className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold shadow-pop transition-colors ${cat === c ? 'bg-rose text-white' : 'bg-white'}`}
          >
            {t(`cat.${c}`)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <ShopCard key={i.id} item={i} />
        ))}
      </div>
    </div>
  )
}
