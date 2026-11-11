import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS } from '../game/achievements'
import { ITEMS } from '../game/items'
import { QUEST_TEMPLATES } from '../game/quests'
import { t, tList, useLang } from '../i18n'
import { en } from '../i18n/en'
import { hu } from '../i18n/hu'

describe('i18n', () => {
  it('hungarian has exactly the english keys', () => {
    expect(Object.keys(hu).sort()).toEqual(Object.keys(en).sort())
  })

  it('covers every item, quest and achievement', () => {
    const keys = new Set(Object.keys(hu))
    for (const i of ITEMS) expect(keys.has(`item.${i.id}.name`) && keys.has(`item.${i.id}.desc`)).toBe(true)
    for (const q of QUEST_TEMPLATES) expect(keys.has(`q.${q.id}`)).toBe(true)
    for (const a of ACHIEVEMENTS) expect(keys.has(`ach.${a.id}.name`) && keys.has(`ach.${a.id}.desc`)).toBe(true)
  })

  it('switches language, interpolates and falls back to the key', () => {
    useLang.getState().setLang('hu')
    expect(t('adopt.hello', { name: 'Mochi' })).toContain('Mochi')
    expect(t('nav.shop')).toBe('Bolt')
    expect(tList('help.s1.b').length).toBeGreaterThan(1)
    expect(t('does.not.exist')).toBe('does.not.exist')
    useLang.getState().setLang('en')
    expect(t('nav.shop')).toBe('Shop')
  })
})
