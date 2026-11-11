import { create } from 'zustand'
import { en } from './en'
import { hu } from './hu'

export type Lang = 'en' | 'hu'
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'hu', label: 'HU' },
]

const DICTS: Record<Lang, Record<string, string>> = { en, hu }
const LANG_KEY = 'mylittlekitty.lang'

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'hu') return stored
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('hu')) return 'hu'
  } catch {
    // storage unavailable (tests, private mode)
  }
  return 'en'
}

interface LangStore {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLang = create<LangStore>((set) => ({
  lang: detectLang(),
  setLang: (lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') document.documentElement.lang = lang
    set({ lang })
  },
}))

export function t(key: string, params?: Record<string, string | number>): string {
  const dict: Record<string, string> = DICTS[useLang.getState().lang]
  const raw = dict[key] ?? (en as Record<string, string>)[key] ?? key
  return params ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`)) : raw
}

/** Pipe-separated entries, used for message pools and help bullet lists. */
export const tList = (key: string): string[] => t(key).split('|')
