import type { ActionId, StatKey } from './types'

export const SAVE_VERSION = 1
export const SAVE_KEY = 'mylittlekitty.save'
export const STAT_MAX = 100
export const STAT_MIN = 0

/** Per-hour change while time passes. Hunger rises, the rest fall. */
export const DECAY_PER_HOUR: Record<StatKey, number> = {
  hunger: 5,
  happiness: 3,
  energy: 3,
  cleanliness: 2,
}

export const OFFLINE = {
  /** Hours counted at the full rate before the gentler away-rate applies. */
  fullRateHours: 1,
  /** Multiplier on decay for time beyond fullRateHours. */
  awayRate: 0.5,
  /** Never simulate more than this many hours at once. */
  maxHours: 48,
  /** Time away can push stats only this far. The kitty never reaches 0. */
  floors: { hunger: 85, happiness: 15, energy: 15, cleanliness: 15 } as Record<StatKey, number>,
}

/** Extra happiness loss multiplier while very hungry. */
export const HUNGRY_THRESHOLD = 70
export const HUNGRY_HAPPINESS_PENALTY = 1.5

export interface ActionConfig {
  hunger?: number
  happiness?: number
  energy?: number
  cleanliness?: number
  xp: number
  coins: number
  affection: number
  /** Action is refused when this condition says the cat doesn't need it. */
  activityMs: number
}

export const ACTIONS: Record<ActionId, ActionConfig> = {
  feed: { xp: 6, coins: 1, affection: 1, activityMs: 2200 },
  pet: { happiness: 7, xp: 3, coins: 0, affection: 2, activityMs: 1800 },
  play: {
    happiness: 16,
    energy: -12,
    hunger: 6,
    cleanliness: -3,
    xp: 9,
    coins: 3,
    affection: 1,
    activityMs: 2600,
  },
  sleep: { energy: 45, hunger: 8, happiness: 2, xp: 5, coins: 1, affection: 0, activityMs: 5000 },
  groom: { cleanliness: 40, happiness: 4, xp: 6, coins: 2, affection: 1, activityMs: 2400 },
  litter: { happiness: 3, xp: 7, coins: 4, affection: 1, activityMs: 2200 },
}

/** Litter box rules. A messy box makes the kitty a little less happy, never ill. */
export const LITTER = {
  perHour: 3,
  perMeal: 8,
  offlineCeiling: 85,
  messyThreshold: 70,
  messyHappinessPenalty: 1.3,
  minToClean: 15,
  startValue: 20,
}

/** Bonus for fulfilling what the kitty wished for. */
export const WISH_REWARD = { xp: 10, coins: 8, affection: 3 }

/** Rules that stop pointless farming of rewards. */
export const THRESHOLDS = {
  feedMinHunger: 15,
  playMinEnergy: 15,
  sleepMaxEnergy: 85,
  groomMaxCleanliness: 90,
  petRewardMaxHappiness: 95,
}

export const FREE_FOOD_ID = 'food_kibble'

export const levelXpRequired = (level: number): number => 40 + 20 * level
export const levelUpCoins = (level: number): number => 15 * level
export const BOND_THRESHOLDS = [0, 25, 75, 150, 300]
export const BOND_TITLES = ['Shy', 'Curious', 'Friendly', 'Loving', 'Best Friends']

export const QUESTS_PER_DAY = 5

export const MINIGAME = {
  durationMs: 30_000,
  energyCost: 8,
  happinessGain: 10,
  /** Rewards derived from score. */
  coinsPerPoint: 0.6,
  xpPerPoint: 1.2,
  maxCoins: 60,
  maxXp: 100,
}
