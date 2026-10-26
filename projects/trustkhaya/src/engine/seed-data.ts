/**
 * Copied verbatim from the TrustKhaya app (lib/seed-data.ts) — the same scoring
 * engine, house geometry and seed data that the real product runs.
 */
/**
 * Deterministic seed data for TrustKhaya.
 *
 * Pure module: no imports, no side effects. Both the seeder
 * (`supabase/seed.ts`) and the vitest suite (`lib/scoring.test.ts`)
 * import from here so raw numbers are tuned in exactly one place.
 *
 * Personas use FIXED UUIDs so a demo reset always restores the same rows.
 */

import type { ScoreResult, SignalInput } from './scoring'

function detId(prefix: number, n: number): string {
  return `${String(prefix).padStart(8, '0')}-0000-0000-0000-${String(n).padStart(12, '0')}`
}

export const PIN = '1234'

export const PERSONA_IDS = {
  thandi: detId(1, 1),
  sipho: detId(1, 2),
  lerato: detId(1, 3),
  bongani: detId(1, 4),
  zanele: detId(1, 5),
  kagiso: detId(1, 6),
  nokuthula: detId(1, 7),
  gogo: detId(1, 11),
  pastor: detId(1, 12),
  nomsa: detId(1, 21),
} as const

export interface ProfileSeedRow {
  id: string
  role: 'applicant' | 'guarantor' | 'underwriter'
  full_name: string
  email: string
  phone: string
  age: number
  town: string
  bio: string
}

export const PROFILES: ProfileSeedRow[] = [
  {
    id: PERSONA_IDS.thandi,
    role: 'applicant',
    full_name: 'Thandi Mkhize',
    email: 'thandi.mkhize@example.co.za',
    phone: '+27825557001',
    age: 22,
    town: 'Durban',
    bio: 'Sells vetkoek on Saturdays and saves with her stokvel every month.',
  },
  {
    id: PERSONA_IDS.sipho,
    role: 'applicant',
    full_name: 'Sipho Dlamini',
    email: 'sipho.dlamini@example.co.za',
    phone: '+27825557002',
    age: 23,
    town: 'Soweto',
    bio: 'Half-time jobs and a willing heart — money comes in, then goes out again.',
  },
  {
    id: PERSONA_IDS.lerato,
    role: 'applicant',
    full_name: 'Lerato Mokoena',
    email: 'lerato.mokoena@example.co.za',
    phone: '+27825557003',
    age: 20,
    town: 'Polokwane',
    bio: 'Just finished matric, saving with three friends since June.',
  },
  {
    id: PERSONA_IDS.bongani,
    role: 'applicant',
    full_name: 'Bongani Ndlovu',
    email: 'bongani.ndlovu@example.co.za',
    phone: '+27825557004',
    age: 24,
    town: 'Pietermaritzburg',
    bio: 'Delivery rider. Steady wallet, perfect spaza record — no guarantor yet.',
  },
  {
    id: PERSONA_IDS.zanele,
    role: 'applicant',
    full_name: 'Zanele Khumalo',
    email: 'zanele.khumalo@example.co.za',
    phone: '+27825557005',
    age: 18,
    town: 'Mthatha',
    bio: 'Brand new. An airtime habit and big plans.',
  },
  {
    id: PERSONA_IDS.kagiso,
    role: 'applicant',
    full_name: 'Kagiso Sithole',
    email: 'kagiso.sithole@example.co.za',
    phone: '+27825557006',
    age: 25,
    town: 'Tembisa',
    bio: 'Approved already — Pastor Michael vouched for him at R2 000.',
  },
  {
    id: PERSONA_IDS.nokuthula,
    role: 'applicant',
    full_name: 'Nokuthula Mabaso',
    email: 'nokuthula.mabaso@example.co.za',
    phone: '+27825557007',
    age: 24,
    town: 'Umlazi',
    bio: 'Approved last month. Pastor Michael backs R2 000 of her account too, which takes his promise to R4 000.',
  },
  {
    id: PERSONA_IDS.gogo,
    role: 'guarantor',
    full_name: 'Gogo Ntombi Zulu',
    email: 'ntombi.zulu@example.co.za',
    phone: '+27825557010',
    age: 58,
    town: 'Durban',
    bio: 'Treasurer of the Siyakhula stokvel for eleven years. She has seen who pays.',
  },
  {
    id: PERSONA_IDS.pastor,
    role: 'guarantor',
    full_name: 'Pastor Michael Nkosi',
    email: 'michael.nkosi@example.co.za',
    phone: '+27825557011',
    age: 49,
    town: 'Soweto',
    bio: 'Pastor for twenty years. Vouches carefully, and only for people he knows.',
  },
  {
    id: PERSONA_IDS.nomsa,
    role: 'underwriter',
    full_name: 'Nomsa Pillay',
    email: 'nomsa.pillay@fnbdemo.example.co.za',
    phone: '+27825557021',
    age: 41,
    town: 'Johannesburg',
    bio: 'FNB Underwriter — Retail Inclusion Desk.',
  },
]

export const STOKVEL_GROUPS: Array<{
  id: string
  applicant_id: string
  group_name: string
  type: 'stokvel' | 'burial_society'
  monthly_amount: number
  tenure_months: number
  months_expected: number
  months_paid: number
  treasurer_name: string
}> = [
  {
    id: detId(201, 1),
    applicant_id: PERSONA_IDS.thandi,
    group_name: 'Siyakhula Savings Club',
    type: 'stokvel',
    monthly_amount: 300,
    tenure_months: 24,
    months_expected: 24,
    months_paid: 23,
    treasurer_name: 'Sbongile Ndlovu',
  },
  {
    id: detId(201, 2),
    applicant_id: PERSONA_IDS.sipho,
    group_name: 'Masibambane Stokvel',
    type: 'stokvel',
    monthly_amount: 250,
    tenure_months: 12,
    months_expected: 12,
    months_paid: 10,
    treasurer_name: 'Fikile Maseko',
  },
  {
    id: detId(201, 3),
    applicant_id: PERSONA_IDS.lerato,
    group_name: 'Polokwane Young Savers',
    type: 'stokvel',
    monthly_amount: 100,
    tenure_months: 3,
    months_expected: 3,
    months_paid: 3,
    treasurer_name: 'Karabo Mokoena',
  },
  {
    id: detId(201, 4),
    applicant_id: PERSONA_IDS.bongani,
    group_name: 'Ukhulisane Savings Circle',
    type: 'stokvel',
    monthly_amount: 400,
    tenure_months: 24,
    months_expected: 24,
    months_paid: 23,
    treasurer_name: 'Mrs Buthelezi',
  },
  {
    id: detId(201, 5),
    applicant_id: PERSONA_IDS.kagiso,
    group_name: 'Tembisa Unity Stokvel',
    type: 'stokvel',
    monthly_amount: 350,
    tenure_months: 18,
    months_expected: 18,
    months_paid: 17,
    treasurer_name: 'Samuel Tshabalala',
  },
  {
    id: detId(201, 6),
    applicant_id: PERSONA_IDS.nokuthula,
    group_name: 'Umlazi Womens Circle',
    type: 'stokvel',
    monthly_amount: 250,
    tenure_months: 14,
    months_expected: 14,
    months_paid: 13,
    treasurer_name: 'Sister Dudu Mabaso',
  },
]

/** The sliding 6-month window used by the scoring engine (deterministic). */
export const MONTHS = ['2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01']

export const WALLET_PROFILES: Array<{
  applicant_id: string
  provider: string
  tenure_months: number
  airtime_data_monthly_avg: number
}> = [
  { applicant_id: PERSONA_IDS.thandi, provider: 'MTN MoMo', tenure_months: 20, airtime_data_monthly_avg: 89 },
  { applicant_id: PERSONA_IDS.sipho, provider: 'Vodacom VodaPay', tenure_months: 12, airtime_data_monthly_avg: 120 },
  { applicant_id: PERSONA_IDS.lerato, provider: 'MTN MoMo', tenure_months: 3, airtime_data_monthly_avg: 45 },
  { applicant_id: PERSONA_IDS.bongani, provider: 'Okapi', tenure_months: 14, airtime_data_monthly_avg: 110 },
  { applicant_id: PERSONA_IDS.kagiso, provider: 'Vodacom VodaPay', tenure_months: 18, airtime_data_monthly_avg: 95 },
  { applicant_id: PERSONA_IDS.nokuthula, provider: 'MTN MoMo', tenure_months: 12, airtime_data_monthly_avg: 80 },
  { applicant_id: PERSONA_IDS.zanele, provider: 'MTN MoMo', tenure_months: 2, airtime_data_monthly_avg: 30 },
]

export interface WalletMonthSeedRow {
  id: string
  applicant_id: string
  month: string
  inflow: number
  outflow: number
  txn_count: number
}

function walletRows(applicantId: string, startIndex: number, rows: Array<[number, number, number]>): WalletMonthSeedRow[] {
  return MONTHS.map((month, i) => ({ id: detId(202, startIndex + i), applicant_id: applicantId, month, inflow: rows[i][0], outflow: rows[i][1], txn_count: rows[i][2] }))
}

export const WALLET_MONTHS: WalletMonthSeedRow[] = [
  // Thandi — stable inflows (~R2.4k–R3.2k), one quiet month for regularity
  ...walletRows(PERSONA_IDS.thandi, 1, [
    [2850, 2600, 14],
    [3150, 2900, 17],
    [2450, 2300, 3],
    [3100, 2900, 19],
    [2600, 2400, 15],
    [3200, 3000, 16],
  ]),
  // Sipho — moderate volatility, always active
  ...walletRows(PERSONA_IDS.sipho, 11, [
    [1500, 1200, 9],
    [2400, 2300, 13],
    [1800, 1750, 7],
    [900, 850, 6],
    [2600, 2400, 11],
    [1400, 1100, 8],
  ]),
  // Lerato — very volatile, spells of quiet
  ...walletRows(PERSONA_IDS.lerato, 21, [
    [1200, 1150, 5],
    [300, 260, 1],
    [900, 880, 4],
    [150, 130, 2],
    [1100, 1050, 6],
    [450, 400, 3],
  ]),
  // Bongani — steady, strong
  ...walletRows(PERSONA_IDS.bongani, 31, [
    [3000, 2800, 11],
    [2600, 2500, 9],
    [2900, 2700, 14],
    [3400, 3300, 10],
    [2800, 2600, 12],
    [3100, 2850, 13],
  ]),
  // Kagiso — calm and consistent
  ...walletRows(PERSONA_IDS.kagiso, 41, [
    [2200, 2100, 8],
    [2500, 2400, 10],
    [2350, 2250, 9],
    [2600, 2500, 12],
    [2400, 2300, 8],
    [2550, 2450, 11],
  ]),
  // Nokuthula — steady shop takings, every month active
  ...walletRows(PERSONA_IDS.nokuthula, 61, [
    [2800, 2700, 12],
    [2950, 2800, 15],
    [2750, 2600, 11],
    [3050, 2900, 16],
    [2850, 2700, 13],
    [2900, 2750, 14],
  ]),
  // Zanele — just airtime money in the last two months
  ...walletRows(PERSONA_IDS.zanele, 51, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [60, 40, 2],
    [85, 60, 1],
  ]),
]

export interface SpazaSeedRow {
  id: string
  applicant_id: string
  shop_name: string
  amount: number
  purchased_on: string
  due_on: string
  repaid_on: string | null
}

function spazaRows(
  applicantId: string,
  shopName: string,
  startIndex: number,
  rows: Array<[number, string, string, string | null]>,
): SpazaSeedRow[] {
  return rows.map(([amount, purchased, due, repaid], i) => ({
    id: detId(203, startIndex + i),
    applicant_id: applicantId,
    shop_name: shopName,
    amount,
    purchased_on: purchased,
    due_on: due,
    repaid_on: repaid,
  }))
}

export const SPAZA_CREDITS: SpazaSeedRow[] = [
  // Thandi — 14 purchases at Mama Zodwa's, 13 repaid on time, 1 late
  ...spazaRows(PERSONA_IDS.thandi, "Mama Zodwa's Tuck Shop", 1, [
    [150, '2025-08-04', '2025-08-11', '2025-08-10'],
    [130, '2025-09-02', '2025-09-09', '2025-09-08'],
    [180, '2025-10-06', '2025-10-13', '2025-10-12'],
    [220, '2025-11-03', '2025-11-10', '2025-11-08'],
    [260, '2025-12-01', '2025-12-08', '2025-12-07'],
    [140, '2026-01-05', '2026-01-12', '2026-01-10'],
    [130, '2026-02-02', '2026-02-09', '2026-02-08'],
    [150, '2026-03-02', '2026-03-09', '2026-03-14'], // late
    [170, '2026-04-06', '2026-04-13', '2026-04-11'],
    [200, '2026-05-04', '2026-05-11', '2026-05-10'],
    [150, '2026-06-01', '2026-06-08', '2026-06-07'],
    [130, '2026-07-06', '2026-07-13', '2026-07-12'],
    [240, '2026-08-03', '2026-08-10', '2026-08-09'],
    [160, '2026-09-07', '2026-09-14', '2026-09-12'],
  ]),
  // Sipho — 10 repayments, 4 late
  ...spazaRows(PERSONA_IDS.sipho, 'Kasi Spaza', 21, [
    [90, '2026-01-10', '2026-01-17', '2026-01-16'],
    [110, '2026-02-08', '2026-02-15', '2026-02-19'], // late
    [70, '2026-03-10', '2026-03-17', '2026-03-15'],
    [85, '2026-04-09', '2026-04-16', '2026-04-21'], // late
    [100, '2026-05-12', '2026-05-19', '2026-05-18'],
    [120, '2026-06-10', '2026-06-17', '2026-06-23'], // late
    [80, '2026-07-09', '2026-07-16', '2026-07-15'],
    [95, '2026-08-08', '2026-08-15', '2026-08-20'], // late
    [130, '2026-09-10', '2026-09-17', '2026-09-16'],
    [105, '2026-10-06', '2026-10-13', '2026-10-12'],
  ]),
  // Bongani — 12 purchases, all repaid on time
  ...spazaRows(PERSONA_IDS.bongani, 'Mthombeni Spaza', 41, [
    [180, '2025-11-03', '2025-11-10', '2025-11-09'],
    [200, '2025-12-03', '2025-12-10', '2025-12-09'],
    [150, '2026-01-06', '2026-01-13', '2026-01-12'],
    [170, '2026-02-05', '2026-02-12', '2026-02-11'],
    [190, '2026-03-04', '2026-03-11', '2026-03-10'],
    [160, '2026-04-07', '2026-04-14', '2026-04-13'],
    [210, '2026-05-06', '2026-05-13', '2026-05-12'],
    [180, '2026-06-04', '2026-06-11', '2026-06-10'],
    [200, '2026-07-07', '2026-07-14', '2026-07-13'],
    [140, '2026-08-05', '2026-08-12', '2026-08-11'],
    [220, '2026-09-03', '2026-09-10', '2026-09-09'],
    [190, '2026-10-06', '2026-10-13', '2026-10-12'],
  ]),
  // Kagiso — 12 repayments, 2 late
  ...spazaRows(PERSONA_IDS.kagiso, 'Sis Maria Superette', 61, [
    [150, '2025-11-01', '2025-11-08', '2025-11-07'],
    [170, '2025-12-02', '2025-12-09', '2025-12-08'],
    [160, '2026-01-04', '2026-01-11', '2026-01-10'],
    [180, '2026-02-03', '2026-02-10', '2026-02-14'], // late
    [150, '2026-03-02', '2026-03-09', '2026-03-08'],
    [190, '2026-04-01', '2026-04-08', '2026-04-07'],
    [170, '2026-05-05', '2026-05-12', '2026-05-11'],
    [160, '2026-06-02', '2026-06-09', '2026-06-13'], // late
    [200, '2026-07-01', '2026-07-08', '2026-07-07'],
    [180, '2026-08-04', '2026-08-11', '2026-08-10'],
    [150, '2026-09-02', '2026-09-09', '2026-09-08'],
    [210, '2026-10-01', '2026-10-08', '2026-10-07'],
  ]),
  // Nokuthula — six purchases, every one on time
  ...spazaRows(PERSONA_IDS.nokuthula, 'Umlazi Corner Spaza', 81, [
    [120, '2026-05-04', '2026-05-11', '2026-05-10'],
    [95, '2026-06-02', '2026-06-09', '2026-06-08'],
    [160, '2026-07-06', '2026-07-13', '2026-07-12'],
    [210, '2026-08-03', '2026-08-10', '2026-08-09'],
    [140, '2026-09-07', '2026-09-14', '2026-09-13'],
    [180, '2026-10-05', '2026-10-12', '2026-10-11'],
  ]),
]

export interface VouchRequestSeedRow {
  id: string
  applicant_id: string
  guarantor_id: string | null
  requested_name: string | null
  requested_phone: string | null
  code: string
  status: 'pending' | 'verified' | 'declined'
  relationship: string | null
  liability_cap: number | null
  identity_confirmed: boolean
  signed_name: string | null
  signed_at: string | null
  created_at: string
}

export const VOUCH_REQUESTS: VouchRequestSeedRow[] = [
  {
    id: detId(204, 1),
    applicant_id: PERSONA_IDS.thandi,
    guarantor_id: null,
    requested_name: 'Gogo Ntombi',
    requested_phone: '+27825557010',
    code: 'TK-THANDI-7K2',
    status: 'pending',
    relationship: null,
    liability_cap: null,
    identity_confirmed: false,
    signed_name: null,
    signed_at: null,
    created_at: '2026-10-20T10:30:00Z',
  },
  {
    id: detId(204, 2),
    applicant_id: PERSONA_IDS.kagiso,
    guarantor_id: PERSONA_IDS.pastor,
    requested_name: 'Pastor Michael Nkosi',
    requested_phone: '+27825557011',
    code: 'TK-KAGISO-4M9',
    status: 'verified',
    relationship: 'church',
    liability_cap: 2000,
    identity_confirmed: true,
    signed_name: 'Pastor Michael Nkosi',
    signed_at: '2026-09-30T09:14:00Z',
    created_at: '2026-09-28T15:00:00Z',
  },
  // Pastor Michael's second promise: he now backs R4 000 of his R5 000
  // limit, which is what makes the "over the limit" block demonstrable.
  {
    id: detId(204, 3),
    applicant_id: PERSONA_IDS.nokuthula,
    guarantor_id: PERSONA_IDS.pastor,
    requested_name: 'Pastor Michael Nkosi',
    requested_phone: '+27825557011',
    code: 'TK-NOKU-9V4',
    status: 'verified',
    relationship: 'church',
    liability_cap: 2000,
    identity_confirmed: true,
    signed_name: 'Pastor Michael Nkosi',
    signed_at: '2026-10-10T09:05:00Z',
    created_at: '2026-10-08T12:00:00Z',
  },
  // The seeded collusion pattern: Sipho and Bongani name EACH OTHER as
  // guarantors. Both stay pending, so neither counts a single point and
  // both target score ranges are untouched — the bank just flags the pair.
  {
    id: detId(204, 4),
    applicant_id: PERSONA_IDS.sipho,
    guarantor_id: null,
    requested_name: 'Bongani Ndlovu',
    requested_phone: '+27825557004',
    code: 'TK-SIPHO-2P8',
    status: 'pending',
    relationship: null,
    liability_cap: null,
    identity_confirmed: false,
    signed_name: null,
    signed_at: null,
    created_at: '2026-10-21T08:10:00Z',
  },
  {
    id: detId(204, 5),
    applicant_id: PERSONA_IDS.bongani,
    guarantor_id: null,
    requested_name: 'Sipho Dlamini',
    requested_phone: '+27825557002',
    code: 'TK-BONGANI-6R3',
    status: 'pending',
    relationship: null,
    liability_cap: null,
    identity_confirmed: false,
    signed_name: null,
    signed_at: null,
    created_at: '2026-10-21T08:12:00Z',
  },
]

export const CONSENTS: Array<{
  id: string
  applicant_id: string
  scope: string
  granted: boolean
  granted_at: string
}> = [
  PERSONA_IDS.thandi,
  PERSONA_IDS.sipho,
  PERSONA_IDS.lerato,
  PERSONA_IDS.bongani,
  PERSONA_IDS.kagiso,
  PERSONA_IDS.nokuthula,
].flatMap((applicant_id, i) => [
  {
    id: detId(205, i + 1),
    applicant_id,
    scope: 'score_signals',
    granted: true,
    granted_at: '2026-10-01T08:00:00Z',
  },
  // U3: five granular scopes, all granted. Absence also means "not
  // withdrawn", so these rows make the privacy page concrete on day one
  // rather than a page of defaults.
  ...['stokvel', 'wallet', 'spaza', 'share_with_guarantor', 'share_with_bank'].map((scope, j) => ({
    id: detId(205, 100 + i * 10 + j),
    applicant_id,
    scope,
    granted: true,
    granted_at: '2026-10-01T08:00:00Z',
  })),
])

export interface ApplicationSeedRow {
  id: string
  applicant_id: string
  status: 'draft' | 'submitted' | 'approved' | 'declined'
  decision_reason: string | null
  decided_by: string | null
  decided_at: string | null
  submitted_at: string | null
}

export const APPLICATIONS: ApplicationSeedRow[] = [
  {
    id: detId(206, 1),
    applicant_id: PERSONA_IDS.thandi,
    status: 'draft',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    submitted_at: null,
  },
  {
    id: detId(206, 2),
    applicant_id: PERSONA_IDS.sipho,
    status: 'submitted',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    submitted_at: '2026-10-18T09:05:00Z',
  },
  {
    id: detId(206, 3),
    applicant_id: PERSONA_IDS.lerato,
    status: 'submitted',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    submitted_at: '2026-10-15T14:40:00Z',
  },
  {
    id: detId(206, 4),
    applicant_id: PERSONA_IDS.bongani,
    status: 'submitted',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    submitted_at: '2026-10-19T07:25:00Z',
  },
  {
    id: detId(206, 5),
    applicant_id: PERSONA_IDS.kagiso,
    status: 'approved',
    decision_reason: 'Strong signals on all four fronts, and a R2 000 guarantor confirms the picture.',
    decided_by: PERSONA_IDS.nomsa,
    decided_at: '2026-10-06T11:12:00Z',
    submitted_at: '2026-10-02T16:20:00Z',
  },
  {
    id: detId(206, 6),
    applicant_id: PERSONA_IDS.nokuthula,
    status: 'approved',
    decision_reason:
      'Fourteen months of steady stokvel payments and a R2 000 guarantor — approved at the R4 000 point of the guarantor cap.',
    decided_by: PERSONA_IDS.nomsa,
    decided_at: '2026-10-12T10:20:00Z',
    submitted_at: '2026-10-09T14:05:00Z',
  },
]

/** Builds the scoring-engine input for one applicant, from seed rows. */
export function signalInputFor(applicantId: string): SignalInput {
  const vouchRow =
    VOUCH_REQUESTS.filter((v) => v.applicant_id === applicantId).find((v) => v.status === 'verified') ??
    VOUCH_REQUESTS.find((v) => v.applicant_id === applicantId)
  const profile = PROFILES.find((p) => p.id === applicantId)
  const walletProfile = WALLET_PROFILES.find((w) => w.applicant_id === applicantId) ?? null
  return {
    stokvels: STOKVEL_GROUPS.filter((s) => s.applicant_id === applicantId).map(({ id: _id, applicant_id: _a, ...row }) => row),
    walletMonths: WALLET_MONTHS.filter((w) => w.applicant_id === applicantId).map(({ id: _id, applicant_id: _a, ...row }) => row),
    walletProfile: walletProfile
      ? { provider: walletProfile.provider, tenure_months: walletProfile.tenure_months, airtime_data_monthly_avg: walletProfile.airtime_data_monthly_avg }
      : null,
    spazaCredits: SPAZA_CREDITS.filter((s) => s.applicant_id === applicantId).map(({ id: _id, applicant_id: _a, ...row }) => row),
    vouch: {
      status: vouchRow ? (vouchRow.status as SignalInput['vouch']['status']) : 'none',
      liability_cap: vouchRow?.liability_cap ?? null,
      guarantor_name: vouchRow?.requested_name ?? null,
    },
  }
}

/** Convenience for tests/docs: the full worked result for a persona. */
export function computePersonaScore(applicantId: string, compute: (i: SignalInput) => ScoreResult): ScoreResult {
  return compute(signalInputFor(applicantId))
}
