export type StatKey = 'hunger' | 'happiness' | 'energy' | 'cleanliness'
/** hunger: 0 = full, 100 = starving. All other stats: 100 = best. */
export type Stats = Record<StatKey, number>

export type ActionId = 'feed' | 'pet' | 'play' | 'sleep' | 'groom' | 'litter'
export type Activity = 'eating' | 'playing' | 'sleeping' | 'petted' | 'grooming'
export type CatMood =
  | 'idle'
  | 'happy'
  | 'hungry'
  | 'sleepy'
  | 'playing'
  | 'eating'
  | 'sleeping'
  | 'sad'

export type ItemCategory = 'food' | 'toy' | 'accessory' | 'decoration' | 'bed'
export type EquipSlot =
  | 'hat'
  | 'collar'
  | 'wallpaper'
  | 'floor'
  | 'window'
  | 'shelf'
  | 'bed'

export interface ItemDef {
  id: string
  name: string
  category: ItemCategory
  description: string
  price: number
  minLevel: number
  slot?: EquipSlot
  /** Food effect: hunger is reduced, happiness is added. */
  food?: { hunger: number; happiness: number }
  /** Multiplier applied to happiness gained while playing. */
  toyBonus?: number
  /** Extra energy restored when sleeping. */
  bedBonus?: number
  /** Not listed in the shop, always available (e.g. plain kibble). */
  unlimited?: boolean
  /** Granted at the start of a new game. */
  starter?: boolean
}

export type QuestMetric =
  | 'pet'
  | 'feed'
  | 'play'
  | 'sleep'
  | 'groom'
  | 'litter'
  | 'wish'
  | 'xp'
  | 'minigame'
  | 'coins'

export interface QuestTemplate {
  id: string
  title: string
  metric: QuestMetric
  target: number
  rewardXp: number
  rewardCoins: number
}

export interface QuestProgress {
  id: string
  progress: number
  claimed: boolean
}

export interface DailyQuests {
  /** Local calendar day, YYYY-MM-DD */
  date: string
  items: QuestProgress[]
}

export interface Counters {
  feeds: number
  pets: number
  plays: number
  sleeps: number
  grooms: number
  litters: number
  wishes: number
  minigames: number
  bestScore: number
  coinsEarned: number
  questsClaimed: number
}

export interface Game {
  version: number
  adopted: boolean
  name: string
  createdAt: number
  lastSimulated: number
  /** While true, time does not change the pet's needs. */
  snoozed: boolean
  stats: Stats
  /** Litter box mess: 0 = spotless, 100 = very dirty. */
  litter: number
  /** What the kitty currently hopes for. Fulfilling it gives a bonus. */
  wish: ActionId | null
  level: number
  xp: number
  coins: number
  affection: number
  inventory: Record<string, number>
  equipped: Partial<Record<EquipSlot, string>>
  quests: DailyQuests
  achievements: Record<string, number>
  counters: Counters
}

export interface ActionResult {
  game: Game
  ok: boolean
  wishGranted?: boolean
  message: string
  activity: Activity | null
  xpGained: number
  coinsGained: number
  levelUps: number[]
  newAchievements: string[]
}
