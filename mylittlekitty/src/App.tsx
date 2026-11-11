import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useEffect, useState } from 'react'
import { useLang } from './i18n'
import { isQuestComplete } from './game/quests'
import { useGame } from './store/useGame'
import { AdoptScreen } from './components/screens/AdoptScreen'
import { HomeScreen } from './components/screens/HomeScreen'
import { InventoryScreen } from './components/screens/InventoryScreen'
import { MiniGameScreen } from './components/screens/MiniGameScreen'
import { ProfileScreen } from './components/screens/ProfileScreen'
import { QuestsScreen } from './components/screens/QuestsScreen'
import { RoomScreen } from './components/screens/RoomScreen'
import { ShopScreen } from './components/screens/ShopScreen'
import { BottomNav, type Tab } from './components/ui/BottomNav'
import { HelpModal } from './components/ui/HelpModal'
import { TopControls } from './components/ui/TopControls'
import { Toast } from './components/ui/Toast'

const TICK_MS = 30_000

export default function App() {
  const lang = useLang((s) => s.lang)
  const [helpOpen, setHelpOpen] = useState(false)
  const adopted = useGame((s) => s.game.adopted)
  const quests = useGame((s) => s.game.quests)
  const adopt = useGame((s) => s.adopt)
  const tick = useGame((s) => s.tick)
  const [tab, setTab] = useState<Tab>('home')
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const id = setInterval(tick, TICK_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [tick])

  const help = <AnimatePresence>{helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}</AnimatePresence>

  if (!adopted) {
    return (
      <Fragment key={lang}>
        <Toast />
        <div className="mx-auto w-full max-w-md px-3 pt-3">
          <TopControls onHelp={() => setHelpOpen(true)} />
        </div>
        <AdoptScreen onAdopt={adopt} />
        {help}
      </Fragment>
    )
  }

  const claimable = quests.items.some((q) => !q.claimed && isQuestComplete(q))
  const screen = playing ? (
    <MiniGameScreen onExit={() => setPlaying(false)} />
  ) : tab === 'home' ? (
    <HomeScreen onMinigame={() => setPlaying(true)} />
  ) : tab === 'shop' ? (
    <ShopScreen />
  ) : tab === 'inventory' ? (
    <InventoryScreen />
  ) : tab === 'room' ? (
    <RoomScreen onNavigate={setTab} />
  ) : tab === 'quests' ? (
    <QuestsScreen />
  ) : (
    <ProfileScreen />
  )

  return (
    <div key={lang} className="mx-auto min-h-full w-full max-w-md px-3 pb-28 pt-3">
      <Toast />
      {!playing && <TopControls onHelp={() => setHelpOpen(true)} />}
      <AnimatePresence mode="wait">
        <motion.main
          key={playing ? 'mini' : tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {screen}
        </motion.main>
      </AnimatePresence>
      {!playing && <BottomNav tab={tab} onChange={setTab} badge={{ quests: claimable }} />}
      {help}
    </div>
  )
}
