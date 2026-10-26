/**
 * Copied verbatim from the TrustKhaya app (lib/house.ts) — the same scoring
 * engine, house geometry and seed data that the real product runs.
 */
/**
 * The TrustKhaya house — the score, drawn as 100 bricks, one brick per
 * point. Foundation = stokvel (35), Walls = wallet (25), Roof = spaza
 * credit (20), Door = guarantor (20).
 *
 * This module is plain data + maths (no React) so the geometry can be
 * unit-tested: the brick counts MUST equal WEIGHTS, and there must be
 * exactly 100 bricks. Fill order per part is bottom-up, left-to-right,
 * which is what makes the house "build" the way a real one does.
 *
 * Colours live in lib/brand.ts (HOUSE). Rendering lives in
 * components/HouseScore.tsx.
 */

import { WEIGHTS } from './scoring'

export const HOUSE_VIEWBOX = { width: 400, height: 272 } as const

/** Brick progress per part, in fill order: [stokvel, wallet, spaza, guarantor]. */
export type HousePoints = [number, number, number, number]

export type HousePartIndex = 0 | 1 | 2 | 3

export interface HousePart {
  /** index into the HousePoints tuple */
  index: HousePartIndex
  key: 'stokvel' | 'wallet' | 'spaza' | 'guarantor'
  /** the building word used everywhere on screen */
  part: string
  /** the signal the part stands for */
  thing: string
  /** max points (and therefore max bricks) for this part */
  max: number
}

/** Part order is fixed: the house is built foundation -> walls -> roof -> door. */
export const HOUSE_PARTS: readonly HousePart[] = [
  { index: 0, key: 'stokvel', part: 'Foundation', thing: 'stokvel', max: WEIGHTS.stokvel },
  { index: 1, key: 'wallet', part: 'Walls', thing: 'wallet', max: WEIGHTS.wallet },
  { index: 2, key: 'spaza', part: 'Roof', thing: 'spaza credit', max: WEIGHTS.spaza },
  { index: 3, key: 'guarantor', part: 'Door', thing: 'guarantor', max: WEIGHTS.guarantor },
] as const

export interface Brick {
  x: number
  y: number
  w: number
  h: number
}

/** Foundation (stokvel, 35): 3 rows of 12/12/11, 27x13, from y=254 up. */
function foundationBricks(): Brick[] {
  const out: Brick[] = []
  const rows: Array<[number, number]> = [
    [254, 12],
    [239, 12],
    [224, 11],
  ]
  for (const [y, count] of rows) {
    for (let col = 0; col < count; col++) out.push({ x: 26 + col * 29, y, w: 27, h: 13 })
  }
  return out
}

/**
 * Walls (wallet, 25) and Door (guarantor, 20) share one 9-column, 5-row
 * grid of 26x22 bricks. Columns 3..6 are the door.
 */
function wallsAndDoor(): { walls: Brick[]; door: Brick[] } {
  const walls: Brick[] = []
  const door: Brick[] = []
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const brick: Brick = { x: 74 + col * 28, y: 196 - row * 24, w: 26, h: 22 }
      if (col >= 3 && col <= 6) door.push(brick)
      else walls.push(brick)
    }
  }
  return { walls, door }
}

/** Roof (spaza, 20): 4 stepped rows of 8/6/4/2, 34x20, centred at 36px steps. */
function roofBricks(): Brick[] {
  const out: Brick[] = []
  const rows: Array<[number, number]> = [
    [74, 8],
    [52, 6],
    [30, 4],
    [8, 2],
  ]
  for (const [y, count] of rows) {
    for (let col = 0; col < count; col++) out.push({ x: (HOUSE_VIEWBOX.width - count * 36) / 2 + col * 36, y, w: 34, h: 20 })
  }
  return out
}

const { walls, door } = wallsAndDoor()

/** All bricks, grouped by part index, each part in fill order. */
export const HOUSE_BRICKS: readonly (readonly Brick[])[] = [
  foundationBricks(),
  walls,
  roofBricks(),
  door,
] as const

/** Bricks per part — must stay 35/25/20/20 so a point is always a brick. */
export const HOUSE_BRICK_COUNTS: readonly number[] = HOUSE_BRICKS.map((part) => part.length)

export const HOUSE_TOTAL_BRICKS: number = HOUSE_BRICK_COUNTS.reduce((a, b) => a + b, 0)

/** Exact points per part, as ScoreResult carries them. */
export type HousePartPoints = { stokvel: number; wallet: number; spaza: number; guarantor: number }

/**
 * Points per part in house order, from the score's exact (unrounded)
 * part points. Using the exact values is what lets the bricks add up to
 * the total: `houseTotal(points)` always equals `score.total`.
 */
export function toHousePoints(partPoints: HousePartPoints): HousePoints {
  return HOUSE_PARTS.map((part) => partPoints[part.key]) as HousePoints
}

export function houseTotal(points: readonly number[]): number {
  return Math.max(0, Math.min(100, Math.round(points.reduce((a, b) => a + b, 0))))
}

/**
 * Whole bricks per part, reconciled so the parts always add up to the
 * total. Points are fractional (34.3, 22.1, …) but bricks are not, and a
 * house that lights 92 bricks while the score says 91 would be a lie.
 * Largest-remainder allocation: floor everything, then hand the leftover
 * bricks to the parts with the biggest fractions.
 */
export function allocateBricks(
  points: readonly number[],
  total: number = houseTotal(points),
): number[] {
  const floors = HOUSE_PARTS.map((part, i) => Math.max(0, Math.min(part.max, Math.floor(points[i] ?? 0))))
  const remainders = HOUSE_PARTS.map((part, i) => (points[i] ?? 0) - Math.floor(points[i] ?? 0))
  let leftover = total - floors.reduce((a, b) => a + b, 0)

  const order = HOUSE_PARTS.map((_, i) => i).sort((a, b) => remainders[b] - remainders[a])
  // Positive leftover: add to the biggest fractions. Negative: take from
  // the smallest (a part can never go below zero bricks).
  for (const i of leftover > 0 ? order : [...order].reverse()) {
    if (leftover === 0) break
    if (leftover > 0) {
      if (floors[i] < HOUSE_PARTS[i].max) {
        floors[i] += 1
        leftover -= 1
      }
    } else if (floors[i] > 0) {
      floors[i] -= 1
      leftover += 1
    }
  }
  return floors
}

/**
 * The accessible name for the house. Colour is never the only meaning:
 * this text is what a screen reader hears instead of 100 shapes. Pass a
 * subject to speak about someone else's house on the landing page.
 */
export function houseLabel(points: readonly number[], subject = 'Your home'): string {
  const bricks = allocateBricks(points)
  const total = bricks.reduce((a, b) => a + b, 0)
  const parts = HOUSE_PARTS.map((part, i) => `${part.part.toLowerCase()} ${bricks[i]} of ${part.max}`)
  return `${subject} is ${total} percent built: ${parts.join(', ')}`
}
