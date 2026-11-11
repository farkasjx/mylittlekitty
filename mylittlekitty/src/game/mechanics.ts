import { t } from '../i18n'
import { itemName } from '../i18n/content'
import { ACHIEVEMENTS, emptyCounters } from './achievements'
import {
  ACTIONS,
  DECAY_PER_HOUR,
  FREE_FOOD_ID,
  HUNGRY_HAPPINESS_PENALTY,
  HUNGRY_THRESHOLD,
  LITTER,
  MINIGAME,
  OFFLINE,
  SAVE_VERSION,
  STAT_MAX,
  STAT_MIN,
  THRESHOLDS,
  WISH_REWARD,
  levelUpCoins,
  levelXpRequired,
} from './config'
import { STARTER_ITEMS, getItem } from './items'
import { messageFor } from './messages'
import { addQuestProgress, generateDailyQuests, getTemplate, dateKey, ensureDailyQuests, isQuestComplete } from './quests'
import type {
  ActionId,
  ActionResult,
  Activity,
  EquipSlot,
  Game,
  QuestMetric,
  StatKey,
  Stats,
} from './types'

export const clamp = (n: number, min = STAT_MIN, max = STAT_MAX): number =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))

const clampStats = (s: Stats): Stats => ({
  hunger: clamp(s.hunger),
  happiness: clamp(s.happiness),
  energy: clamp(s.energy),
  cleanliness: clamp(s.cleanliness),
})

export function createNewGame(name: string, now: number): Game {
  const inventory: Record<string, number> = {}
  const equipped: Game['equipped'] = {}
  for (const item of STARTER_ITEMS) {
    inventory[item.id] = 1
    if (item.slot) equipped[item.slot] = item.id
  }
  return {
    version: SAVE_VERSION,
    adopted: true,
    name: name.trim().slice(0, 16) || 'Kitty',
    createdAt: now,
    lastSimulated: now,
    snoozed: false,
    litter: LITTER.startValue,
    wish: null,
    stats: { hunger: 30, happiness: 70, energy: 80, cleanliness: 80 },
    level: 1,
    xp: 0,
    coins: 20,
    affection: 0,
    inventory,
    equipped,
    quests: generateDailyQuests(dateKey(now)),
    achievements: {},
    counters: emptyCounters(),
  }
}

export function createEmptyGame(now: number): Game {
  return { ...createNewGame('Kitty', now), adopted: false }
}

/* ---------- Time simulation ---------- */

function decayAmount(rate: number, hours: number): number {
  const full = Math.min(hours, OFFLINE.fullRateHours)
  const away = Math.max(0, hours - OFFLINE.fullRateHours)
  return rate * (full + away * OFFLINE.awayRate)
}

/** Applies the time between `game.lastSimulated` and `now`. Safe against clock changes. */
export function applyElapsed(game: Game, now: number): Game {
  if (!game.adopted || game.snoozed) return game.lastSimulated === now ? game : { ...game, lastSimulated: now }
  const elapsed = now - game.lastSimulated
  if (elapsed <= 0) return elapsed < 0 ? { ...game, lastSimulated: now } : game
  const hours = Math.min(elapsed / 3_600_000, OFFLINE.maxHours)
  const s = game.stats
  const happinessRate =
    DECAY_PER_HOUR.happiness *
    (s.hunger >= HUNGRY_THRESHOLD ? HUNGRY_HAPPINESS_PENALTY : 1) *
    (game.litter >= LITTER.messyThreshold ? LITTER.messyHappinessPenalty : 1)

  const soften = (current: number, target: number, floor: number, dir: 1 | -1): number => {
    // Time can only push a stat toward its floor, never beyond it, and never undo being already past it.
    if (dir === -1) return current <= floor ? current : Math.max(floor, target)
    return current >= floor ? current : Math.min(floor, target)
  }

  const stats: Stats = {
    hunger: soften(s.hunger, s.hunger + decayAmount(DECAY_PER_HOUR.hunger, hours), OFFLINE.floors.hunger, 1),
    happiness: soften(s.happiness, s.happiness - decayAmount(happinessRate, hours), OFFLINE.floors.happiness, -1),
    energy: soften(s.energy, s.energy - decayAmount(DECAY_PER_HOUR.energy, hours), OFFLINE.floors.energy, -1),
    cleanliness: soften(s.cleanliness, s.cleanliness - decayAmount(DECAY_PER_HOUR.cleanliness, hours), OFFLINE.floors.cleanliness, -1),
  }
  const litter = game.litter >= LITTER.offlineCeiling ? game.litter : Math.min(LITTER.offlineCeiling, game.litter + decayAmount(LITTER.perHour, hours))
  return { ...game, stats: clampStats(stats), litter, lastSimulated: now }
}

/** Fresh quests on a new calendar day. Existing progress, items and achievements are untouched. */
export function refreshDaily(game: Game, now: number): Game {
  const quests = ensureDailyQuests(game.quests, now)
  return quests === game.quests ? game : { ...game, quests }
}

export function syncGame(game: Game, now: number): Game {
  const g = refreshDaily(applyElapsed(game, now), now)
  return g.wish ? g : { ...g, wish: pickWish(g, now) }
}

/** Candidate wishes are only things the kitty can actually use right now. */
export function pickWish(game: Game, now: number, avoid?: ActionId): ActionId {
  const s = game.stats
  const options: ActionId[] = []
  if (s.hunger >= 35) options.push('feed')
  if (s.happiness < 85) options.push('pet')
  if (s.energy >= 40) options.push('play')
  if (s.energy <= 60) options.push('sleep')
  if (s.cleanliness <= 70) options.push('groom')
  if (game.litter >= 30) options.push('litter')
  const pool = options.filter((o) => o !== avoid)
  const list = pool.length > 0 ? pool : options.length > 0 ? options : (['pet'] as ActionId[])
  return list[Math.floor(now / 1000) % list.length]
}

/* ---------- Rewards ---------- */

interface Rewards {
  xp?: number
  coins?: number
  affection?: number
}

interface RewardOutcome {
  game: Game
  levelUps: number[]
  newAchievements: string[]
}

function bumpMetric(game: Game, metric: QuestMetric, amount: number): Game {
  return { ...game, quests: addQuestProgress(game.quests, metric, amount) }
}

export function unlockAchievements(game: Game, now: number): { game: Game; unlocked: string[] } {
  let g = game
  const unlocked: string[] = []
  let progressed = true
  while (progressed) {
    progressed = false
    for (const a of ACHIEVEMENTS) {
      if (g.achievements[a.id] === undefined && a.check(g)) {
        g = {
          ...g,
          achievements: { ...g.achievements, [a.id]: now },
          coins: g.coins + a.rewardCoins,
          counters: { ...g.counters, coinsEarned: g.counters.coinsEarned + a.rewardCoins },
        }
        unlocked.push(a.id)
        progressed = true
      }
    }
  }
  return { game: g, unlocked }
}

export function grantRewards(game: Game, r: Rewards, now: number): RewardOutcome {
  const xpGain = Math.max(0, Math.round(r.xp ?? 0))
  const coinGain = Math.max(0, Math.round(r.coins ?? 0))
  let g: Game = {
    ...game,
    coins: game.coins + coinGain,
    affection: game.affection + Math.max(0, r.affection ?? 0),
    counters: { ...game.counters, coinsEarned: game.counters.coinsEarned + coinGain },
  }
  const levelUps: number[] = []
  let xp = g.xp + xpGain
  let level = g.level
  let bonusCoins = 0
  while (xp >= levelXpRequired(level)) {
    xp -= levelXpRequired(level)
    level += 1
    levelUps.push(level)
    bonusCoins += levelUpCoins(level)
  }
  g = {
    ...g,
    xp,
    level,
    coins: g.coins + bonusCoins,
    counters: { ...g.counters, coinsEarned: g.counters.coinsEarned + bonusCoins },
  }
  g = bumpMetric(g, 'xp', xpGain)
  g = bumpMetric(g, 'coins', coinGain + bonusCoins)
  const { game: withAch, unlocked } = unlockAchievements(g, now)
  return { game: withAch, levelUps, newAchievements: unlocked }
}

/* ---------- Actions ---------- */

const fail = (game: Game, message: string): ActionResult => ({
  game,
  ok: false,
  message,
  activity: null,
  xpGained: 0,
  coinsGained: 0,
  levelUps: [],
  newAchievements: [],
})

export function bestToyBonus(game: Game): number {
  let best = 1
  for (const id of Object.keys(game.inventory)) {
    best = Math.max(best, getItem(id)?.toyBonus ?? 1)
  }
  return best
}

export function equippedBedBonus(game: Game): number {
  const id = game.equipped.bed
  return (id && getItem(id)?.bedBonus) || 0
}

export const foodCount = (game: Game, foodId: string): number =>
  foodId === FREE_FOOD_ID ? Infinity : (game.inventory[foodId] ?? 0)

const ACTIVITY_FOR: Record<ActionId, Activity> = {
  feed: 'eating',
  pet: 'petted',
  play: 'playing',
  sleep: 'sleeping',
  groom: 'grooming',
  litter: 'grooming',
}

const COUNTER_FOR: Record<ActionId, keyof Game['counters']> = {
  feed: 'feeds',
  pet: 'pets',
  play: 'plays',
  sleep: 'sleeps',
  groom: 'grooms',
  litter: 'litters',
}

export function performAction(
  game: Game,
  action: ActionId,
  now: number,
  options: { foodId?: string } = {},
): ActionResult {
  const cfg = ACTIONS[action]
  const s = game.stats
  let stats: Stats = { ...s }
  let inventory = game.inventory
  let rewardXp = cfg.xp
  let rewardCoins = cfg.coins
  let message = ''
  let litter = game.litter
  if (action === 'feed') litter = Math.min(100, litter + LITTER.perMeal)

  switch (action) {
    case 'feed': {
      const foodId = options.foodId ?? FREE_FOOD_ID
      const food = getItem(foodId)
      if (!food?.food || food.category !== 'food') return fail(game, t('err.notFood'))
      if (foodCount(game, foodId) < 1) return fail(game, t('err.outOf', { item: itemName(food) }))
      if (s.hunger < THRESHOLDS.feedMinHunger) return fail(game, messageFor('notHungry'))
      stats.hunger -= food.food.hunger
      stats.happiness += food.food.happiness
      if (foodId !== FREE_FOOD_ID) {
        const left = (inventory[foodId] ?? 0) - 1
        inventory = { ...inventory }
        if (left > 0) inventory[foodId] = left
        else delete inventory[foodId]
      }
      message = messageFor('feed')
      break
    }
    case 'pet': {
      stats.happiness += cfg.happiness ?? 0
      if (s.happiness >= THRESHOLDS.petRewardMaxHappiness) {
        rewardXp = 0
        message = messageFor('petContent')
      } else message = messageFor('pet', game.affection)
      break
    }
    case 'play': {
      if (s.energy < THRESHOLDS.playMinEnergy) return fail(game, messageFor('tooTiredToPlay'))
      stats.happiness += Math.round((cfg.happiness ?? 0) * bestToyBonus(game))
      stats.energy += cfg.energy ?? 0
      stats.hunger += cfg.hunger ?? 0
      stats.cleanliness += cfg.cleanliness ?? 0
      message = messageFor('play')
      break
    }
    case 'sleep': {
      if (s.energy > THRESHOLDS.sleepMaxEnergy) return fail(game, messageFor('notSleepy'))
      stats.energy += (cfg.energy ?? 0) + equippedBedBonus(game)
      stats.hunger += cfg.hunger ?? 0
      stats.happiness += cfg.happiness ?? 0
      message = messageFor('sleep')
      break
    }
    case 'groom': {
      if (s.cleanliness > THRESHOLDS.groomMaxCleanliness) return fail(game, messageFor('alreadyClean'))
      stats.cleanliness += cfg.cleanliness ?? 0
      stats.happiness += cfg.happiness ?? 0
      message = messageFor('groom')
      break
    }
    case 'litter': {
      if (game.litter < LITTER.minToClean) return fail(game, messageFor('litterClean'))
      litter = 0
      stats.happiness += cfg.happiness ?? 0
      message = messageFor('litter')
      break
    }
  }

  let g: Game = {
    ...game,
    stats: clampStats(stats),
    inventory,
    litter,
    counters: { ...game.counters, [COUNTER_FOR[action]]: game.counters[COUNTER_FOR[action]] + 1 },
  }
  g = bumpMetric(g, action, 1)
  let wishGranted = false
  if (game.wish === action) {
    wishGranted = true
    g = {
      ...g,
      wish: pickWish(g, now, action),
      counters: { ...g.counters, wishes: g.counters.wishes + 1 },
    }
    rewardXp += WISH_REWARD.xp
    rewardCoins += WISH_REWARD.coins
  }
  if (wishGranted) g = bumpMetric(g, 'wish', 1)
  const out = grantRewards(
    g,
    { xp: rewardXp, coins: rewardCoins, affection: cfg.affection + (wishGranted ? WISH_REWARD.affection : 0) },
    now,
  )
  return {
    game: out.game,
    ok: true,
    wishGranted,
    message,
    activity: ACTIVITY_FOR[action],
    xpGained: rewardXp,
    coinsGained: rewardCoins,
    levelUps: out.levelUps,
    newAchievements: out.newAchievements,
  }
}

/* ---------- Shop & inventory ---------- */

export type ShopResult = { ok: true; game: Game; message: string } | { ok: false; game: Game; message: string }

export function purchase(game: Game, itemId: string): ShopResult {
  const item = getItem(itemId)
  if (!item || item.unlimited) return { ok: false, game, message: t('shop.notForSale') }
  if (game.level < item.minLevel) return { ok: false, game, message: t('shop.lockedMsg', { n: item.minLevel }) }
  const owned = game.inventory[itemId] ?? 0
  if (item.category !== 'food' && owned > 0) return { ok: false, game, message: t('shop.alreadyOwn') }
  if (game.coins < item.price) return { ok: false, game, message: t('shop.poor') }
  const equipped = { ...game.equipped }
  if (item.slot && item.category !== 'food') equipped[item.slot] = item.id
  const g: Game = {
    ...game,
    coins: game.coins - item.price,
    inventory: { ...game.inventory, [itemId]: owned + 1 },
    equipped,
  }
  const suffix = item.slot ? t('shop.equippedSuffix') : ''
  return { ok: true, game: g, message: t('shop.bought', { item: itemName(item) }) + suffix }
}

export function equip(game: Game, itemId: string): Game {
  const item = getItem(itemId)
  if (!item?.slot || (game.inventory[itemId] ?? 0) < 1) return game
  return { ...game, equipped: { ...game.equipped, [item.slot]: itemId } }
}

export function unequip(game: Game, slot: EquipSlot): Game {
  if (!game.equipped[slot]) return game
  const equipped = { ...game.equipped }
  delete equipped[slot]
  return { ...game, equipped }
}

/* ---------- Quests ---------- */

export function claimQuest(
  game: Game,
  questId: string,
  now: number,
): { game: Game; ok: boolean; xp: number; coins: number; levelUps: number[]; newAchievements: string[] } {
  const entry = game.quests.items.find((q) => q.id === questId)
  const tpl = getTemplate(questId)
  if (!entry || !tpl || entry.claimed || !isQuestComplete(entry)) {
    return { game, ok: false, xp: 0, coins: 0, levelUps: [], newAchievements: [] }
  }
  const marked: Game = {
    ...game,
    quests: {
      ...game.quests,
      items: game.quests.items.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
    },
    counters: { ...game.counters, questsClaimed: game.counters.questsClaimed + 1 },
  }
  const out = grantRewards(marked, { xp: tpl.rewardXp, coins: tpl.rewardCoins, affection: 1 }, now)
  return { game: out.game, ok: true, xp: tpl.rewardXp, coins: tpl.rewardCoins, levelUps: out.levelUps, newAchievements: out.newAchievements }
}

/* ---------- Mini-game ---------- */

export function minigameRewards(score: number): { coins: number; xp: number } {
  const s = Math.max(0, Math.floor(score))
  return {
    coins: Math.min(MINIGAME.maxCoins, Math.round(s * MINIGAME.coinsPerPoint)),
    xp: Math.min(MINIGAME.maxXp, Math.round(s * MINIGAME.xpPerPoint)),
  }
}

export function finishMinigame(game: Game, score: number, now: number): ActionResult {
  const rewards = minigameRewards(score)
  const stats = clampStats({
    ...game.stats,
    energy: game.stats.energy - MINIGAME.energyCost,
    happiness: game.stats.happiness + MINIGAME.happinessGain,
    hunger: game.stats.hunger + 4,
  })
  let g: Game = {
    ...game,
    stats,
    counters: {
      ...game.counters,
      minigames: game.counters.minigames + 1,
      bestScore: Math.max(game.counters.bestScore, Math.floor(score)),
    },
  }
  g = bumpMetric(g, 'minigame', 1)
  const out = grantRewards(g, { ...rewards, affection: 1 }, now)
  return {
    game: out.game,
    ok: true,
    message: messageFor('minigame'),
    activity: 'playing',
    xpGained: rewards.xp,
    coinsGained: rewards.coins,
    levelUps: out.levelUps,
    newAchievements: out.newAchievements,
  }
}

export type { StatKey }
