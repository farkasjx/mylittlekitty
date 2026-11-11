import { getItem } from './items'
import type { Counters, Game } from './types'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  rewardCoins: number
  check: (g: Game) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_meal', name: 'First Meal', description: 'Feed your kitty for the first time.', icon: '🍽️', rewardCoins: 5, check: (g) => g.counters.feeds >= 1 },
  { id: 'cuddler', name: 'Cuddle Bug', description: 'Pet your kitty 25 times.', icon: '💗', rewardCoins: 15, check: (g) => g.counters.pets >= 25 },
  { id: 'playful', name: 'Playful Paws', description: 'Play 10 times.', icon: '🧶', rewardCoins: 15, check: (g) => g.counters.plays >= 10 },
  { id: 'sleepyhead', name: 'Sleepyhead', description: 'Tuck your kitty in 5 times.', icon: '🌙', rewardCoins: 10, check: (g) => g.counters.sleeps >= 5 },
  { id: 'squeaky_clean', name: 'Squeaky Clean', description: 'Groom your kitty 5 times.', icon: '🫧', rewardCoins: 10, check: (g) => g.counters.grooms >= 5 },
  { id: 'level3', name: 'Growing Up', description: 'Reach level 3.', icon: '🌱', rewardCoins: 20, check: (g) => g.level >= 3 },
  { id: 'level5', name: 'Little Star', description: 'Reach level 5.', icon: '⭐', rewardCoins: 40, check: (g) => g.level >= 5 },
  { id: 'yarn_pro', name: 'Yarn Catcher', description: 'Score 25 in Yarn Catch.', icon: '🏆', rewardCoins: 25, check: (g) => g.counters.bestScore >= 25 },
  { id: 'saver', name: 'Piggy Bank', description: 'Earn 200 coins in total.', icon: '🪙', rewardCoins: 20, check: (g) => g.counters.coinsEarned >= 200 },
  { id: 'friends', name: 'Best Friends', description: 'Reach 300 affection.', icon: '🏠', rewardCoins: 50, check: (g) => g.affection >= 300 },
  { id: 'decorator', name: 'Interior Designer', description: 'Own 6 shop items.', icon: '🛋️', rewardCoins: 25, check: (g) => Object.keys(g.inventory).filter((id) => { const i = getItem(id); return !!i && !i.starter && !i.unlimited }).length >= 6 },
  { id: 'collector', name: 'Collector', description: 'Own 12 shop items.', icon: '🎁', rewardCoins: 40, check: (g) => Object.keys(g.inventory).filter((id) => { const i = getItem(id); return !!i && !i.starter && !i.unlimited }).length >= 12 },
  { id: 'scooper', name: 'Litter Hero', description: 'Clean the litter box 10 times.', icon: '🧹', rewardCoins: 20, check: (g) => g.counters.litters >= 10 },
  { id: 'wishmaker', name: 'Wish Granter', description: 'Fulfil 10 kitty wishes.', icon: '🌟', rewardCoins: 30, check: (g) => g.counters.wishes >= 10 },
  { id: 'quester', name: 'Daily Routine', description: 'Claim 5 quest rewards.', icon: '📋', rewardCoins: 20, check: (g) => g.counters.questsClaimed >= 5 },
]

export const emptyCounters = (): Counters => ({
  feeds: 0,
  pets: 0,
  plays: 0,
  sleeps: 0,
  grooms: 0,
  litters: 0,
  wishes: 0,
  minigames: 0,
  bestScore: 0,
  coinsEarned: 0,
  questsClaimed: 0,
})
