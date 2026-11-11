import { QUESTS_PER_DAY } from './config'
import type { DailyQuests, QuestMetric, QuestProgress, QuestTemplate } from './types'

export const QUEST_TEMPLATES: QuestTemplate[] = [
  { id: 'pet3', title: 'Pet the kitty 3 times', metric: 'pet', target: 3, rewardXp: 15, rewardCoins: 10 },
  { id: 'feed1', title: 'Feed the kitty', metric: 'feed', target: 1, rewardXp: 10, rewardCoins: 8 },
  { id: 'feed2', title: 'Serve 2 meals', metric: 'feed', target: 2, rewardXp: 16, rewardCoins: 12 },
  { id: 'play2', title: 'Play with the kitty twice', metric: 'play', target: 2, rewardXp: 20, rewardCoins: 12 },
  { id: 'xp30', title: 'Earn 30 XP', metric: 'xp', target: 30, rewardXp: 15, rewardCoins: 15 },
  { id: 'groom1', title: 'Brush the kitty', metric: 'groom', target: 1, rewardXp: 12, rewardCoins: 10 },
  { id: 'sleep1', title: 'Tuck the kitty in for a nap', metric: 'sleep', target: 1, rewardXp: 12, rewardCoins: 10 },
  { id: 'mini1', title: 'Play Yarn Catch', metric: 'minigame', target: 1, rewardXp: 20, rewardCoins: 15 },
  { id: 'pet6', title: 'Pet the kitty 6 times', metric: 'pet', target: 6, rewardXp: 25, rewardCoins: 15 },
  { id: 'play4', title: 'Play with the kitty 4 times', metric: 'play', target: 4, rewardXp: 35, rewardCoins: 20 },
  { id: 'xp60', title: 'Earn 60 XP', metric: 'xp', target: 60, rewardXp: 25, rewardCoins: 25 },
  { id: 'mini2', title: 'Play Yarn Catch twice', metric: 'minigame', target: 2, rewardXp: 35, rewardCoins: 25 },
  { id: 'coins80', title: 'Earn 80 coins', metric: 'coins', target: 80, rewardXp: 25, rewardCoins: 20 },
  { id: 'litter1', title: 'Clean the litter box', metric: 'litter', target: 1, rewardXp: 12, rewardCoins: 10 },
  { id: 'wish2', title: 'Grant 2 wishes', metric: 'wish', target: 2, rewardXp: 25, rewardCoins: 20 },
  { id: 'coins40', title: 'Earn 40 coins', metric: 'coins', target: 40, rewardXp: 15, rewardCoins: 10 },
]

export const getTemplate = (id: string): QuestTemplate | undefined =>
  QUEST_TEMPLATES.find((q) => q.id === id)

/** Local calendar date key. */
export function dateKey(now: number): string {
  const d = new Date(now)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministic quest set for a given day; never repeats a template within a day. */
export function generateDailyQuests(date: string, count = QUESTS_PER_DAY): DailyQuests {
  const rand = mulberry32(hash(date))
  const pool = [...QUEST_TEMPLATES]
  const items: QuestProgress[] = []
  while (items.length < count && pool.length > 0) {
    const [picked] = pool.splice(Math.floor(rand() * pool.length), 1)
    items.push({ id: picked.id, progress: 0, claimed: false })
    // Avoid two quests on the same metric in one day.
    for (let i = pool.length - 1; i >= 0; i--) {
      if (pool[i].metric === picked.metric) pool.splice(i, 1)
    }
  }
  return { date, items }
}

export function ensureDailyQuests(quests: DailyQuests, now: number): DailyQuests {
  const today = dateKey(now)
  return quests.date === today && quests.items.length > 0 ? quests : generateDailyQuests(today)
}

export function addQuestProgress(
  quests: DailyQuests,
  metric: QuestMetric,
  amount: number,
): DailyQuests {
  if (amount <= 0) return quests
  return {
    ...quests,
    items: quests.items.map((q) => {
      const t = getTemplate(q.id)
      if (!t || t.metric !== metric || q.claimed) return q
      return { ...q, progress: Math.min(t.target, q.progress + amount) }
    }),
  }
}

export const isQuestComplete = (q: QuestProgress): boolean => {
  const t = getTemplate(q.id)
  return !!t && q.progress >= t.target
}
