import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useGame } from '../../store/useGame'

export function Toast() {
  const toast = useGame((s) => s.toast)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => {
      if (useGame.getState().toast?.id === toast.id) useGame.setState({ toast: null })
    }, 3200)
    return () => clearTimeout(t)
  }, [toast])

  const tone = toast?.kind === 'warn' ? 'bg-[#fff0d6] text-[#8a5a1f]' : toast?.kind === 'success' ? 'bg-[#e4f7ee] text-[#2f6b57]' : 'bg-white'
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`pointer-events-auto max-w-md rounded-2xl px-4 py-2.5 text-sm font-bold shadow-soft ${tone}`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
