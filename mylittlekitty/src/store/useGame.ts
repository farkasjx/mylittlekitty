import { create } from 'zustand'
import { t } from '../i18n'
import { achName } from '../i18n/content'
import { ACHIEVEMENTS } from '../game/achievements'
import { ACTIONS, levelUpCoins, WISH_REWARD } from '../game/config'
import { idleMessage, deriveMood } from '../game/behavior'
import {
  claimQuest,
  createEmptyGame,
  createNewGame,
  equip,
  finishMinigame,
  performAction,
  purchase,
  syncGame,
  unequip,
  unlockAchievements,
} from '../game/mechanics'
import { clearSave, loadGame, saveGame } from '../game/save'
import type { ActionId, ActionResult, Activity, EquipSlot, Game } from '../game/types'

export interface Toast {
  id: number
  text: string
  kind: 'info' | 'success' | 'warn'
}

interface GameStore {
  game: Game
  /** Transient animation state; never saved. */
  activity: Activity | null
  message: { id: number; text: string }
  toast: Toast | null

  adopt: (name: string) => void
  act: (action: ActionId, options?: { foodId?: string }) => boolean
  tick: () => void
  buy: (itemId: string) => boolean
  equipItem: (itemId: string) => void
  unequipSlot: (slot: EquipSlot) => void
  claim: (questId: string) => void
  completeMinigame: (score: number) => ActionResult
  say: (text: string) => void
  setSnooze: (on: boolean) => void
  resetGame: () => void
}

let seq = 1
let activityTimer: ReturnType<typeof setTimeout> | undefined

function initialGame(): Game {
  const now = Date.now()
  const loaded = loadGame(now)
  return loaded ? syncGame(loaded, now) : createEmptyGame(now)
}

function celebrate(result: Pick<ActionResult, 'levelUps' | 'newAchievements'>): Toast | null {
  const parts: string[] = []
  const last = result.levelUps[result.levelUps.length - 1]
  if (last !== undefined) {
    const bonus = result.levelUps.reduce((sum, l) => sum + levelUpCoins(l), 0)
    parts.push(t('toast.levelUp', { n: last, c: bonus }))
  }
  for (const id of result.newAchievements) {
    const a = ACHIEVEMENTS.find((x) => x.id === id)
    if (a) parts.push(t('toast.achievement', { icon: a.icon, name: achName(a), c: a.rewardCoins }))
  }
  return parts.length ? { id: seq++, text: parts.join('  •  '), kind: 'success' } : null
}

export const useGame = create<GameStore>((set, get) => {
  const setActivity = (activity: Activity, ms: number) => {
    clearTimeout(activityTimer)
    set({ activity })
    activityTimer = setTimeout(() => set({ activity: null }), ms)
  }

  return {
    game: initialGame(),
    activity: null,
    message: { id: 0, text: '' },
    toast: null,

    adopt: (name) => {
      const game = createNewGame(name, Date.now())
      set({
        game,
        message: { id: seq++, text: t('adopt.hello', { name: game.name }) },
      })
    },

    act: (action, options) => {
      if (!get().game.adopted || get().activity === 'sleeping') return false
      const now = Date.now()
      const synced = syncGame(get().game, now)
      const result = performAction(synced, action, now, options)
      if (!result.ok) {
        set({ game: synced, message: { id: seq++, text: result.message } })
        return false
      }
      const celebration = celebrate(result)
      const wishText = result.wishGranted ? t('toast.wish', { xp: WISH_REWARD.xp, coins: WISH_REWARD.coins }) : null
      const toast: Toast | null = wishText
        ? { id: seq++, text: celebration ? `${wishText}  •  ${celebration.text}` : wishText, kind: 'success' }
        : (celebration ?? get().toast)
      set({ game: result.game, message: { id: seq++, text: result.message }, toast })
      setActivity(result.activity ?? 'petted', ACTIONS[action].activityMs)
      return true
    },

    tick: () => {
      const { game } = get()
      if (!game.adopted) return
      const next = syncGame(game, Date.now())
      if (next !== game) set({ game: next })
    },

    buy: (itemId) => {
      const now = Date.now()
      const result = purchase(syncGame(get().game, now), itemId)
      if (!result.ok) {
        set({ game: result.game, toast: { id: seq++, text: result.message, kind: 'warn' } })
        return false
      }
      const { game, unlocked } = unlockAchievements(result.game, now)
      const extra = celebrate({ levelUps: [], newAchievements: unlocked })
      set({
        game,
        toast: { id: seq++, text: result.message + (extra ? '  •  ' + extra.text : ''), kind: 'success' },
      })
      return true
    },

    equipItem: (itemId) => set({ game: equip(get().game, itemId) }),
    unequipSlot: (slot) => set({ game: unequip(get().game, slot) }),

    claim: (questId) => {
      const now = Date.now()
      const out = claimQuest(syncGame(get().game, now), questId, now)
      if (!out.ok) return
      const extra = celebrate(out)
      set({
        game: out.game,
        toast: {
          id: seq++,
          text: `${t('toast.quest', { xp: out.xp, coins: out.coins })}${extra ? '  •  ' + extra.text : ''}`,
          kind: 'success',
        },
      })
    },

    completeMinigame: (score) => {
      const now = Date.now()
      const result = finishMinigame(syncGame(get().game, now), score, now)
      set({ game: result.game, toast: celebrate(result) ?? get().toast })
      return result
    },

    setSnooze: (on) => {
      const now = Date.now()
      const synced = syncGame(get().game, now)
      set({
        game: { ...synced, snoozed: on, lastSimulated: now },
        toast: { id: seq++, text: t(on ? 'snooze.toastOn' : 'snooze.toastOff'), kind: 'info' },
      })
    },

    say: (text) => set({ message: { id: seq++, text } }),

    resetGame: () => {
      clearTimeout(activityTimer)
      clearSave()
      set({ game: createEmptyGame(Date.now()), activity: null, toast: null, message: { id: seq++, text: '' } })
    },
  }
})

export const selectMood = (s: Pick<GameStore, 'game' | 'activity'>) =>
  deriveMood(s.game.stats, s.activity)

export const defaultMessage = (s: Pick<GameStore, 'game' | 'activity'>) => idleMessage(selectMood(s))

useGame.subscribe((state, prev) => {
  if (state.game !== prev.game && state.game.adopted) saveGame(state.game)
})
