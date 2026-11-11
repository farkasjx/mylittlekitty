import { tList } from '../i18n'

export type MessageKind =
  | 'feed'
  | 'pet'
  | 'petContent'
  | 'play'
  | 'sleep'
  | 'groom'
  | 'minigame'
  | 'notHungry'
  | 'notSleepy'
  | 'tooTiredToPlay'
  | 'alreadyClean'
  | 'litter'
  | 'litterClean'

const pick = (arr: string[]): string => arr[counter++ % arr.length]
let counter = 0

export function messageFor(kind: MessageKind, affection = 0): string {
  if (kind === 'pet') {
    const idx = affection >= 300 ? 4 : affection >= 150 ? 3 : affection >= 75 ? 2 : affection >= 25 ? 1 : 0
    return pick(tList(`m.pet${idx}`))
  }
  return pick(tList(`m.${kind}`))
}
