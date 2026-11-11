import { motion } from 'framer-motion'
import { t, tList } from '../../i18n'
import { Button } from './Primitives'

const SECTIONS = [
  { id: 's1', icon: '🐱' },
  { id: 's2', icon: '🪙' },
  { id: 's3', icon: '🛍️' },
  { id: 's4', icon: '💡' },
] as const

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa/30 p-3 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t('help.title')}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl bg-cream p-4 shadow-soft"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-xl font-black text-rose-deep">{t('help.title')}</h2>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {SECTIONS.map((s) => (
            <section key={s.id} className="rounded-2xl bg-white p-3 shadow-pop">
              <h3 className="mb-1 text-sm font-extrabold">
                <span aria-hidden>{s.icon}</span> {t(`help.${s.id}.t`)}
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-xs leading-snug text-cocoa-soft">
                {tList(`help.${s.id}.b`).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <Button className="mt-3 w-full" onClick={onClose}>
          {t('common.close')}
        </Button>
      </motion.div>
    </motion.div>
  )
}
