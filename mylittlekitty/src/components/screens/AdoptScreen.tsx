import { motion } from 'framer-motion'
import { useState } from 'react'
import { t } from '../../i18n'
import { Cat } from '../cat/Cat'
import { Button } from '../ui/Primitives'

const SUGGESTIONS = ['Mochi', 'Biscuit', 'Luna', 'Pumpkin', 'Miso', 'Peaches']

export function AdoptScreen({ onAdopt }: { onAdopt: (name: string) => void }) {
  const [name, setName] = useState('')
  const clean = name.trim()

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-5 px-5 py-8 text-center">
      <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-black tracking-tight text-rose-deep">
        My Little Kitty
      </motion.h1>
      <p className="text-cocoa-soft">{t('adopt.tagline')}</p>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="aspect-square w-64 rounded-[3rem] bg-white/80 p-4 shadow-soft"
      >
        <svg viewBox="10 10 180 200" className="h-full w-full">
          <Cat mood="happy" />
        </svg>
      </motion.div>
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (clean) onAdopt(clean)
        }}
      >
        <label className="text-left text-sm font-extrabold" htmlFor="kitten-name">
          {t('adopt.label')}
        </label>
        <input
          id="kitten-name"
          value={name}
          maxLength={16}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          placeholder={t('adopt.placeholder')}
          className="rounded-2xl border-0 bg-white px-4 py-3 text-lg font-bold shadow-soft placeholder:text-cocoa-soft/50"
        />
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => setName(s)} className="rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold shadow-pop">
              {s}
            </button>
          ))}
        </div>
        <Button disabled={!clean} className="py-3.5 text-base">
          {clean ? t('adopt.button', { name: clean }) : t('adopt.buttonEmpty')}
        </Button>
      </form>
    </div>
  )
}
