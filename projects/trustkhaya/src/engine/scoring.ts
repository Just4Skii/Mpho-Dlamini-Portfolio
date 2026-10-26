/**
 * Copied verbatim from the TrustKhaya app (lib/scoring.ts) — the same scoring
 * engine, house geometry and seed data that the real product runs.
 */
/**
 * TrustKhaya Community Trust Score — the hero.
 *
 * A PURE, deterministic, dependency-free function. No hardcoded scores
 * anywhere: every score is recomputed from raw signal rows, and a
 * JSON snapshot is stored at submit/decision time for audit.
 *
 * Weights (max points, total 100):
 *   Stokvel / burial society ........ 35
 *   Mobile-money wallet ............. 25
 *   Spaza-shop credit repayment ..... 20
 *   Community guarantor ............. 20
 */

import { BAND_COLORS } from './brand'

export type VouchStatus = 'none' | 'pending' | 'verified' | 'declined'

export type BandKey = 'strong' | 'building' | 'early'
export type Tone = 'good' | 'ok' | 'low' | 'none'
export type Recommendation = 'approve' | 'incomplete' | 'review' | 'decline'
export type Confidence = 'High' | 'Medium' | 'Low'

export interface StokvelSignalRow {
  group_name: string
  type: 'stokvel' | 'burial_society'
  monthly_amount: number
  tenure_months: number
  months_expected: number
  months_paid: number
  treasurer_name: string | null
}

export interface WalletMonthSignalRow {
  month: string // 'YYYY-MM-DD'
  inflow: number
  outflow: number
  txn_count: number
}

export interface WalletProfileSignalRow {
  provider: string | null
  tenure_months: number
  airtime_data_monthly_avg?: number | null
}

export interface SpazaSignalRow {
  shop_name: string
  amount: number
  purchased_on: string
  due_on: string
  repaid_on: string | null
}

export interface VouchSignalRow {
  status: VouchStatus
  liability_cap: number | null
  guarantor_name: string | null
}

export interface SignalInput {
  stokvels: StokvelSignalRow[]
  walletMonths: WalletMonthSignalRow[]
  walletProfile: WalletProfileSignalRow | null
  spazaCredits: SpazaSignalRow[]
  vouch: VouchSignalRow
}

export interface SignalExplanation {
  key: 'stokvel' | 'wallet' | 'spaza' | 'guarantor'
  label: string
  icon: 'users' | 'smartphone' | 'store' | 'shield'
  weightMax: number
  points: number
  statusText: string
  tone: Tone
  improveTip: string
  /** Exact calculation lines shown in the "How is this calculated?" panel. */
  detail: string[]
  noData?: boolean
}

export interface ScoreResult {
  total: number
  band: { key: BandKey; label: string; color: string }
  probability: number
  confidence: Confidence
  recommendation: Recommendation
  headline: string
  because: string[]
  signals: SignalExplanation[]
  improve: string[]
  /** Non-guarantor points renormalised out of 80 -> 0..100. */
  scoreWithoutGuarantor: number
  /**
   * Exact per-part points, unrounded. The signal cards show these to one
   * decimal, but the house needs the full precision: rounding each part
   * first can make the bricks add up to a point more than the total.
   */
  partPoints: {
    stokvel: number
    wallet: number
    spaza: number
    guarantor: number
  }
  drivers: {
    stokvelConsistency: number
    stokvelTenureMonths: number
    walletCv: number
    walletVolatility: string
    spazaOnTimeRate: number
    guarantorFactor: number
  }
  volatilityLabel: string
}

export const WEIGHTS = {
  stokvel: 35,
  wallet: 25,
  spaza: 20,
  guarantor: 20,
} as const

/**
 * Band order, labels and thresholds are the scoring contract and never
 * change. Only the three display colours were migrated to the v2 status
 * palette (see lib/brand.ts for the single source of truth).
 */
export const BANDS: Array<{ key: BandKey; label: string; color: string; min: number }> = [
  { key: 'strong', label: 'Strong', color: BAND_COLORS.strong, min: 70 },
  { key: 'building', label: 'Building', color: BAND_COLORS.building, min: 40 },
  { key: 'early', label: 'Early days', color: BAND_COLORS.early, min: 0 },
]

/** Verified guarantor -> factor by liability cap (store as a constant). */
export const GUARANTOR_CAPS: Array<{ cap: 500 | 1000 | 2000; factor: number; label: string }> = [
  { cap: 500, factor: 0.5, label: 'R500' },
  { cap: 1000, factor: 0.8, label: 'R1 000' },
  { cap: 2000, factor: 1.0, label: 'R2 000' },
]

export function bandFor(total: number): { key: BandKey; label: string; color: string } {
  const band = BANDS.find((b) => total >= b.min) ?? BANDS[BANDS.length - 1]
  return { key: band.key, label: band.label, color: band.color }
}

export function guarantorFactorForCap(cap: number | null): number {
  if (cap == null) return 0
  if (cap >= 2000) return 1.0
  if (cap >= 1000) return 0.8
  if (cap >= 500) return 0.5
  return 0
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Population standard deviation. */
export function stdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2)
}

// ---------------------------------------------------------------------------
// 1) STOKVEL — worth up to 35 points
// ---------------------------------------------------------------------------

export interface StokvelSub {
  sub: number
  tenureFactor: number
  consistencyFactor: number
  bestGroup: StokvelSignalRow | null
  multiGroupBonus: boolean
}

export function computeStokvelSub(stokvels: StokvelSignalRow[]): StokvelSub {
  if (stokvels.length === 0) {
    return { sub: 0, tenureFactor: 0, consistencyFactor: 0, bestGroup: null, multiGroupBonus: false }
  }
  const parts = stokvels.map((g) => {
    const tenureFactor = Math.min(g.tenure_months / 24, 1)
    const consistencyFactor = g.months_expected > 0 ? clamp(g.months_paid / g.months_expected, 0, 1) : 0
    const sub = 0.5 * tenureFactor + 0.5 * consistencyFactor
    return { tenureFactor, consistencyFactor, sub, group: g }
  })
  const best = parts.reduce((a, b) => (b.sub > a.sub ? b : a))
  const multiGroupBonus = stokvels.length >= 2
  return {
    sub: clamp(best.sub + (multiGroupBonus ? 0.05 : 0), 0, 1),
    tenureFactor: best.tenureFactor,
    consistencyFactor: best.consistencyFactor,
    bestGroup: best.group,
    multiGroupBonus,
  }
}

// ---------------------------------------------------------------------------
// 2) MOBILE-MONEY WALLET — worth up to 25 points
// ---------------------------------------------------------------------------

export interface WalletSub {
  sub: number
  tenureFactor: number
  cv: number
  stabilityFactor: number
  regularityFactor: number
  activeMonths: number
  hasData: boolean
}

export function volatilityLabelFor(cv: number): string {
  if (cv < 0.2) return 'Stable'
  if (cv <= 0.45) return 'Some ups and downs'
  return 'Very irregular'
}

export function lastSixMonths(rows: WalletMonthSignalRow[]): WalletMonthSignalRow[] {
  return [...rows].sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
}

export function computeWalletSub(
  walletMonths: WalletMonthSignalRow[],
  profile: WalletProfileSignalRow | null,
): WalletSub {
  const rows = lastSixMonths(walletMonths)
  if (rows.length === 0 || !profile) {
    return { sub: 0, tenureFactor: 0, cv: 1, stabilityFactor: 0, regularityFactor: 0, activeMonths: 0, hasData: false }
  }
  const inflows = rows.map((r) => Number(r.inflow))
  const mean = inflows.reduce((a, b) => a + b, 0) / inflows.length
  const cv = mean === 0 ? 1 : stdDev(inflows) / mean
  const stabilityFactor = 1 - Math.min(cv / 0.6, 1)
  const activeMonths = rows.filter((r) => Number(r.inflow) > 0 && r.txn_count >= 4).length
  const regularityFactor = activeMonths / 6
  const tenureFactor = Math.min(profile.tenure_months / 18, 1)
  const sub = 0.3 * tenureFactor + 0.4 * stabilityFactor + 0.3 * regularityFactor
  return { sub: clamp(sub, 0, 1), tenureFactor, cv, stabilityFactor, regularityFactor, activeMonths, hasData: true }
}

// ---------------------------------------------------------------------------
// 3) SPAZA CREDIT — worth up to 20 points
// ---------------------------------------------------------------------------

const GRACE_DAYS = 3

function isOnTime(dueOn: string, repaidOn: string): boolean {
  const due = new Date(dueOn + 'T00:00:00Z')
  due.setUTCDate(due.getUTCDate() + GRACE_DAYS)
  const repaid = new Date(repaidOn + 'T00:00:00Z')
  return repaid.getTime() <= due.getTime()
}

export interface SpazaSub {
  sub: number
  onTimeRate: number
  depthFactor: number
  totalPurchases: number
  totalRepaid: number
  onTime: number
  late: number
  noData: boolean
}

export function computeSpazaSub(spazaCredits: SpazaSignalRow[]): SpazaSub {
  const totalPurchases = spazaCredits.length
  if (totalPurchases === 0) {
    return { sub: 0, onTimeRate: 0, depthFactor: 0, totalPurchases: 0, totalRepaid: 0, onTime: 0, late: 0, noData: true }
  }
  const repaid = spazaCredits.filter((c) => c.repaid_on != null)
  const onTime = repaid.filter((c) => isOnTime(c.due_on, c.repaid_on as string)).length
  const onTimeRate = repaid.length > 0 ? onTime / repaid.length : 0
  const depthFactor = Math.min(totalPurchases / 12, 1)
  const sub = 0.7 * onTimeRate + 0.3 * depthFactor
  return {
    sub: clamp(sub, 0, 1),
    onTimeRate,
    depthFactor,
    totalPurchases,
    totalRepaid: repaid.length,
    onTime,
    late: repaid.length - onTime,
    noData: false,
  }
}

// ---------------------------------------------------------------------------
// 4) GUARANTOR — worth up to 20 points
// ---------------------------------------------------------------------------

export interface GuarantorSub {
  sub: number
  status: VouchStatus
}

export function computeGuarantorSub(vouch: VouchSignalRow): GuarantorSub {
  if (vouch.status === 'verified') {
    return { sub: guarantorFactorForCap(vouch.liability_cap), status: 'verified' }
  }
  return { sub: 0, status: vouch.status }
}

// ---------------------------------------------------------------------------
// Good-standing prediction ("the intelligence layer")
// ---------------------------------------------------------------------------

export interface ProbabilityParams {
  stokvelConsistency: number
  walletCv: number
  spazaOnTimeRate: number
  guarantorFactor: number
}

/**
 * The good-standing model, written down in one place so the method page
 * can show its working. `computeProbability` below is the ONLY place the
 * logistic is evaluated; `probabilityTerms` reports the same arithmetic
 * term by term. Neither duplicates the other's maths.
 */
export const PROBABILITY_MODEL = {
  intercept: -3.0,
  /** positive coefficient = raises the odds of staying in good standing */
  terms: [
    { key: 'stokvelConsistency', label: 'Consistent stokvel contributions', coefficient: 4.2 },
    { key: 'walletCv', label: 'Unsteady wallet income', coefficient: -2.0 },
    { key: 'spazaOnTimeRate', label: 'On-time spaza repayments', coefficient: 1.5 },
    { key: 'guarantorFactor', label: 'A guarantor behind you', coefficient: 1.0 },
  ],
} as const

/** The model never claims more certainty than this. */
export const PROBABILITY_CLAMP = { min: 0.05, max: 0.97 } as const

/**
 * The z-expression written out, so any UI that quotes the model is
 * generated from the model rather than typed by hand.
 */
export function probabilityExpression(): string {
  return [
    String(PROBABILITY_MODEL.intercept),
    ...PROBABILITY_MODEL.terms.map(
      (term) => `${term.coefficient >= 0 ? '+' : '−'} ${Math.abs(term.coefficient)}×${term.key}`,
    ),
  ].join(' ')
}

/** The raw log-odds (z) before the logistic squashes it into 0..1. */
export function probabilityZ(params: ProbabilityParams): number {
  return (
    PROBABILITY_MODEL.intercept +
    PROBABILITY_MODEL.terms.reduce((acc, term) => acc + term.coefficient * params[term.key], 0)
  )
}

export function computeProbability(params: ProbabilityParams): number {
  const p = 1 / (1 + Math.exp(-probabilityZ(params)))
  return clamp(p, PROBABILITY_CLAMP.min, PROBABILITY_CLAMP.max)
}

export interface ProbabilityTerm {
  key: keyof ProbabilityParams
  label: string
  coefficient: number
  value: number
  /** coefficient x value — how much this term moves z, in log-odds */
  contribution: number
}

/** The terms of `computeProbability`, biggest mover first. */
export function probabilityTerms(params: ProbabilityParams): ProbabilityTerm[] {
  return PROBABILITY_MODEL.terms
    .map((term) => ({
      key: term.key,
      label: term.label,
      coefficient: term.coefficient,
      value: params[term.key],
      contribution: term.coefficient * params[term.key],
    }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
}

export interface ConfidenceParams {
  stokvelTenureMonths?: number
  walletMonths?: WalletMonthSignalRow[]
  walletProfile: WalletProfileSignalRow | null
  stokvels: StokvelSignalRow[]
  spazaCredits: SpazaSignalRow[]
  vouch: VouchSignalRow
}

/** How many signals carry data, and how long the longest history is. */
export interface ConfidenceBasis {
  signalsWithData: number
  bestTenureMonths: number
}

/** The confidence rule, named so the method page can quote it verbatim. */
export const CONFIDENCE_RULE = {
  highSignals: 3,
  highTenureMonths: 12,
  mediumSignals: 2,
} as const

export function confidenceBasis(params: ConfidenceParams): ConfidenceBasis {
  let signalsWithData = 0
  if (params.stokvels.length > 0) signalsWithData++
  if ((params.walletMonths?.length ?? 0) > 0 || params.walletProfile) signalsWithData++
  if (params.spazaCredits.length > 0) signalsWithData++
  if (params.vouch.status === 'verified') signalsWithData++
  const bestTenureMonths = Math.max(
    0,
    ...params.stokvels.map((s) => s.tenure_months),
    params.walletProfile?.tenure_months ?? 0,
  )
  return { signalsWithData, bestTenureMonths }
}

export function computeConfidence(params: ConfidenceParams): Confidence {
  const { signalsWithData, bestTenureMonths } = confidenceBasis(params)
  if (signalsWithData >= CONFIDENCE_RULE.highSignals && bestTenureMonths >= CONFIDENCE_RULE.highTenureMonths) {
    return 'High'
  }
  if (signalsWithData === CONFIDENCE_RULE.mediumSignals) return 'Medium'
  return 'Low'
}

/** One plain sentence saying WHY the confidence is what it is. */
export function confidenceReason(params: ConfidenceParams): string {
  const { signalsWithData, bestTenureMonths } = confidenceBasis(params)
  return `${signalsWithData} of 4 signals have data, and the longest history is ${bestTenureMonths} months.`
}

/**
 * The decision thresholds, named so the method page can quote them and
 * so the boundary tests can pin them. Used by computeRecommendation.
 */
export const RECOMMENDATION_THRESHOLDS = {
  approveScore: 70,
  approveProbability: 0.75,
  incompleteScoreWithoutGuarantor: 55,
  reviewScoreMin: 45,
  reviewScoreMax: 69,
} as const

export function computeRecommendation(params: {
  score: number
  scoreWithoutGuarantor: number
  vouchStatus: VouchStatus
  probability: number
  confidence: Confidence
}): Recommendation {
  const T = RECOMMENDATION_THRESHOLDS
  const verified = params.vouchStatus === 'verified'
  if (params.score >= T.approveScore && verified && params.probability >= T.approveProbability) return 'approve'
  if (params.scoreWithoutGuarantor >= T.incompleteScoreWithoutGuarantor && !verified) return 'incomplete'
  if (params.score >= T.reviewScoreMin && params.score <= T.reviewScoreMax && verified) return 'review'
  if (params.confidence === 'Low' && params.score >= T.reviewScoreMin) return 'review'
  return 'decline'
}

function likelihoodWord(p: number): string {
  if (p >= 0.85) return 'Very high'
  if (p >= 0.7) return 'High'
  if (p >= 0.5) return 'Fair'
  if (p >= 0.3) return 'Moderate'
  return 'Low'
}

function plural(n: number, word: string): string {
  return n === 1 ? `1 ${word}` : `${n} ${word}s`
}

function toneFor(sub: number): Tone {
  if (sub >= 0.75) return 'good'
  if (sub >= 0.4) return 'ok'
  if (sub > 0) return 'low'
  return 'none'
}

// ---------------------------------------------------------------------------
// The pure entry point
// ---------------------------------------------------------------------------

export function computeTrustScore(input: SignalInput): ScoreResult {
  const stokvel = computeStokvelSub(input.stokvels)
  const wallet = computeWalletSub(input.walletMonths, input.walletProfile)
  const spaza = computeSpazaSub(input.spazaCredits)
  const guarantor = computeGuarantorSub(input.vouch)

  const stokvelPoints = stokvel.sub * WEIGHTS.stokvel
  const walletPoints = wallet.sub * WEIGHTS.wallet
  const spazaPoints = spaza.sub * WEIGHTS.spaza
  const guarantorPoints = guarantor.sub * WEIGHTS.guarantor

  const rawTotal = stokvelPoints + walletPoints + spazaPoints + guarantorPoints
  const total = clamp(Math.round(rawTotal), 0, 100)
  const scoreWithoutGuarantor = clamp(
    Math.round(((stokvelPoints + walletPoints + spazaPoints) / (WEIGHTS.stokvel + WEIGHTS.wallet + WEIGHTS.spaza)) * 100),
    0,
    100,
  )

  const band = bandFor(total)
  const volatilityLabel = volatilityLabelFor(wallet.cv)
  const probability = computeProbability({
    stokvelConsistency: stokvel.consistencyFactor,
    walletCv: wallet.cv,
    spazaOnTimeRate: spaza.noData ? 0 : spaza.onTimeRate,
    guarantorFactor: guarantor.sub,
  })
  const confidence = computeConfidence({
    stokvels: input.stokvels,
    walletMonths: input.walletMonths,
    walletProfile: input.walletProfile,
    spazaCredits: input.spazaCredits,
    vouch: input.vouch,
  })
  const recommendation = computeRecommendation({
    score: total,
    scoreWithoutGuarantor,
    vouchStatus: input.vouch.status,
    probability,
    confidence,
  })

  // ---- explanation -----------------------------------------------------
  const headline = `Score ${total} — ${likelihoodWord(probability)} likelihood of good standing`

  const because: string[] = []
  if (stokvel.bestGroup) {
    because.push(
      `${stokvel.bestGroup.group_name}: ${plural(stokvel.bestGroup.months_paid, 'contribution')} paid of ${stokvel.bestGroup.months_expected} expected over ${stokvel.bestGroup.tenure_months} months`,
    )
  }
  if (wallet.hasData) {
    because.push(
      `Money coming into your wallet is ${volatilityLabel.toLowerCase()} — regular activity in ${wallet.activeMonths} of the last 6 months`,
    )
  }
  if (spaza.totalPurchases > 0) {
    because.push(
      spaza.totalRepaid > 0
        ? `${spaza.onTime} of ${spaza.totalRepaid} spaza repayments were on time`
        : `No spaza repayments recorded yet (${spaza.totalPurchases} purchases)`,
    )
  }
  if (input.vouch.status === 'verified' && input.vouch.guarantor_name) {
    because.push(
      `${input.vouch.guarantor_name} backs you for R${new Intl.NumberFormat('en-ZA').format(input.vouch.liability_cap ?? 0)}`,
    )
  }

  const stokvelRange = stokvel.bestGroup
    ? stokvel.bestGroup.tenure_months < 24
      ? Math.max(0, Math.round((((24 - stokvel.bestGroup.tenure_months) / 24) * 0.5) * WEIGHTS.stokvel))
      : 0
    : 0

  const improve: string[] = []
  if (!stokvel.bestGroup) {
    improve.push('Add the stokvel or burial society you belong to — it is worth up to 35 points')
  } else if (stokvelRange > 0) {
    improve.push(`Keep paying your stokvel for ${24 - stokvel.bestGroup.tenure_months} more months (up to ${stokvelRange} more points)`)
  }
  if (stokvel.bestGroup && stokvel.bestGroup.months_expected > stokvel.bestGroup.months_paid) {
    const missed = stokvel.bestGroup.months_expected - stokvel.bestGroup.months_paid
    improve.push(`Catch up on ${plural(missed, 'missed stokvel contribution')}`)
  }
  if (!wallet.hasData) {
    improve.push('Add your wallet months — a steady wallet is worth up to 25 points')
  } else {
    if (wallet.cv >= 0.2) {
      improve.push('Try to keep money coming in the same way each month — steadier is stronger')
    }
    if (input.walletProfile && input.walletProfile.tenure_months < 18) {
      improve.push(`Keep your wallet active for ${18 - input.walletProfile.tenure_months} more months`)
    }
    if (wallet.activeMonths < 6) {
      improve.push('Use your wallet at least 4 times a month so regular activity shows')
    }
  }
  if (spaza.noData) {
    improve.push('No spaza history yet — this is optional but helps. Buy on credit and repay on time')
  } else if (spaza.late > 0) {
    improve.push(`${plural(spaza.late, 'spaza repayment')} came late — paying by the due date (3-day grace) builds trust`)
  }
  if (input.vouch.status === 'none' || input.vouch.status === 'declined') {
    improve.push('Ask a trusted elder to vouch for you — the guarantor is worth up to 20 points')
  } else if (input.vouch.status === 'pending') {
    improve.push('Your vouch request is waiting — ask that person to open the link and confirm')
  } else if (input.vouch.status === 'verified' && input.vouch.liability_cap != null && input.vouch.liability_cap < 2000) {
    improve.push('A higher vouch (R2 000) would raise your score a bit more')
  }

  // ---- signal cards -----------------------------------------------------
  const signals: SignalExplanation[] = []

  const stokvelTone = toneFor(stokvel.sub)
  signals.push({
    key: 'stokvel',
    label: 'Stokvel / burial society',
    icon: 'users',
    weightMax: WEIGHTS.stokvel,
    points: Math.round(stokvelPoints * 10) / 10,
    tone: stokvelTone,
    statusText: stokvel.bestGroup
      ? `${stokvel.bestGroup.tenure_months} months in, ${stokvel.bestGroup.months_paid} of ${stokvel.bestGroup.months_expected} contributions paid`
      : 'No stokvel group added yet',
    improveTip: stokvel.bestGroup
      ? 'Every month contributes toward tenure (24 months is full) and paying on schedule keeps your consistency at 100%.'
      : 'Add the savings club or burial society you belong to, with how long you have been in it and how many months you paid.',
    detail: stokvel.bestGroup
      ? [
          `tenure factor = min(${stokvel.bestGroup.tenure_months} / 24, 1) = ${fmt(stokvel.tenureFactor)}`,
          `consistency = ${stokvel.bestGroup.months_paid} / ${stokvel.bestGroup.months_expected} = ${fmt(stokvel.consistencyFactor)}`,
          stokvel.multiGroupBonus
            ? `sub = 0.5×${fmt(stokvel.tenureFactor)} + 0.5×${fmt(stokvel.consistencyFactor)} + 0.05 two-group bonus = ${fmt(stokvel.sub)}`
            : `sub = 0.5×${fmt(stokvel.tenureFactor)} + 0.5×${fmt(stokvel.consistencyFactor)} = ${fmt(stokvel.sub)}`,
        ]
      : ['no stokvel data', 'sub = 0'],
  })

  const walletTone = toneFor(wallet.sub)
  signals.push({
    key: 'wallet',
    label: 'Mobile-money wallet',
    icon: 'smartphone',
    weightMax: WEIGHTS.wallet,
    points: Math.round(walletPoints * 10) / 10,
    tone: walletTone,
    statusText: wallet.hasData
      ? `${volatilityLabel}: money in ${wallet.activeMonths} of last 6 months`
      : 'No wallet months added yet',
    improveTip: wallet.hasData
      ? 'Stability comes from money arriving regularly. Regularity means using the wallet at least 4 times a month.'
      : 'Add the money that comes into your wallet for the last 6 months, plus how long you have used this wallet.',
    detail: wallet.hasData
      ? [
          `tenure factor = min(${input.walletProfile?.tenure_months ?? 0} / 18, 1) = ${fmt(wallet.tenureFactor)}`,
          `volatility (cv) = ${fmt(wallet.cv)} -> stability = 1 − min(${fmt(wallet.cv)} / 0.6, 1) = ${fmt(wallet.stabilityFactor)}`,
          `regularity = ${wallet.activeMonths} / 6 = ${fmt(wallet.regularityFactor)}`,
          `sub = 0.3×${fmt(wallet.tenureFactor)} + 0.4×${fmt(wallet.stabilityFactor)} + 0.3×${fmt(wallet.regularityFactor)} = ${fmt(wallet.sub)}`,
        ]
      : ['no wallet data', 'sub = 0'],
  })

  const spazaTone = spaza.noData ? 'none' : toneFor(spaza.sub)
  signals.push({
    key: 'spaza',
    label: 'Spaza-shop credit',
    icon: 'store',
    weightMax: WEIGHTS.spaza,
    points: Math.round(spazaPoints * 10) / 10,
    tone: spazaTone,
    statusText: spaza.noData
      ? 'No spaza history yet — this is optional but helps'
      : spaza.totalRepaid > 0
        ? `${spaza.onTime} of ${spaza.totalRepaid} repayments on time`
        : `${spaza.totalPurchases} purchases, none repaid yet`,
    improveTip: spaza.noData
      ? 'If your tuck shop lets you buy on credit, repaying on time is a strong trust signal. This part is optional.'
      : 'Late means paid more than 3 days after the due date. Paying on or before the due date keeps the rate at 100%.',
    detail: spaza.noData
      ? ['no spaza data (optional signal)', 'sub = 0']
      : [
          `on-time rate = ${spaza.onTime} / ${spaza.totalRepaid} = ${fmt(spaza.onTimeRate)} (grace = 3 days)`,
          `depth = min(${spaza.totalPurchases} / 12, 1) = ${fmt(spaza.depthFactor)}`,
          `sub = 0.7×${fmt(spaza.onTimeRate)} + 0.3×${fmt(spaza.depthFactor)} = ${fmt(spaza.sub)}`,
        ],
    noData: spaza.noData,
  })

  signals.push({
    key: 'guarantor',
    label: 'Community guarantor',
    icon: 'shield',
    weightMax: WEIGHTS.guarantor,
    points: Math.round(guarantorPoints * 10) / 10,
    tone: input.vouch.status === 'verified' ? (guarantor.sub >= 0.8 ? 'good' : 'ok') : input.vouch.status === 'pending' ? 'low' : 'none',
    statusText:
      input.vouch.status === 'verified'
        ? `Backed for R${new Intl.NumberFormat('en-ZA').format(input.vouch.liability_cap ?? 0)} by ${input.vouch.guarantor_name ?? 'a guarantor'}`
        : input.vouch.status === 'pending'
          ? `Waiting for ${input.vouch.guarantor_name ?? 'your person'} to confirm`
          : input.vouch.status === 'declined'
            ? 'Someone declined — ask someone else'
            : 'No guarantor yet — worth up to 20 points',
    improveTip:
      'A trusted elder who knows you can back you for R500, R1 000 or R2 000. They carry a small, capped promise — that makes the vouch real.',
    detail: [
      `status = ${input.vouch.status}`,
      input.vouch.status === 'verified'
        ? `cap lookup: R${input.vouch.liability_cap} -> ${fmt(guarantor.sub)}`
        : 'no vouch on record',
      `sub = ${fmt(guarantor.sub)}`,
    ],
  })

  return {
    total,
    band,
    probability,
    confidence,
    recommendation,
    headline,
    because,
    signals,
    improve,
    scoreWithoutGuarantor,
    partPoints: {
      stokvel: stokvelPoints,
      wallet: walletPoints,
      spaza: spazaPoints,
      guarantor: guarantorPoints,
    },
    drivers: {
      stokvelConsistency: stokvel.consistencyFactor,
      stokvelTenureMonths: stokvel.bestGroup?.tenure_months ?? 0,
      walletCv: wallet.cv,
      walletVolatility: volatilityLabel,
      spazaOnTimeRate: spaza.noData ? 0 : spaza.onTimeRate,
      guarantorFactor: guarantor.sub,
    },
    volatilityLabel,
  }
}

// ---------------------------------------------------------------------------
// Privacy summary for guarantors — qualitative only, NEVER amounts.
// ---------------------------------------------------------------------------

export interface GuarantorPrivacySummary {
  firstName: string
  initials: string
  town: string
  ageBand: string
  band: { key: BandKey; label: string; color: string }
  chips: string[]
}

export function ageBandFor(age: number): string {
  if (age <= 19) return 'Late teens'
  if (age <= 22) return 'Early twenties'
  return 'Mid-twenties'
}

export function summarizeForGuarantor(
  input: SignalInput,
  result: ScoreResult,
  applicant: { full_name: string; age: number; town: string },
): GuarantorPrivacySummary {
  const first = applicant.full_name.trim().split(/\s+/)[0] ?? 'Someone'
  const initials = (first.slice(0, 1) + (applicant.full_name.trim().split(/\s+/)[1]?.slice(0, 1) ?? '')).toUpperCase()

  const chips: string[] = []
  const stokvel = input.stokvels.length > 0
  const bestStokvel = computeStokvelSub(input.stokvels)
  if (stokvel) {
    const onTime = bestStokvel.consistencyFactor >= 0.9
    chips.push(
      onTime
        ? `Pays stokvel on time — ${input.stokvels[0].tenure_months} months`
        : `Belongs to a stokvel — ${input.stokvels[0].tenure_months} months`,
    )
  }
  const wallet = computeWalletSub(input.walletMonths, input.walletProfile)
  if (wallet.hasData) {
    if (wallet.cv < 0.2) chips.push('Steady wallet income')
    else if (wallet.cv <= 0.45) chips.push('Wallet income has some ups and downs')
    else chips.push('Very irregular wallet income — worth noting')
  }
  const spaza = computeSpazaSub(input.spazaCredits)
  if (!spaza.noData && spaza.totalRepaid > 0) {
    if (spaza.onTimeRate >= 0.9) chips.push('Repays shop credit on time')
    else if (spaza.onTimeRate >= 0.6) chips.push('Repays shop credit, sometimes late')
    else chips.push('Some shop-credit repayments overdue')
  }
  if (chips.length === 0) chips.push('New to TrustKhaya — few records yet')

  return { firstName: first, initials, town: applicant.town, ageBand: ageBandFor(applicant.age), band: result.band, chips }
}
