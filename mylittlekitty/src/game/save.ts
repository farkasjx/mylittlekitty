import { emptyCounters } from './achievements'
import { SAVE_KEY, SAVE_VERSION } from './config'
import { createNewGame } from './mechanics'
import { generateDailyQuests, dateKey, getTemplate } from './quests'
import { getItem } from './items'
import type { ActionId, EquipSlot, Game } from './types'

const WISHES: ActionId[] = ['feed', 'pet', 'play', 'sleep', 'groom', 'litter']

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

/**
 * Turns any unknown value into a valid Game, falling back to safe defaults field by field.
 * Returns null when there is nothing usable (no adopted pet).
 */
export function sanitizeSave(raw: unknown, now: number): Game | null {
  if (!isObj(raw) || raw.adopted !== true) return null
  const base = createNewGame(typeof raw.name === 'string' ? raw.name : 'Kitty', now)
  const stats = isObj(raw.stats) ? raw.stats : {}
  const counters = isObj(raw.counters) ? raw.counters : {}
  const emptyC = emptyCounters()

  const inventory: Record<string, number> = { ...base.inventory }
  if (isObj(raw.inventory)) {
    for (const [id, count] of Object.entries(raw.inventory)) {
      if (getItem(id) && typeof count === 'number' && count > 0) inventory[id] = Math.floor(count)
    }
  }

  const equipped: Game['equipped'] = { ...base.equipped }
  if (isObj(raw.equipped)) {
    for (const [slot, id] of Object.entries(raw.equipped)) {
      const item = typeof id === 'string' ? getItem(id) : undefined
      if (item?.slot === slot && inventory[item.id]) equipped[slot as EquipSlot] = item.id
    }
  }

  let quests = generateDailyQuests(dateKey(now))
  if (isObj(raw.quests) && typeof raw.quests.date === 'string' && Array.isArray(raw.quests.items)) {
    const items = raw.quests.items.flatMap((q: unknown) => {
      if (!isObj(q) || typeof q.id !== 'string') return []
      const t = getTemplate(q.id)
      if (!t) return []
      return [{ id: q.id, progress: num(q.progress, 0, 0, t.target), claimed: q.claimed === true }]
    })
    if (items.length > 0) quests = { date: raw.quests.date, items }
  }

  const achievements: Record<string, number> = {}
  if (isObj(raw.achievements)) {
    for (const [id, at] of Object.entries(raw.achievements)) {
      if (typeof at === 'number') achievements[id] = at
    }
  }

  return {
    version: SAVE_VERSION,
    adopted: true,
    name: base.name,
    createdAt: num(raw.createdAt, now),
    lastSimulated: num(raw.lastSimulated, now),
    snoozed: raw.snoozed === true,
    litter: num(raw.litter, base.litter, 0, 100),
    wish: typeof raw.wish === 'string' && (WISHES as string[]).includes(raw.wish) ? (raw.wish as ActionId) : null,
    stats: {
      hunger: num(stats.hunger, base.stats.hunger, 0, 100),
      happiness: num(stats.happiness, base.stats.happiness, 0, 100),
      energy: num(stats.energy, base.stats.energy, 0, 100),
      cleanliness: num(stats.cleanliness, base.stats.cleanliness, 0, 100),
    },
    level: Math.floor(num(raw.level, 1, 1, 999)),
    xp: Math.floor(num(raw.xp, 0)),
    coins: Math.floor(num(raw.coins, base.coins)),
    affection: num(raw.affection, 0),
    inventory,
    equipped,
    quests,
    achievements,
    counters: Object.fromEntries(
      Object.entries(emptyC).map(([k, v]) => [k, num(counters[k], v)]),
    ) as unknown as Game['counters'],
  }
}

/** Upgrade hook for older save versions. */
function migrate(raw: unknown): unknown {
  if (!isObj(raw)) return raw
  // v1 is the first schema; future migrations transform `raw` by `raw.version` here.
  return raw
}

export function loadGame(now: number, storage: Pick<Storage, 'getItem'> = localStorage): Game | null {
  try {
    const text = storage.getItem(SAVE_KEY)
    if (!text) return null
    return sanitizeSave(migrate(JSON.parse(text)), now)
  } catch {
    return null
  }
}

export function saveGame(game: Game, storage: Pick<Storage, 'setItem'> = localStorage): void {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(game))
  } catch {
    // Storage may be full or unavailable; the game keeps running in memory.
  }
}

export function clearSave(storage: Pick<Storage, 'removeItem'> = localStorage): void {
  try {
    storage.removeItem(SAVE_KEY)
  } catch {
    // ignore
  }
}
