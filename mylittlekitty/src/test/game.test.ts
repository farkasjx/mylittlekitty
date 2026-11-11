import { describe, expect, it } from 'vitest'
import { OFFLINE, THRESHOLDS, levelXpRequired } from '../game/config'
import {
  applyElapsed,
  syncGame,
  claimQuest,
  createNewGame,
  equip,
  finishMinigame,
  grantRewards,
  minigameRewards,
  performAction,
  purchase,
  refreshDaily,
  unequip,
} from '../game/mechanics'
import { deriveMood } from '../game/behavior'
import { dateKey, generateDailyQuests, QUEST_TEMPLATES } from '../game/quests'
import { loadGame, saveGame, sanitizeSave } from '../game/save'
import { SAVE_KEY } from '../game/config'
import { FIELD, BASKET, initialMiniState, moveBasket, stepMini } from '../game/minigame'
import type { Game } from '../game/types'

const T0 = new Date(2026, 0, 10, 12, 0, 0).getTime()
const HOUR = 3_600_000
const fresh = (): Game => createNewGame('Mochi', T0)
const withStats = (g: Game, stats: Partial<Game['stats']>): Game => ({ ...g, stats: { ...g.stats, ...stats } })

describe('actions', () => {
  it('feeding reduces hunger and rewards xp', () => {
    const g = withStats(fresh(), { hunger: 60 })
    const r = performAction(g, 'feed', T0)
    expect(r.ok).toBe(true)
    expect(r.game.stats.hunger).toBe(40)
    expect(r.game.xp).toBeGreaterThan(0)
  })

  it('refuses feeding when not hungry and gives no rewards', () => {
    const g = withStats(fresh(), { hunger: THRESHOLDS.feedMinHunger - 1 })
    const r = performAction(g, 'feed', T0)
    expect(r.ok).toBe(false)
    expect(r.game).toBe(g)
  })

  it('consumes purchased food but not kibble', () => {
    let g = withStats(fresh(), { hunger: 80 })
    g = { ...g, inventory: { ...g.inventory, food_fish: 1 } }
    const r = performAction(g, 'feed', T0, { foodId: 'food_fish' })
    expect(r.game.inventory.food_fish).toBeUndefined()
    expect(performAction(r.game, 'feed', T0, { foodId: 'food_fish' }).ok).toBe(false)
    expect(performAction(r.game, 'feed', T0).ok).toBe(true)
  })

  it('playing raises happiness and costs energy; toys boost it', () => {
    const base = performAction(fresh(), 'play', T0)
    expect(base.game.stats.energy).toBeLessThan(fresh().stats.energy)
    expect(base.game.stats.happiness).toBeGreaterThan(fresh().stats.happiness)
    const withMouse = { ...fresh(), inventory: { ...fresh().inventory, toy_mouse: 1 } }
    const boosted = performAction(withMouse, 'play', T0)
    expect(boosted.game.stats.happiness).toBeGreaterThan(base.game.stats.happiness)
  })

  it('refuses play when exhausted', () => {
    expect(performAction(withStats(fresh(), { energy: 5 }), 'play', T0).ok).toBe(false)
  })

  it('sleep restores energy, bed bonus helps', () => {
    const g = withStats(fresh(), { energy: 20 })
    const plain = performAction(g, 'sleep', T0).game.stats.energy
    const cloud = performAction(
      { ...g, inventory: { ...g.inventory, bed_cloud: 1 }, equipped: { ...g.equipped, bed: 'bed_cloud' } },
      'sleep',
      T0,
    ).game.stats.energy
    expect(plain).toBe(65)
    expect(cloud).toBe(85)
  })

  it('grooming increases cleanliness; petting increases affection and happiness', () => {
    const g = withStats(fresh(), { cleanliness: 30, happiness: 50 })
    expect(performAction(g, 'groom', T0).game.stats.cleanliness).toBe(70)
    const pet = performAction(g, 'pet', T0)
    expect(pet.game.affection).toBeGreaterThan(0)
    expect(pet.game.stats.happiness).toBeGreaterThan(50)
  })

  it('stats stay within 0..100', () => {
    const maxed = performAction(withStats(fresh(), { happiness: 100 }), 'pet', T0)
    expect(maxed.game.stats.happiness).toBe(100)
    const low = performAction(withStats(fresh(), { energy: 15, hunger: 99 }), 'play', T0)
    expect(low.game.stats.energy).toBeGreaterThanOrEqual(0)
    expect(low.game.stats.hunger).toBeLessThanOrEqual(100)
  })

  it('petting a fully happy cat gives no xp', () => {
    const r = performAction(withStats(fresh(), { happiness: 100 }), 'pet', T0)
    expect(r.xpGained).toBe(0)
  })
})

describe('time simulation', () => {
  it('decays stats over time', () => {
    const g = applyElapsed(fresh(), T0 + HOUR)
    expect(g.stats.hunger).toBeGreaterThan(30)
    expect(g.stats.happiness).toBeLessThan(70)
    expect(g.lastSimulated).toBe(T0 + HOUR)
  })

  it('never goes past the offline floors, even after a very long absence', () => {
    const g = applyElapsed(fresh(), T0 + 24 * 30 * HOUR)
    expect(g.stats.hunger).toBeLessThanOrEqual(OFFLINE.floors.hunger)
    expect(g.stats.happiness).toBeGreaterThanOrEqual(OFFLINE.floors.happiness)
    expect(g.stats.energy).toBeGreaterThanOrEqual(OFFLINE.floors.energy)
    expect(g.stats.cleanliness).toBeGreaterThanOrEqual(OFFLINE.floors.cleanliness)
  })

  it('does not punish a short absence heavily', () => {
    const g = applyElapsed(fresh(), T0 + 8 * HOUR)
    expect(g.stats.hunger).toBeLessThan(70)
    expect(g.stats.happiness).toBeGreaterThan(30)
  })

  it('survives clocks going backwards', () => {
    const g = applyElapsed(fresh(), T0 - HOUR)
    expect(g.stats).toEqual(fresh().stats)
    expect(g.lastSimulated).toBe(T0 - HOUR)
  })

  it('does not raise stats that are already below the floor', () => {
    const g = applyElapsed(withStats(fresh(), { happiness: 5 }), T0 + 20 * HOUR)
    expect(g.stats.happiness).toBe(5)
  })
})

describe('progression', () => {
  it('levels up and awards coins, carrying leftover xp', () => {
    const need = levelXpRequired(1)
    const out = grantRewards(fresh(), { xp: need + 5 }, T0)
    expect(out.game.level).toBe(2)
    expect(out.game.xp).toBe(5)
    expect(out.game.coins).toBeGreaterThan(fresh().coins)
    expect(out.levelUps).toEqual([2])
  })

  it('can level several times at once', () => {
    expect(grantRewards(fresh(), { xp: 1000 }, T0).game.level).toBeGreaterThan(3)
  })
})

describe('quests', () => {
  it('is deterministic per day with unique templates', () => {
    const a = generateDailyQuests('2026-01-10')
    expect(generateDailyQuests('2026-01-10')).toEqual(a)
    expect(new Set(a.items.map((i) => i.id)).size).toBe(a.items.length)
    expect(a.items.length).toBe(5)
    const days = new Set(Array.from({ length: 20 }, (_, i) => generateDailyQuests(`2026-02-${i + 1}`).items.map((x) => x.id).join()))
    expect(days.size).toBeGreaterThan(1)
  })

  it('new day regenerates quests without touching progress data', () => {
    let g = fresh()
    g = { ...g, coins: 99, achievements: { first_meal: 1 } }
    const next = refreshDaily(g, T0 + 3 * 24 * HOUR)
    expect(next.quests.date).toBe(dateKey(T0 + 3 * 24 * HOUR))
    expect(next.coins).toBe(99)
    expect(next.achievements).toEqual(g.achievements)
    expect(refreshDaily(g, T0 + 60_000).quests).toBe(g.quests)
  })

  it('tracks progress, completes and claims once', () => {
    let g = fresh()
    g = { ...g, quests: { date: dateKey(T0), items: [{ id: 'pet3', progress: 0, claimed: false }] } }
    for (let i = 0; i < 3; i++) g = performAction(withStats(g, { happiness: 40 }), 'pet', T0).game
    expect(g.quests.items[0].progress).toBe(3)
    const before = g.coins
    const claim = claimQuest(g, 'pet3', T0)
    expect(claim.ok).toBe(true)
    expect(claim.game.coins).toBe(before + 10)
    expect(claimQuest(claim.game, 'pet3', T0).ok).toBe(false)
  })

  it('cannot claim an incomplete quest', () => {
    const g = { ...fresh(), quests: { date: dateKey(T0), items: [{ id: 'play2', progress: 1, claimed: false }] } }
    expect(claimQuest(g, 'play2', T0).ok).toBe(false)
  })

  it('every template is reachable', () => {
    expect(QUEST_TEMPLATES.length).toBeGreaterThanOrEqual(4)
  })
})

describe('shop', () => {
  it('blocks purchases you cannot afford', () => {
    const g = { ...fresh(), coins: 10 }
    const r = purchase(g, 'toy_mouse')
    expect(r.ok).toBe(false)
    expect(r.game.coins).toBe(10)
  })

  it('buys, spends coins, auto-equips cosmetics and blocks duplicates', () => {
    const g = { ...fresh(), coins: 100 }
    const r = purchase(g, 'hat_bow')
    expect(r.ok).toBe(true)
    expect(r.game.coins).toBe(60)
    expect(r.game.equipped.hat).toBe('hat_bow')
    expect(purchase(r.game, 'hat_bow').ok).toBe(false)
  })

  it('allows buying multiple food items and respects level locks', () => {
    let g = { ...fresh(), coins: 100 }
    g = purchase(g, 'food_fish').game
    g = purchase(g, 'food_fish').game
    expect(g.inventory.food_fish).toBe(2)
    expect(purchase(g, 'hat_crown').ok).toBe(false)
  })

  it('equips and unequips only owned items', () => {
    const g = fresh()
    expect(equip(g, 'hat_bow')).toBe(g)
    const owned = { ...g, inventory: { ...g.inventory, hat_bow: 1 } }
    const worn = equip(owned, 'hat_bow')
    expect(worn.equipped.hat).toBe('hat_bow')
    expect(unequip(worn, 'hat').equipped.hat).toBeUndefined()
  })
})

describe('behavior', () => {
  const s = { hunger: 20, happiness: 60, energy: 60, cleanliness: 60 }
  it('derives moods', () => {
    expect(deriveMood(s, null)).toBe('idle')
    expect(deriveMood({ ...s, hunger: 80 }, null)).toBe('hungry')
    expect(deriveMood({ ...s, energy: 10 }, null)).toBe('sleepy')
    expect(deriveMood({ ...s, happiness: 10 }, null)).toBe('sad')
    expect(deriveMood({ ...s, happiness: 90 }, null)).toBe('happy')
    expect(deriveMood(s, 'sleeping')).toBe('sleeping')
    expect(deriveMood(s, 'eating')).toBe('eating')
  })
})

describe('save', () => {
  const memory = () => {
    const data = new Map<string, string>()
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    }
  }

  it('round-trips a game', () => {
    const store = memory()
    const g = { ...fresh(), coins: 77, level: 4 }
    saveGame(g, store)
    expect(loadGame(T0, store)).toEqual(g)
  })

  it('handles corrupt or missing data', () => {
    const store = memory()
    expect(loadGame(T0, store)).toBeNull()
    store.setItem(SAVE_KEY, '{not json')
    expect(loadGame(T0, store)).toBeNull()
    store.setItem(SAVE_KEY, '"hello"')
    expect(loadGame(T0, store)).toBeNull()
  })

  it('repairs invalid fields with safe defaults', () => {
    const g = sanitizeSave(
      { adopted: true, name: 'Pip', stats: { hunger: 999, happiness: 'x' }, coins: -5, level: 'a', inventory: { nonsense: 3, hat_bow: 1 }, equipped: { hat: 'hat_party' }, quests: 5 },
      T0,
    )
    expect(g).not.toBeNull()
    expect(g?.stats.hunger).toBe(100)
    expect(g?.stats.happiness).toBe(70)
    expect(g?.coins).toBe(0)
    expect(g?.level).toBe(1)
    expect(g?.inventory.nonsense).toBeUndefined()
    expect(g?.equipped.hat).toBeUndefined()
    expect(g?.quests.items.length).toBe(5)
  })
})

describe('minigame', () => {
  it('catches a ball over the basket and scores', () => {
    let s = initialMiniState()
    s = { ...s, nextSpawn: 99, balls: [{ id: 1, x: s.basketX, y: BASKET.y - 5, r: 12, vy: 100, points: 3, color: '#fff' }] }
    s = stepMini(s, 0.1, () => 0.5)
    expect(s.score).toBe(3)
    expect(s.caught).toBe(1)
  })

  it('counts misses and clamps the basket', () => {
    let s = initialMiniState()
    s = { ...s, nextSpawn: 99, balls: [{ id: 1, x: 5, y: FIELD.height, r: 12, vy: 100, points: 1, color: '#fff' }] }
    s = stepMini(moveBasket(s, 300), 0.5, () => 0.5)
    expect(s.missed).toBe(1)
    expect(moveBasket(s, -50).basketX).toBe(BASKET.width / 2)
  })

  it('rewards scale with score and are capped', () => {
    expect(minigameRewards(0)).toEqual({ coins: 0, xp: 0 })
    expect(minigameRewards(20).coins).toBeGreaterThan(minigameRewards(5).coins)
    expect(minigameRewards(10_000).coins).toBeLessThanOrEqual(60)
  })

  it('finishing grants rewards and tracks best score', () => {
    const r = finishMinigame(fresh(), 30, T0)
    expect(r.game.coins).toBeGreaterThan(fresh().coins)
    expect(r.game.counters.bestScore).toBe(30)
    expect(r.game.counters.minigames).toBe(1)
  })
})

describe('snooze and content', () => {
  it('snooze freezes needs while time passes', () => {
    const g = { ...createNewGame('Mochi', 0), snoozed: true }
    const later = applyElapsed(g, 20 * 3_600_000)
    expect(later.stats).toEqual(g.stats)
    expect(later.lastSimulated).toBe(20 * 3_600_000)
    const awake = applyElapsed({ ...later, snoozed: false }, 22 * 3_600_000)
    expect(awake.stats.hunger).toBeGreaterThan(g.stats.hunger)
  })

  it('generates five distinct quests per day', () => {
    const q = generateDailyQuests('2026-01-05')
    expect(q.items).toHaveLength(5)
    expect(new Set(q.items.map((i) => i.id)).size).toBe(5)
  })
})

describe('litter and wishes', () => {
  it('litter fills over time and cleaning resets it', () => {
    const g = createNewGame('Mochi', 0)
    const later = applyElapsed(g, 10 * 3_600_000)
    expect(later.litter).toBeGreaterThan(g.litter)
    expect(later.litter).toBeLessThanOrEqual(85)
    const r = performAction({ ...later, wish: null }, 'litter', 10 * 3_600_000)
    expect(r.ok).toBe(true)
    expect(r.game.litter).toBe(0)
    expect(r.game.counters.litters).toBe(1)
    expect(performAction(r.game, 'litter', 10 * 3_600_000).ok).toBe(false)
  })

  it('feeding makes the litter box messier', () => {
    const g = { ...createNewGame('Mochi', 0), wish: null, stats: { hunger: 60, happiness: 70, energy: 80, cleanliness: 80 } }
    expect(performAction(g, 'feed', 0).game.litter).toBeGreaterThan(g.litter)
  })

  it('fulfilling the wish gives a bonus and a new wish', () => {
    const g = { ...createNewGame('Mochi', 0), wish: 'pet' as const }
    const plain = performAction({ ...g, wish: null }, 'pet', 0)
    const wished = performAction(g, 'pet', 0)
    expect(wished.wishGranted).toBe(true)
    expect(wished.coinsGained).toBeGreaterThan(plain.coinsGained)
    expect(wished.game.counters.wishes).toBe(1)
    expect(wished.game.wish).not.toBe('pet')
  })

  it('syncGame assigns a wish', () => {
    expect(syncGame(createNewGame('Mochi', 0), 1000).wish).not.toBeNull()
  })
})
