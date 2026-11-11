import type { ItemDef, StatKey } from '../../game/types'

export const STAT_META: Record<StatKey, { label: string; icon: string; color: string; fill: (v: number) => number }> = {
  hunger: { label: 'stat.hunger', icon: '🍖', color: '#f6a35a', fill: (v) => 100 - v },
  happiness: { label: 'stat.happiness', icon: '💗', color: '#f48fa8', fill: (v) => v },
  energy: { label: 'stat.energy', icon: '⚡', color: '#f6c946', fill: (v) => v },
  cleanliness: { label: 'stat.cleanliness', icon: '🫧', color: '#7ecbb4', fill: (v) => v },
}

const ICONS: Record<string, string> = {
  food_kibble: '🥣', food_fish: '🐟', food_milk: '🥛', food_tuna: '🍣', food_cake: '🍰',
  toy_yarn: '🧶', toy_mouse: '🐭', toy_feather: '🪶', toy_laser: '✨',
  hat_bow: '🎀', hat_party: '🎉', hat_crown: '👑', col_red: '❤️', col_bell: '🔔', col_scarf: '🧣',
  bed_cushion: '🛏️', bed_basket: '🧺', bed_cloud: '☁️',
  wp_cream: '🟨', wp_pink: '🌸', wp_mint: '🍃', wp_night: '🌙',
  fl_wood: '🪵', fl_carpet: '🟪', fl_checker: '🏁',
  win_curtain: '🪟', win_garden: '🌷',
  shelf_plant: '🪴', shelf_books: '📚', shelf_fish: '🐠',
  food_sardine: '🥫', food_icecream: '🍦', food_chicken: '🍗', food_sushi: '🍣',
  toy_ball: '🔔', toy_tunnel: '🕳️', toy_robot: '🤖',
  hat_flower: '🌼', hat_wizard: '🧙', col_bowtie: '🎩', col_medal: '🏅',
  bed_tent: '⛺', win_night: '🌃', shelf_lamp: '💡', shelf_trophy: '🏆',
}

export const itemIcon = (item: Pick<ItemDef, 'id'>): string => ICONS[item.id] ?? '🎁'

/** i18n keys */
export const SLOT_LABELS = {
  hat: 'slot.hat',
  collar: 'slot.collar',
  wallpaper: 'slot.wallpaper',
  floor: 'slot.floor',
  window: 'slot.window',
  shelf: 'slot.shelf',
  bed: 'slot.bed',
} as const
