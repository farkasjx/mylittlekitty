import { motion } from 'framer-motion'
import { t } from '../../i18n'

export type Tab = 'home' | 'shop' | 'inventory' | 'room' | 'quests' | 'profile'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'nav.home', icon: '🏠' },
  { id: 'shop', label: 'nav.shop', icon: '🛍️' },
  { id: 'inventory', label: 'nav.inventory', icon: '🎒' },
  { id: 'room', label: 'nav.room', icon: '🛋️' },
  { id: 'quests', label: 'nav.quests', icon: '📋' },
  { id: 'profile', label: 'nav.profile', icon: '🐾' },
]

export function BottomNav({ tab, onChange, badge }: { tab: Tab; onChange: (t: Tab) => void; badge: Partial<Record<Tab, boolean>> }) {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <ul className="flex w-full max-w-md justify-between gap-1 rounded-3xl bg-white/90 p-1.5 shadow-soft backdrop-blur">
        {TABS.map((item) => {
          const active = tab === item.id
          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onChange(item.id)}
                aria-current={active ? 'page' : undefined}
                className="relative flex w-full flex-col items-center rounded-2xl py-1.5 text-[11px] font-bold"
              >
                {active && (
                  <motion.span layoutId="navpill" className="absolute inset-0 rounded-2xl bg-peach" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative text-xl leading-none" aria-hidden>
                  {item.icon}
                </span>
                <span className={`relative mt-0.5 ${active ? 'text-cocoa' : 'text-cocoa-soft'}`}>{t(item.label)}</span>
                {badge[item.id] && <span className="absolute right-3 top-1 h-2.5 w-2.5 rounded-full bg-rose ring-2 ring-white" />}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
