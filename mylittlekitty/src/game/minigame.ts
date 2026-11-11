import { MINIGAME } from './config'

export const FIELD = { width: 360, height: 480 }
export const BASKET = { width: 76, height: 22, y: FIELD.height - 52 }

export interface Ball {
  id: number
  x: number
  y: number
  r: number
  vy: number
  points: number
  color: string
}

export interface MiniState {
  balls: Ball[]
  basketX: number
  score: number
  caught: number
  missed: number
  elapsed: number
  nextSpawn: number
  nextId: number
}

export const initialMiniState = (): MiniState => ({
  balls: [],
  basketX: FIELD.width / 2,
  score: 0,
  caught: 0,
  missed: 0,
  elapsed: 0,
  nextSpawn: 0.4,
  nextId: 1,
})

const COLORS = ['#f48fa8', '#7ecbb4', '#8fb8f4', '#f6c46b']

/** Injectable RNG keeps the simulation testable. */
export function spawnBall(state: MiniState, rand: () => number): Ball {
  const golden = rand() < 0.12
  const r = golden ? 14 : 12 + rand() * 4
  return {
    id: state.nextId,
    x: r + rand() * (FIELD.width - 2 * r),
    y: -r,
    r,
    vy: (golden ? 190 : 120) + rand() * 60 + state.elapsed * 3,
    points: golden ? 3 : 1,
    color: golden ? '#f2b705' : COLORS[Math.floor(rand() * COLORS.length)],
  }
}

export function stepMini(state: MiniState, dt: number, rand: () => number = Math.random): MiniState {
  if (state.elapsed >= MINIGAME.durationMs / 1000) return state
  const elapsed = state.elapsed + dt
  let { score, caught, missed, nextSpawn, nextId } = state
  const balls: Ball[] = []

  for (const b of state.balls) {
    const moved = { ...b, y: b.y + b.vy * dt }
    const withinBasket =
      Math.abs(moved.x - state.basketX) <= BASKET.width / 2 + moved.r * 0.5 &&
      moved.y + moved.r >= BASKET.y &&
      moved.y - moved.r <= BASKET.y + BASKET.height
    if (withinBasket) {
      score += moved.points
      caught += 1
    } else if (moved.y - moved.r > FIELD.height) {
      missed += 1
    } else balls.push(moved)
  }

  nextSpawn -= dt
  const interval = Math.max(0.45, 0.95 - elapsed * 0.015)
  const draft = { ...state, elapsed, nextId }
  while (nextSpawn <= 0) {
    balls.push(spawnBall(draft, rand))
    nextId += 1
    draft.nextId = nextId
    nextSpawn += interval
  }

  return { ...state, balls, score, caught, missed, elapsed, nextSpawn, nextId }
}

export const moveBasket = (state: MiniState, x: number): MiniState => ({
  ...state,
  basketX: Math.min(FIELD.width - BASKET.width / 2, Math.max(BASKET.width / 2, x)),
})

export const isMiniOver = (state: MiniState): boolean =>
  state.elapsed >= MINIGAME.durationMs / 1000
