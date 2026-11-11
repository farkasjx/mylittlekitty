import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '../../i18n'
import { MINIGAME } from '../../game/config'
import { minigameRewards } from '../../game/mechanics'
import {
  BASKET,
  FIELD,
  initialMiniState,
  isMiniOver,
  moveBasket,
  stepMini,
  type MiniState,
} from '../../game/minigame'
import { useGame } from '../../store/useGame'
import { Button, Card, CoinIcon } from '../ui/Primitives'

type Phase = 'ready' | 'playing' | 'result'

function draw(ctx: CanvasRenderingContext2D, s: MiniState) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height)
  const sky = ctx.createLinearGradient(0, 0, 0, FIELD.height)
  sky.addColorStop(0, '#ffe9f0')
  sky.addColorStop(1, '#ffe0c9')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, FIELD.width, FIELD.height)

  for (const b of s.balls) {
    ctx.beginPath()
    ctx.fillStyle = b.color
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,.7)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r * 0.6, 0.3, 2.4)
    ctx.arc(b.x, b.y, b.r * 0.3, 3.4, 5.6)
    ctx.stroke()
    ctx.strokeStyle = b.color
    ctx.beginPath()
    ctx.moveTo(b.x + b.r * 0.6, b.y - b.r * 0.6)
    ctx.quadraticCurveTo(b.x + b.r * 1.6, b.y - b.r * 1.4, b.x + b.r * 2, b.y - b.r * 0.6)
    ctx.stroke()
  }

  // Cat-paw basket
  const bx = s.basketX - BASKET.width / 2
  ctx.fillStyle = '#f6b26b'
  ctx.beginPath()
  ctx.roundRect(bx, BASKET.y, BASKET.width, BASKET.height + 16, [6, 6, 18, 18])
  ctx.fill()
  ctx.fillStyle = '#ffe6c7'
  ctx.beginPath()
  ctx.roundRect(bx + 6, BASKET.y + 4, BASKET.width - 12, 8, 4)
  ctx.fill()
  ctx.fillStyle = '#f48fa8'
  for (const dx of [-18, -6, 6, 18]) {
    ctx.beginPath()
    ctx.arc(s.basketX + dx, BASKET.y + 26, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function MiniGameScreen({ onExit }: { onExit: () => void }) {
  const completeMinigame = useGame((s) => s.completeMinigame)
  const best = useGame((s) => s.game.counters.bestScore)
  const [phase, setPhase] = useState<Phase>('ready')
  const [hud, setHud] = useState({ score: 0, time: MINIGAME.durationMs / 1000 })
  const [result, setResult] = useState<{ score: number; coins: number; xp: number; record: boolean } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<MiniState>(initialMiniState())
  const frameRef = useRef(0)
  const keysRef = useRef({ left: false, right: false })

  const finish = useCallback(
    (score: number) => {
      const record = score > best
      const rewards = minigameRewards(score)
      completeMinigame(score)
      setResult({ score, ...rewards, record })
      setPhase('result')
    },
    [best, completeMinigame],
  )

  const start = () => {
    stateRef.current = initialMiniState()
    setHud({ score: 0, time: MINIGAME.durationMs / 1000 })
    setPhase('playing')
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let last = performance.now()
    let lastHud = -1

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      let s = stateRef.current
      const dir = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0)
      if (dir) s = moveBasket(s, s.basketX + dir * 380 * dt)
      s = stepMini(s, dt)
      stateRef.current = s
      draw(ctx, s)
      const remaining = Math.max(0, Math.ceil(MINIGAME.durationMs / 1000 - s.elapsed))
      const key = s.score * 100 + remaining
      if (key !== lastHud) {
        lastHud = key
        setHud({ score: s.score, time: remaining })
      }
      if (isMiniOver(s)) {
        finish(s.score)
        return
      }
      frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [phase, finish])

  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = v
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = v
    }
    const down = (e: KeyboardEvent) => set(e, true)
    const up = (e: KeyboardEvent) => set(e, false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * FIELD.width
    stateRef.current = moveBasket(stateRef.current, x)
    if (phase !== 'playing') draw(e.currentTarget.getContext('2d')!, stateRef.current)
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && phase === 'ready') draw(ctx, initialMiniState())
  }, [phase])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button variant="soft" onClick={onExit} className="!py-2">{t('common.back')}</Button>
        <div className="flex gap-2 text-sm font-extrabold">
          <span className="rounded-2xl bg-white px-3 py-1.5 shadow-pop">{t('mg.score', { n: hud.score })}</span>
          <span className="rounded-2xl bg-white px-3 py-1.5 shadow-pop">⏱ {hud.time}s</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] shadow-soft ring-4 ring-white">
        <canvas
          ref={canvasRef}
          width={FIELD.width}
          height={FIELD.height}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          className="block w-full touch-none"
          aria-label={t('mg.name')}
        />

        {phase === 'ready' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 p-6 text-center backdrop-blur-sm">
            <h2 className="text-3xl font-black text-rose-deep">{t('mg.name')}</h2>
            <p className="text-sm font-bold">{t('mg.instructions')}</p>
            <p className="text-xs text-cocoa-soft">{t('mg.meta', { n: best })}</p>
            <Button onClick={start} className="px-8 py-3 text-base">{t('mg.start')}</Button>
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-white/75 p-5 backdrop-blur-sm">
            <Card className="w-full text-center">
              <h2 className="text-2xl font-black">{result.record ? t('mg.record') : t('mg.timeUp')}</h2>
              <div className="my-2 text-5xl font-black text-rose-deep">{result.score}</div>
              <div className="flex justify-center gap-4 text-sm font-extrabold">
                <span>+{result.xp} XP</span>
                <span className="inline-flex items-center gap-1">+{result.coins} <CoinIcon /></span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="soft" className="flex-1" onClick={onExit}>{t('common.home')}</Button>
                <Button className="flex-1" onClick={start}>{t('mg.again')}</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
