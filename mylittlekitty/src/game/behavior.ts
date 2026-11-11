import { BOND_THRESHOLDS, HUNGRY_THRESHOLD } from './config'
import { t } from '../i18n'
import type { Activity, CatMood, Stats } from './types'

/** Decides how the kitty looks based on what it is doing and how it feels. */
export function deriveMood(stats: Stats, activity: Activity | null): CatMood {
  if (activity === 'sleeping') return 'sleeping'
  if (activity === 'eating') return 'eating'
  if (activity === 'playing') return 'playing'
  if (activity === 'petted' || activity === 'grooming') return 'happy'
  if (stats.happiness < 25 || (stats.hunger > 90 && stats.happiness < 45)) return 'sad'
  if (stats.hunger >= HUNGRY_THRESHOLD) return 'hungry'
  if (stats.energy < 25) return 'sleepy'
  if (stats.happiness >= 75 && stats.hunger < 50) return 'happy'
  return 'idle'
}

export const idleMessage = (mood: CatMood): string => t(`idle.${mood}`)

export function bondLevel(affection: number): { index: number; title: string; next: number | null } {
  let index = 0
  BOND_THRESHOLDS.forEach((threshold, i) => {
    if (affection >= threshold) index = i
  })
  return { index, title: t(`bond.${index}`), next: BOND_THRESHOLDS[index + 1] ?? null }
}
