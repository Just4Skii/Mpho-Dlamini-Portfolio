/**
 * Copied verbatim from the TrustKhaya app (lib/brand.ts) — the same scoring
 * engine, house geometry and seed data that the real product runs.
 */
/**
 * TRUSTKHAYA BRAND SYSTEM v2 — Shweshwe Indigo + Khaya Clay on Calico Cream.
 *
 * This is the single source of truth for brand hexes inside TypeScript.
 * The only other places raw hexes may live are:
 *   - app/globals.css            (CSS custom properties)
 *   - tailwind.config.ts         (utility class names)
 *   - components/Logo.tsx        (the mark itself)
 *   - components/ShweshwePattern.tsx (the tile itself)
 * scripts/check-colours.mjs enforces exactly that list.
 */

export const BRAND = {
  /** primary: buttons, links, heading accents, active tab, logo body */
  indigo: '#312E81',
  /** hover / pressed */
  indigoHover: '#25226B',
  /** soft fills: secondary buttons, selected rows */
  indigoTint: '#ECE9F7',
} as const

export const CLAY = {
  /** GRAPHICS ONLY — rings, dots, arcs, borders, icons >= 24px */
  clay: '#E4572E',
  /** clay used for TEXT or BUTTON FILLS (white on it is ~5.7:1) */
  clayDark: '#B93A14',
  /** guarantor badges / backgrounds */
  clayTint: '#FDE8E1',
} as const

export const SURFACE = {
  cream: '#FBF7F0',
  card: '#FFFFFF',
  sand: '#F1ECE2',
  line: '#E7DFD2',
  ink: '#1A1736',
  mute: '#5E5A78',
} as const

/** Signal colours (charts + signal icons, always with a text label). */
export const SIGNAL_COLORS = {
  stokvel: '#312E81',
  wallet: '#7C79D8',
  spaza: '#B8892B',
  guarantor: '#E4572E',
} as const

export type RequestedBandKey = 'strong' | 'building' | 'early'

/**
 * Status colours, conventional on purpose so meaning is instantly clear.
 *
 * NOTE — one deliberate adjustment: the brief asked for building = #CA8A04,
 * but #CA8A04 on the cream surface only reaches 2.73:1, which fails the
 * required >= 3:1 for graphic elements. Per the brief's own instruction
 * ("if any pair fails, adjust the NON-brand supporting value and state
 * which"), building was darkened to #B87B04 (3.33:1 on cream, 3.58:1 on
 * white) — the same mielie gold, one step deeper. All five brand hexes are
 * untouched, and the text-on-tint pair (#854D0E on #FEF3C7) still passes.
 */
export const BAND_COLORS = {
  strong: '#15803D',
  strongTint: '#DCFCE7',
  building: '#B87B04',
  buildingText: '#854D0E',
  buildingTint: '#FEF3C7',
  early: '#BE123C',
  earlyTint: '#FFE4E6',
} as const

/** Per-band solid / tint / text triple used by rings, pills and badges. */
export const BAND_UI: Record<RequestedBandKey, { solid: string; tint: string; text: string }> = {
  strong: { solid: BAND_COLORS.strong, tint: BAND_COLORS.strongTint, text: BAND_COLORS.strong },
  building: { solid: BAND_COLORS.building, tint: BAND_COLORS.buildingTint, text: BAND_COLORS.buildingText },
  early: { solid: BAND_COLORS.early, tint: BAND_COLORS.earlyTint, text: BAND_COLORS.early },
}

export function bandUi(key: string) {
  return BAND_UI[(key as RequestedBandKey) in BAND_UI ? (key as RequestedBandKey) : 'building']
}

/** Persona avatars rotate through these four fills (chosen by name hash). */
export const AVATAR_FILLS = [BRAND.indigoTint, CLAY.clayTint, SURFACE.sand, '#E4E3F8'] as const

export function avatarFill(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_FILLS[Math.abs(hash) % AVATAR_FILLS.length]
}

/** The four trust signals in display order, with their chart colour. */
export const SIGNAL_ORDER = ['stokvel', 'wallet', 'spaza', 'guarantor'] as const
export const SIGNAL_COLOR_LIST = SIGNAL_ORDER.map((key) => SIGNAL_COLORS[key])

/**
 * The 100-brick house (one brick per score point), tinted per surface.
 *
 * `brickLight` is literally the signal palette — indigo foundation, violet
 * walls, gold roof, clay door — which is why the house reads as "the same
 * four signals, built up". `brickDark` lifts the same four hues for the
 * indigo hero (each >= 3:1 on indigo). Unlit bricks are a quiet texture,
 * never the only signal: the number and the labels always say it too.
 */
export const HOUSE = {
  brickDark: ['#E6E3FA', '#9D9BF0', '#E3B04B', '#E4572E'],
  brickLight: SIGNAL_COLOR_LIST,
  unlitDark: '#3C389A',
  unlitLight: '#EFE9DD',
  /** the unlit door keeps a dashed clay outline — it is still unlockable */
  doorStroke: CLAY.clay,
} as const
