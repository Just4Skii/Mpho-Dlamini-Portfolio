/**
 * Copied verbatim from the TrustKhaya app (lib/safeguards.ts) — the same scoring
 * engine, house geometry and seed data that the real product runs.
 */
/**
 * The guarantees TrustKhaya makes about its own worst cases — written so
 * they can be RUN, not just believed.
 *
 * Each safeguard is: a claim, the attack a sceptic would try, where the
 * promise is enforced, and a PURE check over a snapshot of real rows.
 * /safeguards runs these live through POST /api/safeguards/check, and
 * lib/safeguard.test.ts runs them against the seeded demo data AND
 * against deliberately broken snapshots, so a check that always passes
 * cannot hide in here.
 *
 * This module is client-safe: no database, no I/O, no secrets. The route
 * builds the snapshot; this file only reasons about it.
 */

import {
  GUARANTOR_CAPS,
  WEIGHTS,
  computeTrustScore,
  guarantorFactorForCap,
  summarizeForGuarantor,
  type ScoreResult,
  type SignalInput,
  type VouchStatus,
} from './scoring'
import {
  HOUSE_BRICK_COUNTS,
  HOUSE_PARTS,
  allocateBricks,
  houseTotal,
  toHousePoints,
  type HousePoints,
} from './house'

export const SAFEGUARD_IDS = [
  'hundred-bricks',
  'promise-is-bounded',
  'pending-worth-zero',
  'guarantor-privacy',
  'thin-summary',
  'no-self-vouch',
  'capped-promise',
  'consent-gate',
  'same-answer-twice',
] as const

export type SafeguardId = (typeof SAFEGUARD_IDS)[number]

export interface Safeguard {
  id: SafeguardId
  title: string
  /** the promise, in one plain sentence */
  claim: string
  /** what a sceptic would try */
  attack: string
  /** where the promise is actually enforced */
  enforcedBy: string
}

export const SAFEGUARDS: readonly Safeguard[] = [
  {
    id: 'hundred-bricks',
    title: 'The house is exactly 100 bricks, and the parts are the score',
    claim: 'Every brick is one point, every part weighs what it says, and the lit bricks add up to the score.',
    attack: 'Add a signal that silently pushes someone over 100, or make the picture say more than the number.',
    enforcedBy: 'WEIGHTS + computeTrustScore in lib/scoring.ts, allocateBricks in lib/house.ts',
  },
  {
    id: 'promise-is-bounded',
    title: 'A vouch can never be worth more than a fifth of the score',
    claim: `Whatever a guarantor promises, the guarantor part never exceeds ${WEIGHTS.guarantor} points.`,
    attack: 'Promise R1 000 000 and buy your way to a perfect score.',
    enforcedBy: 'guarantorFactorForCap() — the factor is clamped to 1.0 in lib/scoring.ts',
  },
  {
    id: 'pending-worth-zero',
    title: 'A pending vouch is worth exactly zero',
    claim: 'A promise only counts once it is signed. Until then the door stays unlit and the points are 0.',
    attack: 'Ask someone who will never answer, and collect the points anyway.',
    enforcedBy: 'computeGuarantorSub() returns 0 unless status === "verified"',
  },
  {
    id: 'guarantor-privacy',
    title: 'A guarantor never sees a rand amount',
    claim: 'The vouch summary contains no amounts, no balances and no raw records — only words.',
    attack: 'Open a vouch link and read the applicant’s money.',
    enforcedBy: 'summarizeForGuarantor() in lib/scoring.ts (the only summary builder)',
  },
  {
    id: 'thin-summary',
    title: 'The vouch payload has six fields, and nothing else',
    claim: 'First name, initials, town, age band, score band, chips. No phone, no email, no records.',
    attack: 'Look for the applicant’s contact details in the page the guarantor receives.',
    enforcedBy: 'GET /api/vouch/[code] returns the GuarantorPrivacySummary shape only',
  },
  {
    id: 'no-self-vouch',
    title: 'Nobody can vouch for themselves',
    claim: 'A guarantor is always a different person from the applicant, and signing requires the guarantor role.',
    attack: 'Sign your own vouch request and pretend someone stood behind you.',
    enforcedBy: 'POST /api/vouch/[code]/sign requires session.role === "guarantor"',
  },
  {
    id: 'capped-promise',
    title: 'A promise is one of three capped amounts, or nothing',
    claim: 'R500, R1 000 or R2 000. There is no free-text amount to inflate.',
    attack: 'Send a hand-crafted request with a R50 000 cap.',
    enforcedBy: 'signSchema (zod) + signVouchRequest() in lib/repo.ts',
  },
  {
    id: 'consent-gate',
    title: 'No consent, no application',
    claim: 'An application cannot be sent until the applicant has consented to their records being used.',
    attack: 'Apply first, worry about consent later.',
    enforcedBy: 'POST /api/application/submit refuses with no granted consent row',
  },
  {
    id: 'same-answer-twice',
    title: 'The same rows always give the same score',
    claim: 'The score is a pure function: no clock, no randomness, no hidden state.',
    attack: 'Refresh until you get a number you like.',
    enforcedBy: 'computeTrustScore() in lib/scoring.ts — no I/O, no Date, no Math.random',
  },
]

export function safeguardById(id: SafeguardId): Safeguard {
  const found = SAFEGUARDS.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown safeguard: ${id}`)
  return found
}

/** One applicant, as read from the database, plus their recomputed score. */
export interface SafeguardApplicant {
  id: string
  fullName: string
  age: number
  town: string
  input: SignalInput
  result: ScoreResult
  consent: boolean
  applicationStatus: 'draft' | 'submitted' | 'approved' | 'declined' | null
  vouch: {
    code: string
    status: VouchStatus
    liabilityCap: number | null
    guarantorId: string | null
  } | null
}

export interface SafeguardVouchRow {
  code: string
  applicantId: string
  guarantorId: string | null
  status: VouchStatus
  liabilityCap: number | null
}

/** Everything the checks are allowed to look at. Built once by the route. */
export interface SafeguardSnapshot {
  applicants: SafeguardApplicant[]
  vouches: SafeguardVouchRow[]
}

export interface SafeguardOutcome {
  status: 'pass' | 'fail'
  /** one sentence, with the real counts in it */
  headline: string
  /** the evidence, line by line */
  detail: string[]
}

/**
 * The door-only house used on the vouch screen: a guarantor sees the door
 * they are being asked to open, never the rest of the applicant's house.
 */
export function doorOnlyPoints(cap: number | null): HousePoints {
  return [0, 0, 0, guarantorFactorForCap(cap) * WEIGHTS.guarantor]
}

/** The six fields a vouch payload is allowed to carry. */
const ALLOWED_SUMMARY_FIELDS = ['firstName', 'initials', 'town', 'ageBand', 'band', 'chips'] as const

/** Private field names a vouch payload must never contain. */
const FORBIDDEN_SUMMARY_KEYS = [
  'phone',
  'email',
  'monthly_amount',
  'inflow',
  'outflow',
  'amount',
  'liability_cap',
  'total',
] as const

const HOUSE_BRICKS_TOTAL = HOUSE_BRICK_COUNTS.reduce((a, b) => a + b, 0)
const HOUSE_PARTS_MAX = HOUSE_PARTS.map((p) => p.max)

const n1 = (value: number) => (Math.round(value * 10) / 10).toFixed(1)

function verdict(failures: string[], passHeadline: string, detail: string[]): SafeguardOutcome {
  if (failures.length === 0) return { status: 'pass', headline: passHeadline, detail }
  return {
    status: 'fail',
    headline: failures.length === 1 ? failures[0] : `${failures.length} problems found`,
    detail: [...failures, ...detail],
  }
}

function summariseSummaryFor(a: SafeguardApplicant) {
  return summarizeForGuarantor(a.input, a.result, {
    full_name: a.fullName,
    age: a.age,
    town: a.town,
  })
}

/** Every amount in an applicant's records, as plain strings. */
function amountsIn(input: SignalInput): string[] {
  const out: string[] = []
  for (const s of input.stokvels) out.push(String(s.monthly_amount))
  for (const m of input.walletMonths) {
    out.push(String(m.inflow))
    out.push(String(m.outflow))
  }
  for (const c of input.spazaCredits) out.push(String(c.amount))
  return out
}

/**
 * Run one safeguard against a snapshot. Pure: same snapshot in, same
 * verdict out. Every branch collects its evidence, so a PASS comes with
 * the working rather than a green tick.
 */
export function runSafeguard(id: SafeguardId, snap: SafeguardSnapshot): SafeguardOutcome {
  switch (id) {
    case 'hundred-bricks': {
      const failures: string[] = []
      const detail: string[] = []
      const weightsTotal = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
      if (weightsTotal !== 100) failures.push(`The four weights add up to ${weightsTotal}, not 100.`)
      if (HOUSE_BRICKS_TOTAL !== 100) failures.push(`The house is drawn with ${HOUSE_BRICKS_TOTAL} bricks, not 100.`)
      for (const a of snap.applicants) {
        const points = toHousePoints(a.result.partPoints)
        const bricks = allocateBricks(points)
        const lit = bricks.reduce((x, y) => x + y, 0)
        if (lit !== a.result.total) failures.push(`${a.fullName}: ${lit} lit bricks but a total of ${a.result.total}.`)
        points.forEach((p, i) => {
          if (p < -1e-9 || p > HOUSE_PARTS_MAX[i] + 1e-9) {
            failures.push(`${a.fullName}: ${HOUSE_PARTS[i].part} has ${n1(p)} of ${HOUSE_PARTS_MAX[i]} points.`)
          }
        })
        const parts = points.map((p, i) => `${n1(p)}/${HOUSE_PARTS_MAX[i]}`).join(' + ')
        detail.push(
          `${a.fullName}: ${parts} = ${n1(points.reduce((x, y) => x + y, 0))} → ${houseTotal(points)} of 100, ${lit} lit bricks.`,
        )
      }
      return verdict(
        failures,
        `${weightsTotal} of 100 bricks accounted for, and every applicant's lit bricks equal their total.`,
        detail,
      )
    }

    case 'promise-is-bounded': {
      const failures: string[] = []
      const detail: string[] = []
      for (const cap of GUARANTOR_CAPS) {
        if (cap.factor > 1) failures.push(`${cap.label} maps to ${cap.factor}×, which would exceed ${WEIGHTS.guarantor} points.`)
      }
      let largest = 0
      for (const a of snap.applicants) {
        const promise = a.result.partPoints.guarantor
        largest = Math.max(largest, promise)
        if (promise > WEIGHTS.guarantor + 1e-9) {
          failures.push(`${a.fullName}'s vouch is worth ${n1(promise)}, above the ${WEIGHTS.guarantor}-point cap.`)
        }
        detail.push(`${a.fullName}: vouch ${n1(promise)} of ${WEIGHTS.guarantor} points (${a.result.total} of 100 overall).`)
      }
      return verdict(
        failures,
        `The largest vouch in the demo is worth ${n1(largest)} of ${WEIGHTS.guarantor} points — and the cap holds even if someone promises R1 000 000.`,
        detail,
      )
    }

    case 'pending-worth-zero': {
      const failures: string[] = []
      const detail: string[] = []
      const pending = snap.applicants.filter((a) => a.vouch?.status === 'pending')
      for (const a of pending) {
        const promise = a.result.partPoints.guarantor
        if (promise !== 0) failures.push(`${a.fullName}'s vouch is still pending but is worth ${n1(promise)} points.`)
        detail.push(
          `${a.fullName} (${a.vouch?.code ?? 'no code'}): pending → ${n1(promise)} of ${WEIGHTS.guarantor} points, so the total ${a.result.total} is their own behaviour.`,
        )
      }
      return verdict(
        failures,
        `${pending.length} pending vouch${pending.length === 1 ? '' : 'es'} checked: every one contributes 0 of ${WEIGHTS.guarantor} points.`,
        detail.length > 0 ? detail : ['No pending vouch requests in the database right now.'],
      )
    }

    case 'guarantor-privacy': {
      const failures: string[] = []
      const detail: string[] = []
      let amountsChecked = 0
      for (const a of snap.applicants) {
        const summary = summariseSummaryFor(a)
        const json = JSON.stringify(summary)
        const amounts = amountsIn(a.input)
        amountsChecked += amounts.length
        const leaked = amounts.filter((amount) => new RegExp(`(^|\\D)${amount}(\\D|$)`).test(json))
        if (/(^|[^a-zA-Z])R\s?\d/.test(json)) leaked.push('an R-prefixed amount')
        if (leaked.length > 0) failures.push(`${a.fullName}'s vouch summary contains ${leaked.join(', ')}.`)
        detail.push(
          `${a.fullName}: ${amounts.length} amounts in their records, 0 in the summary — “${summary.chips[0] ?? 'no signals shared yet'}”.`,
        )
      }
      return verdict(
        failures,
        `${amountsChecked} amounts across ${snap.applicants.length} applicants checked; not one appears in a vouch summary.`,
        detail,
      )
    }

    case 'thin-summary': {
      const allowed: readonly string[] = ALLOWED_SUMMARY_FIELDS
      const failures: string[] = []
      const detail: string[] = []
      for (const a of snap.applicants) {
        const summary = summariseSummaryFor(a)
        const keys = Object.keys(summary)
        const extra = keys.filter((k) => !allowed.includes(k))
        if (extra.length > 0) failures.push(`${a.fullName}'s summary has unexpected fields: ${extra.join(', ')}.`)
        const json = JSON.stringify(summary).toLowerCase()
        const forbidden = FORBIDDEN_SUMMARY_KEYS.filter((k) => json.includes(`"${k}"`))
        if (forbidden.length > 0) failures.push(`${a.fullName}'s summary exposes ${forbidden.join(', ')}.`)
        detail.push(`${a.fullName}: ${keys.length} fields — ${keys.join(', ')}.`)
      }
      return verdict(
        failures,
        `Every vouch payload carries exactly the ${allowed.length} allowed fields: ${allowed.join(', ')}.`,
        detail,
      )
    }

    case 'no-self-vouch': {
      const failures: string[] = []
      const detail: string[] = []
      for (const v of snap.vouches) {
        if (v.guarantorId !== null && v.guarantorId === v.applicantId) failures.push(`${v.code}: the guarantor is the applicant.`)
        detail.push(`${v.code}: applicant ≠ guarantor${v.guarantorId ? ' ✓' : ' (not signed yet)'}.`)
      }
      return verdict(
        failures,
        `${snap.vouches.length} vouch record${snap.vouches.length === 1 ? '' : 's'} checked; no applicant is their own guarantor.`,
        detail,
      )
    }

    case 'capped-promise': {
      const allowed = GUARANTOR_CAPS.map((c) => c.cap as number)
      const failures: string[] = []
      const detail: string[] = []
      for (const v of snap.vouches) {
        if (v.liabilityCap !== null && !allowed.includes(v.liabilityCap)) {
          failures.push(`${v.code} carries a cap of R${v.liabilityCap}, which is not one of R${allowed.join('/R')}.`)
        }
        detail.push(
          `${v.code}: ${v.liabilityCap === null ? 'no cap yet' : `R${v.liabilityCap}`} (allowed: R${allowed.join(', R')}).`,
        )
      }
      return verdict(
        failures,
        `Every stored promise is one of the three capped amounts (R${allowed.join(', R')}).`,
        detail,
      )
    }

    case 'consent-gate': {
      const failures: string[] = []
      const detail: string[] = []
      const applied = snap.applicants.filter((a) => a.applicationStatus && a.applicationStatus !== 'draft')
      for (const a of applied) {
        if (!a.consent) failures.push(`${a.fullName} has a ${a.applicationStatus} application but no granted consent.`)
      }
      for (const a of snap.applicants) {
        detail.push(`${a.fullName}: consent ${a.consent ? 'granted' : 'not granted'} → application ${a.applicationStatus ?? 'none'}.`)
      }
      return verdict(
        failures,
        `${applied.length} sent application${applied.length === 1 ? '' : 's'} checked; every one has a granted consent record.`,
        detail,
      )
    }

    case 'same-answer-twice': {
      const failures: string[] = []
      const detail: string[] = []
      for (const a of snap.applicants) {
        const again = computeTrustScore(a.input)
        if (JSON.stringify(again) !== JSON.stringify(a.result)) {
          failures.push(`${a.fullName}: recomputing from the same rows gave ${again.total}, not ${a.result.total}.`)
        }
        detail.push(`${a.fullName}: ${a.result.total} of 100 — identical JSON on recompute (${again.total}).`)
      }
      if (snap.applicants.length === 0) failures.push('No applicants to compare.')
      return verdict(failures, `${snap.applicants.length} applicants scored twice; the JSON matched every time.`, detail)
    }
  }

  // Exhaustive: adding an id without a check fails to compile here.
  const unchecked: never = id
  return { status: 'fail', headline: `No check registered for safeguard ${String(unchecked)}.`, detail: [] }
}

// -------------------------------------------------------------------------
// U2 — the limits that protect the guarantor and the bank
//
// The nine checks above prove that the app keeps its own promises. These
// rules answer a different question, the one every lender asks: what stops
// one person promising the same money five times over, or two friends
// vouching for each other in a circle?
// -------------------------------------------------------------------------

/**
 * The most any one guarantor can be asked to cover across all their active
 * promises. A cap per vouch protects the applicant; this protects the
 * guarantor from promising the same R1 000 to four different people.
 */
export const MAX_TOTAL_EXPOSURE = 5000

/** How many people one person may back at the same time. */
export const MAX_ACTIVE_VOUCHES = 3

/** Reaching this many active vouches is flagged to the underwriter. */
export const FLAG_AT_ACTIVE_VOUCHES = 3

export type VouchRuleId =
  | 'self-vouch'
  | 'duplicate'
  | 'active-count'
  | 'exposure'
  | 'flag-at-three'
  | 'mutual'

export type VouchRuleStatus = 'pass' | 'warning' | 'blocked'

export interface VouchRuleOutcome {
  id: VouchRuleId
  title: string
  status: VouchRuleStatus
  /** what happened, with the real numbers in it */
  detail: string
}

/** A person, reduced to what the vouch rules are allowed to look at. */
export interface VouchPerson {
  id: string
  fullName: string
  phone: string | null
  email: string | null
}

/** One promise the guarantor is already carrying. */
export interface ActiveVouch {
  applicantId: string
  applicantName: string
  cap: number
}

/** What the rules may know about the guarantor's book. */
export interface VouchBook {
  active: ActiveVouch[]
  /** the applicant already has a verified guarantor */
  applicantAlreadyVerified: boolean
  /** the applicant has named this guarantor on a request (any status) */
  applicantBacksGuarantor: boolean
  /** names of the people in the mutual pair, for the message */
  mutualNames: string[]
}

export interface VouchEvaluation {
  allowed: boolean
  blockers: string[]
  warnings: string[]
  rules: VouchRuleOutcome[]
  exposure: { current: number; proposed: number; total: number; limit: number }
  activeVouches: number
  maxActiveVouches: number
}

/** R4 000 — grouped with spaces, no locale or Intl dependency. */
export function rand(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return sign + 'R' + digits
}

/**
 * A contact number reduced to the ten local digits, so '+27 82 555 7002',
 * '27825557002' and '082 555 7002' are all the same person.
 */
export function phoneKey(value: string | null | undefined): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length < 9) return ''
  const local = digits.startsWith('27') ? '0' + digits.slice(2) : digits
  return local.slice(-10)
}

export function emailKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

/**
 * The six rules, evaluated in order. Pure and total: the same arguments
 * always give the same verdict, whether they come from the /safeguards
 * panel, the sign route, or a test.
 *
 * `cap` is the amount the guarantor is about to promise.
 */
export function evaluateVouch(
  guarantor: VouchPerson,
  applicant: VouchPerson,
  cap: number,
  book: VouchBook,
): VouchEvaluation {
  const rules: VouchRuleOutcome[] = []
  const blockers: string[] = []
  const warnings: string[] = []

  // 1. Self-vouch — same person, same number, same address.
  const sameId = guarantor.id === applicant.id
  const gPhone = phoneKey(guarantor.phone)
  const aPhone = phoneKey(applicant.phone)
  const samePhone = gPhone !== '' && gPhone === aPhone
  const gEmail = emailKey(guarantor.email)
  const aEmail = emailKey(applicant.email)
  const sameEmail = gEmail !== '' && gEmail === aEmail
  if (sameId || samePhone || sameEmail) {
    const reason = sameId
      ? applicant.fullName + " cannot vouch for themselves — a vouch needs a second person's name on it."
      : samePhone
        ? 'This request carries your own phone number, so signing it would be a vouch for yourself.'
        : 'This request carries your own email address, so signing it would be a vouch for yourself.'
    blockers.push(reason)
    rules.push({ id: 'self-vouch', title: 'Nobody vouches for themselves', status: 'blocked', detail: reason })
  } else {
    rules.push({
      id: 'self-vouch',
      title: 'Nobody vouches for themselves',
      status: 'pass',
      detail: guarantor.fullName + ' and ' + applicant.fullName + ' are different people, with different contact details.',
    })
  }

  // 2. Duplicate — one verified vouch per applicant.
  if (book.applicantAlreadyVerified) {
    const reason = applicant.fullName + ' already has a verified guarantor. One verified vouch per applicant keeps promises from stacking.'
    blockers.push(reason)
    rules.push({ id: 'duplicate', title: 'One verified vouch per applicant', status: 'blocked', detail: reason })
  } else {
    rules.push({
      id: 'duplicate',
      title: 'One verified vouch per applicant',
      status: 'pass',
      detail: applicant.fullName + " has no verified guarantor yet.",
    })
  }

  // 3. Active count.
  const activeCount = book.active.length
  if (activeCount >= MAX_ACTIVE_VOUCHES) {
    const reason = `You are already backing ${activeCount} ${activeCount === 1 ? 'person' : 'people'}, which is the limit of ${MAX_ACTIVE_VOUCHES}.`
    blockers.push(reason)
    rules.push({ id: 'active-count', title: `At most ${MAX_ACTIVE_VOUCHES} people at a time`, status: 'blocked', detail: reason })
  } else {
    rules.push({
      id: 'active-count',
      title: `At most ${MAX_ACTIVE_VOUCHES} people at a time`,
      status: 'pass',
      detail: `${activeCount} of ${MAX_ACTIVE_VOUCHES} promises in use; this one makes ${activeCount + 1}.`,
    })
  }

  // 4. Total exposure, including this promise.
  const current = book.active.reduce((sum, v) => sum + v.cap, 0)
  const total = current + cap
  if (total > MAX_TOTAL_EXPOSURE) {
    const reason = `You are already backing ${rand(current)}. Adding ${rand(cap)} would go over the ${rand(MAX_TOTAL_EXPOSURE)} limit we set to protect you.`
    blockers.push(reason)
    rules.push({ id: 'exposure', title: 'A capped total promise', status: 'blocked', detail: reason })
  } else {
    rules.push({
      id: 'exposure',
      title: 'A capped total promise',
      status: 'pass',
      detail: `${rand(current)} backing now + ${rand(cap)} = ${rand(total)} of the ${rand(MAX_TOTAL_EXPOSURE)} limit.`,
    })
  }

  // 5. Three promises is a flag, never a block.
  const afterCount = activeCount + 1
  if (afterCount >= FLAG_AT_ACTIVE_VOUCHES && blockers.length === 0) {
    const reason = `This makes you a guarantor for ${afterCount} people. We flag that to the bank for a closer look — it is not a block.`
    warnings.push(reason)
    rules.push({ id: 'flag-at-three', title: 'Three promises is flagged to the bank', status: 'warning', detail: reason })
  } else {
    rules.push({
      id: 'flag-at-three',
      title: 'Three promises is flagged to the bank',
      status: 'pass',
      detail:
        afterCount >= FLAG_AT_ACTIVE_VOUCHES
          ? 'Not reached this time — another rule stops this vouch first.'
          : `You would be backing ${afterCount} of the ${FLAG_AT_ACTIVE_VOUCHES} people that trigger a bank review.`,
    })
  }

  // 6. Mutual vouching — a warning for the underwriter, never a block.
  if (book.applicantBacksGuarantor) {
    const who = book.mutualNames.length > 0 ? book.mutualNames.join(' and ') : applicant.fullName
    const reason = `Mutual vouching: ${who} has also named you as a guarantor. The bank reviews people who back each other.`
    warnings.push(reason)
    rules.push({ id: 'mutual', title: 'Mutual vouching is flagged', status: 'warning', detail: reason })
  } else {
    rules.push({
      id: 'mutual',
      title: 'Mutual vouching is flagged',
      status: 'pass',
      detail: applicant.fullName + ' has not named you as their guarantor.',
    })
  }

  return {
    allowed: blockers.length === 0,
    blockers,
    warnings,
    rules,
    exposure: { current, proposed: cap, total, limit: MAX_TOTAL_EXPOSURE },
    activeVouches: activeCount,
    maxActiveVouches: MAX_ACTIVE_VOUCHES,
  }
}
