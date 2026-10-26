import { useMemo, useState } from 'react'
import { APPLICATIONS, PERSONA_IDS, PROFILES, VOUCH_REQUESTS, signalInputFor } from './engine/seed-data'
import { GUARANTOR_CAPS, WEIGHTS, computeTrustScore, type ScoreResult, type SignalInput } from './engine/scoring'
import { HOUSE_BRICKS, HOUSE_VIEWBOX, allocateBricks, houseLabel, toHousePoints, type HousePoints } from './engine/house'
import {
  MAX_ACTIVE_VOUCHES,
  MAX_TOTAL_EXPOSURE,
  evaluateVouch,
  rand,
  type VouchBook,
  type VouchPerson,
  type VouchRuleOutcome,
} from './engine/safeguards'
import { HOUSE } from './engine/brand'

type VouchStatus = 'none' | 'pending' | 'verified' | 'declined'
interface VouchState {
  status: VouchStatus
  cap: number | null
  guarantorId: string | null
}
type ApplicationStatus = 'draft' | 'submitted' | 'approved' | 'declined'
interface AppState {
  status: ApplicationStatus
  reason?: string
}

const GUARANTOR_NAMES: Record<string, string> = {
  [PERSONA_IDS.gogo]: 'Gogo Ntombi Zulu',
  [PERSONA_IDS.pastor]: 'Pastor Michael Nkosi',
}

const GUARANTOR_IDS = [PERSONA_IDS.gogo, PERSONA_IDS.pastor]
const APPLICANT_IDS = [
  PERSONA_IDS.thandi,
  PERSONA_IDS.sipho,
  PERSONA_IDS.lerato,
  PERSONA_IDS.bongani,
  PERSONA_IDS.zanele,
  PERSONA_IDS.kagiso,
  PERSONA_IDS.nokuthula,
]

function nameOf(id: string): string {
  return PROFILES.find((person) => person.id === id)?.full_name ?? 'Someone'
}

function initialVouches(): Record<string, VouchState> {
  const map: Record<string, VouchState> = {}
  for (const person of PROFILES) map[person.id] = { status: 'none', cap: null, guarantorId: null }
  for (const request of VOUCH_REQUESTS) {
    map[request.applicant_id] = {
      status: request.status,
      cap: request.liability_cap,
      guarantorId: request.guarantor_id,
    }
  }
  return map
}

function initialApps(): Record<string, AppState> {
  const map: Record<string, AppState> = {}
  for (const application of APPLICATIONS) map[application.applicant_id] = { status: application.status }
  return map
}

function inputFor(applicantId: string, vouches: Record<string, VouchState>): SignalInput {
  const base = signalInputFor(applicantId)
  const vouch = vouches[applicantId]
  if (!vouch || vouch.status === 'none') {
    return { ...base, vouch: { status: 'none', liability_cap: null, guarantor_name: null } }
  }
  if (vouch.status === 'verified') {
    return {
      ...base,
      vouch: {
        status: 'verified',
        liability_cap: vouch.cap,
        guarantor_name: vouch.guarantorId ? GUARANTOR_NAMES[vouch.guarantorId] ?? 'Guarantor' : 'Guarantor',
      },
    }
  }
  return { ...base, vouch: { status: vouch.status, liability_cap: vouch.cap, guarantor_name: null } }
}

function personFor(id: string): VouchPerson {
  const person = PROFILES.find((candidate) => candidate.id === id)
  return { id, fullName: person?.full_name ?? 'Applicant', phone: person?.phone ?? null, email: person?.email ?? null }
}

function bookFor(guarantorId: string, applicantId: string, vouches: Record<string, VouchState>): VouchBook {
  const active = Object.entries(vouches)
    .filter(([, vouch]) => vouch.status === 'verified' && vouch.guarantorId === guarantorId && vouch.cap != null)
    .map(([applicant, vouch]) => ({
      applicantId: applicant,
      applicantName: nameOf(applicant),
      cap: vouch.cap as number,
    }))
  return { active, applicantAlreadyVerified: false, applicantBacksGuarantor: false, mutualNames: [] }
}

function Exposure({ current, limit, count }: { current: number; limit: number; count: number }) {
  const pct = Math.min(100, Math.round((current / limit) * 100))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <strong className="num">{rand(current)} of the {rand(limit)} limit</strong>
        <span className="footnote">{count} of {MAX_ACTIVE_VOUCHES} promises in use</span>
      </div>
      <div className="bar" role="img" aria-label={`Backing ${rand(current)} of a ${rand(limit)} limit`}>
        <span style={{ width: `${pct}%`, background: 'var(--clay)' }} />
      </div>
    </div>
  )
}

function House({ points, pending }: { points: HousePoints; pending?: boolean }) {
  const bricks = allocateBricks(points)
  return (
    <svg viewBox={`0 0 ${HOUSE_VIEWBOX.width} ${HOUSE_VIEWBOX.height}`} role="img" aria-label={houseLabel(points)}>
      {HOUSE_BRICKS.map((part, partIndex) => (
        <g key={partIndex}>
          {part.map((brick, index) => {
            const lit = index < bricks[partIndex]
            const isDoor = partIndex === 3
            return (
              <rect
                key={index}
                x={brick.x}
                y={brick.y}
                width={brick.w}
                height={brick.h}
                rx={3}
                fill={lit ? HOUSE.brickDark[partIndex] : HOUSE.unlitDark}
                stroke={!lit && isDoor ? HOUSE.doorStroke : undefined}
                strokeWidth={!lit && isDoor ? 1.5 : undefined}
                strokeDasharray={!lit && isDoor ? '3 3' : undefined}
                strokeOpacity={!lit && isDoor ? (pending ? 1 : 0.55) : undefined}
              />
            )
          })}
        </g>
      ))}
    </svg>
  )
}

const SIGNAL_ICONS: Record<string, string> = { stokvel: '🤝', wallet: '📱', spaza: '🏪', guarantor: '🛡️' }
const SIGNAL_TINTS: Record<string, string> = { stokvel: '#ece9f7', wallet: '#e4e3f8', spaza: '#fdf0d8', guarantor: '#fde8e1' }
const TONE_PILL: Record<string, string> = { good: 'green', ok: 'amber', low: 'rose', none: 'grey' }
const RECOMMENDATION_LABEL: Record<string, string> = {
  approve: 'Approve',
  incomplete: 'Incomplete — needs a guarantor',
  review: 'Send to a human reviewer',
  decline: 'Decline',
}

function ApplicantView({
  applicantId,
  setApplicantId,
  scores,
  vouches,
  apps,
  onApply,
  onSwitchToGuarantor,
}: {
  applicantId: string
  setApplicantId: (id: string) => void
  scores: Record<string, ScoreResult>
  vouches: Record<string, VouchState>
  apps: Record<string, AppState>
  onApply: (id: string) => void
  onSwitchToGuarantor: () => void
}) {
  const person = PROFILES.find((candidate) => candidate.id === applicantId)
  const score = scores[applicantId]
  const vouch = vouches[applicantId]
  const application = apps[applicantId]
  const points = toHousePoints(score.partPoints)
  const pending = vouch?.status === 'pending'
  const verified = vouch?.status === 'verified'
  const firstName = person?.full_name.split(' ')[0] ?? 'there'

  const doorLine = verified
    ? `The door is lit — ${GUARANTOR_NAMES[vouch!.guarantorId ?? ''] ?? 'your guarantor'} is standing behind you.`
    : pending
      ? 'Your door is waiting for Gogo Ntombi to answer.'
      : 'Foundation, walls and roof are up. The door is still unlit — someone you trust can light it.'

  return (
    <div className="fade" style={{ paddingTop: 22 }}>
      <div className="chips" role="group" aria-label="Applicant personas">
        {APPLICANT_IDS.map((id) => {
          const candidate = PROFILES.find((p) => p.id === id)
          const candidateScore = scores[id]
          return (
            <button key={id} className="chip" aria-pressed={id === applicantId} onClick={() => setApplicantId(id)}>
              {candidate?.full_name}
              <span className="pill grey num">{candidateScore?.total ?? 0}</span>
            </button>
          )
        })}
      </div>

      {application?.status === 'approved' ? (
        <div className="card" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
          <span className="pill green">Approved · zero monthly fee</span>
          <h1 style={{ margin: '10px 0 6px' }}>Account approved — your FNB account is ready</h1>
          <p style={{ color: 'var(--mute)' }}>
            Based on a Community Trust Score of {score.total}, the bank approved the account. Next: verify your ID at a
            branch or in the app when it is ready, make your first deposit, and set up your stokvel debit order.
          </p>
        </div>
      ) : null}

      {application?.status === 'declined' ? (
        <div className="card" style={{ borderColor: '#fecdd3', background: '#fff1f2' }}>
          <span className="pill rose">Not approved — yet</span>
          <h1 style={{ margin: '10px 0 6px' }}>Not this time, {firstName}</h1>
          <p style={{ color: 'var(--mute)' }}>
            {application.reason ?? 'The file needs more evidence.'} Nothing is recorded against you. These are the
            changes that would move the answer:
          </p>
          <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--mute)', fontSize: '0.86rem' }}>
            {score.improve.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="hero">
        <div>
          <span className="eyebrow">Community Trust Score</span>
          <h1>Your home is {score.total}% built.</h1>
          <p className="sub">{doorLine}</p>
          <p className="meta">
            Likelihood of keeping your account in good standing: {Math.round(score.probability * 100)}% · confidence{' '}
            {score.confidence} · {score.band.label}
          </p>
        </div>
        <div className="figure">
          <House points={points} pending={pending} />
        </div>
      </section>

      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="card" aria-label="Signals">
          <h2>Where the bricks come from</h2>
          <p className="footnote">Every point is attributed. One brick is one point.</p>
          <div style={{ marginTop: 8 }}>
            {score.signals.map((signal) => (
              <div className="signal" key={signal.key}>
                <span className="icon" style={{ background: SIGNAL_TINTS[signal.key] }} aria-hidden="true">
                  {SIGNAL_ICONS[signal.key]}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3>
                    {signal.label}{' '}
                    <span className={'pill ' + (TONE_PILL[signal.tone] ?? 'grey')}>{signal.points.toFixed(1)} / {signal.weightMax}</span>
                  </h3>
                  <p className="footnote" style={{ marginTop: 4 }}>{signal.statusText}</p>
                  <div className="bar">
                    <span
                      style={{
                        width: `${(signal.points / signal.weightMax) * 100}%`,
                        background: signal.tone === 'none' ? 'var(--line)' : signal.tone === 'good' ? 'var(--strong)' : signal.tone === 'ok' ? 'var(--building)' : 'var(--early)',
                      }}
                    />
                  </div>
                </div>
                <div className="pts num">
                  {Math.round(signal.points)}
                  <small>of {signal.weightMax}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div>
          <section className="card" aria-label="Guarantor">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
              <h2>{verified ? 'Your guarantor' : pending ? 'Waiting on your guarantor' : 'One step away'}</h2>
              <span className={'pill ' + (verified ? 'clay' : 'grey')}>
                {verified ? 'Verified' : pending ? 'Pending' : 'No guarantor'}
              </span>
            </div>
            <p style={{ color: 'var(--mute)', marginTop: 8, fontSize: '0.9rem' }}>
              {verified
                ? `${GUARANTOR_NAMES[vouch!.guarantorId ?? ''] ?? 'Your guarantor'} is backing ${rand(vouch!.cap ?? 0)}. The most they could ever be asked to cover is that cap — nothing more.`
                : pending
                  ? 'Your vouch link is with Gogo Ntombi. When she signs, only the door lights — the rest of your house stays yours.'
                  : 'A guarantor stands behind you with a capped promise, up to 20 of your 100 points. It is not a referral — it is real, limited liability.'}
            </p>
            {!verified ? (
              <button className="btn clay" style={{ marginTop: 14 }} onClick={onSwitchToGuarantor}>
                Open the guarantor view →
              </button>
            ) : null}
          </section>

          <section className="card" aria-label="Next step" style={{ marginTop: 16 }}>
            <h2>Next step</h2>
            {application?.status === 'submitted' ? (
              <p style={{ color: 'var(--mute)', marginTop: 8 }}>
                <span className="pill indigo">With the bank</span> An FNB underwriter is reviewing the file. The
                decision lands on this screen.
              </p>
            ) : application?.status === 'approved' || application?.status === 'declined' ? (
              <p style={{ color: 'var(--mute)', marginTop: 8 }}>Decided. The result is at the top of this page.</p>
            ) : verified ? (
              <>
                <p style={{ color: 'var(--mute)', marginTop: 8, fontSize: '0.9rem' }}>
                  Your guarantor is verified and the system recommends {RECOMMENDATION_LABEL[score.recommendation]}.
                </p>
                <button className="btn primary" style={{ marginTop: 12 }} onClick={() => onApply(applicantId)}>
                  Apply for my free FNB account →
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--mute)', marginTop: 8, fontSize: '0.9rem' }}>
                The system says: <strong>{RECOMMENDATION_LABEL[score.recommendation]}</strong>. A verified guarantor
                completes the file.
              </p>
            )}
          </section>
        </div>
      </div>

      <section className="card" style={{ marginTop: 16 }} aria-label="Explanation">
        <h2>Why — in plain language</h2>
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--mute)', fontSize: '0.9rem' }}>
          {score.because.map((line) => (
            <li key={line} style={{ margin: '5px 0' }}>{line}</li>
          ))}
        </ul>
        <details>
          <summary>How is this calculated?</summary>
          <ul>
            {score.signals.map((signal) => (
              <li key={signal.key}>
                <strong>{signal.label}</strong> — {signal.detail.join(' · ')}
              </li>
            ))}
          </ul>
          <p className="footnote" style={{ marginTop: 8 }}>
            Weights: stokvel {WEIGHTS.stokvel} + wallet {WEIGHTS.wallet} + spaza {WEIGHTS.spaza} + guarantor{' '}
            {WEIGHTS.guarantor} = 100. Score without the guarantor, rebased out of 80: {score.scoreWithoutGuarantor}.
          </p>
        </details>
        <details>
          <summary>What would raise my score</summary>
          <ul>
            {score.improve.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  )
}
function GuarantorView({
  guarantorId,
  setGuarantorId,
  vouches,
  scores,
  onSign,
}: {
  guarantorId: string
  setGuarantorId: (id: string) => void
  vouches: Record<string, VouchState>
  scores: Record<string, ScoreResult>
  onSign: (applicantId: string, guarantorId: string, cap: number) => void
}) {
  const [cap, setCap] = useState<number | null>(1000)
  const applicantId = PERSONA_IDS.thandi
  const applicant = PROFILES.find((person) => person.id === applicantId)
  const applicantScore = scores[applicantId]
  const vouch = vouches[applicantId]
  const input = signalInputFor(applicantId)
  const book = bookFor(guarantorId, applicantId, vouches)
  const evaluation = evaluateVouch(personFor(guarantorId), personFor(applicantId), cap ?? 0, book)
  const currentExposure = book.active.reduce((sum, entry) => sum + entry.cap, 0)
  const backed = book.active

  const chips = [
    input.stokvels[0]
      ? `Pays stokvel on time — ${input.stokvels[0].months_paid} months`
      : 'No stokvel recorded',
    input.walletMonths.length > 0 ? 'Steady wallet income' : 'No wallet recorded',
    input.spazaCredits.length > 0 ? 'Repays spaza credit' : 'No spaza credit',
  ]

  return (
    <div className="fade" style={{ paddingTop: 22 }}>
      <div className="chips" role="group" aria-label="Guarantor personas">
        {GUARANTOR_IDS.map((id) => (
          <button key={id} className="chip" aria-pressed={id === guarantorId} onClick={() => setGuarantorId(id)}>
            {GUARANTOR_NAMES[id]}
            <span className="pill clay num">{rand(bookFor(id, '', vouches).active.reduce((sum, entry) => sum + entry.cap, 0))}</span>
          </button>
        ))}
      </div>

      <div className="grid two">
        <section className="card">
          <span className="pill clay">Waiting on your decision</span>
          <h2 style={{ marginTop: 10 }}>{applicant?.full_name} asked you to vouch</h2>
          <p className="footnote">This is everything you are shown. No amounts, no records.</p>
          <div
            style={{
              marginTop: 14,
              border: '1px solid var(--line)',
              borderLeft: '4px solid var(--clay)',
              borderRadius: 14,
              padding: 14,
            }}
          >
            <strong>{applicant?.full_name.split(' ')[0]}</strong>
            <p className="footnote">{applicant?.town} · age band 18–25</p>
            <p style={{ marginTop: 8 }}>
              <span className="pill grey">Trust Score band: {applicantScore.band.label}</span>
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {chips.map((chip) => (
                <span key={chip} className="pill indigo">{chip}</span>
              ))}
            </div>
          </div>

          <h3 style={{ marginTop: 18 }}>Choose the most you could be asked to cover</h3>
          <div className="grid three" style={{ marginTop: 10 }}>
            {GUARANTOR_CAPS.map((option) => {
              const check = evaluateVouch(personFor(guarantorId), personFor(applicantId), option.cap, book)
              return (
                <button
                  key={option.cap}
                  className="cap"
                  aria-pressed={cap === option.cap}
                  disabled={!check.allowed}
                  onClick={() => setCap(option.cap)}
                >
                  <span className="cap-title">{option.label}</span>
                  <span className="cap-body">
                    {option.cap === 500 ? 'A small promise.' : option.cap === 1000 ? 'A steady promise.' : 'The strongest support.'}
                  </span>
                  {!check.allowed ? <span className="cap-reason">{check.blockers[0]}</span> : null}
                </button>
              )
            })}
          </div>

          {cap != null ? (
            <p className="footnote" style={{ marginTop: 10 }}>
              The most you could ever be asked to cover is {rand(cap)}. Nothing more.
            </p>
          ) : null}

          <button
            className="btn clay"
            style={{ marginTop: 14 }}
            disabled={cap == null || !evaluation.allowed}
            onClick={() => cap != null && onSign(applicantId, guarantorId, cap)}
          >
            Sign and confirm
          </button>

          {evaluation.blockers.length > 0 ? (
            <div className="callout" style={{ marginTop: 12 }}>
              <p className="t">This vouch cannot be signed</p>
              {evaluation.blockers.map((blocker) => (
                <p key={blocker} className="b">{blocker}</p>
              ))}
            </div>
          ) : null}
          {evaluation.warnings.length > 0 ? (
            <div className="callout info" style={{ marginTop: 12 }}>
              {evaluation.warnings.map((warning) => (
                <p key={warning} className="b">{warning}</p>
              ))}
            </div>
          ) : null}
        </section>

        <div>
          <section className="card">
            <h2>Your promise ceiling</h2>
            <p className="footnote" style={{ marginBottom: 10 }}>
              Whatever you promise across everyone, you can never be asked for more than {rand(MAX_TOTAL_EXPOSURE)}.
            </p>
            <Exposure current={currentExposure} limit={MAX_TOTAL_EXPOSURE} count={backed.length} />
            {backed.length > 0 ? (
              <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--mute)', fontSize: '0.86rem' }}>
                {backed.map((entry) => (
                  <li key={entry.applicantId}>
                    {entry.applicantName} — {rand(entry.cap)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="footnote" style={{ marginTop: 10 }}>You are not backing anyone yet.</p>
            )}
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>What you are signing</h2>
            <p className="footnote" style={{ marginTop: 6 }}>
              A demo agreement, not a legally binding contract. It is capped, it is visible to the bank, and it is
              the reason a first account becomes possible.
            </p>
            {vouch?.status === 'verified' ? (
              <p style={{ marginTop: 10 }}>
                <span className="pill green">Signed</span>{' '}
                {GUARANTOR_NAMES[vouch.guarantorId ?? ''] ?? 'A guarantor'} backs {applicant?.full_name.split(' ')[0]} at{' '}
                {rand(vouch.cap ?? 0)}.
              </p>
            ) : (
              <p style={{ marginTop: 10 }} className="footnote">Nothing has been signed yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
function RuleList({ rules }: { rules: VouchRuleOutcome[] }) {
  return (
    <ul className="rules">
      {rules.map((rule) => (
        <li key={rule.id} className={'rule ' + rule.status}>
          <span className="st">{rule.status === 'pass' ? 'PASS' : rule.status === 'warning' ? 'WARN' : 'BLOCKED'}</span>
          <span>
            <strong style={{ fontSize: '0.84rem' }}>{rule.title}</strong>
            <span className="d" style={{ display: 'block', marginTop: 2 }}>{rule.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

const DECLINE_REASONS = [
  'Wallet income is too irregular to underwrite right now',
  'Not enough signal data yet — score below the line',
  'No guarantor, and other signals are not strong enough',
]

function BankView({
  scores,
  vouches,
  apps,
  onDecide,
}: {
  scores: Record<string, ScoreResult>
  vouches: Record<string, VouchState>
  apps: Record<string, AppState>
  onDecide: (applicantId: string, status: ApplicationStatus, reason?: string) => void
}) {
  const rows = APPLICANT_IDS.filter((id) => apps[id] && apps[id].status !== 'draft')
  const [selected, setSelected] = useState<string>(PERSONA_IDS.thandi)
  const [reason, setReason] = useState(DECLINE_REASONS[0])
  const applicantId = rows.includes(selected) ? selected : rows[0]
  const applicant = PROFILES.find((person) => person.id === applicantId)
  const score = scores[applicantId]
  const vouch = vouches[applicantId]
  const application = apps[applicantId]
  const waiting = rows.filter((id) => apps[id].status === 'submitted').length
  const approved = rows.filter((id) => apps[id].status === 'approved').length
  const exposure = Object.entries(vouches)
    .filter(([id, entry]) => entry.status === 'verified' && apps[id]?.status === 'approved')
    .reduce((sum, [, entry]) => sum + (entry.cap ?? 0), 0)

  const checks = (() => {
    if (!vouch || vouch.status !== 'verified' || !vouch.guarantorId || vouch.cap == null) return null
    const book = bookFor(vouch.guarantorId, applicantId, vouches)
    const withoutSelf: VouchBook = {
      ...book,
      active: book.active.filter((entry) => entry.applicantId !== applicantId),
    }
    return evaluateVouch(personFor(vouch.guarantorId), personFor(applicantId), vouch.cap, withoutSelf)
  })()

  return (
    <div className="fade" style={{ paddingTop: 22 }}>
      <div className="grid three" style={{ marginBottom: 16 }}>
        {[
          ['Waiting on decision', waiting],
          ['Approved accounts', approved],
          ['Guaranteed exposure', rand(exposure)],
        ].map(([label, value]) => (
          <div className="card" key={String(label)} style={{ textAlign: 'center' }}>
            <p className="footnote">{label}</p>
            <p className="num" style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 4 }}>{value}</p>
          </div>
        ))}
      </div>

      <section className="card" aria-label="Application queue">
        <h2>The queue</h2>
        <p className="footnote">Live scores recomputed from raw rows. A human always decides.</p>
        <table className="table" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Score</th>
              <th>Band</th>
              <th>Cap</th>
              <th>System</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((id) => {
              const rowScore = scores[id]
              const rowVouch = vouches[id]
              const rowApp = apps[id]
              return (
                <tr key={id} aria-selected={id === applicantId} onClick={() => setSelected(id)}>
                  <td><strong>{nameOf(id)}</strong></td>
                  <td className="num"><strong>{rowScore.total}</strong></td>
                  <td>
                    <span className={'pill ' + (rowScore.band.key === 'strong' ? 'green' : rowScore.band.key === 'building' ? 'amber' : 'rose')}>
                      {rowScore.band.label}
                    </span>
                  </td>
                  <td className="num">{rowVouch?.status === 'verified' && rowVouch.cap ? rand(rowVouch.cap) : '—'}</td>
                  <td>{RECOMMENDATION_LABEL[rowScore.recommendation]}</td>
                  <td>
                    <span className={'pill ' + (rowApp.status === 'approved' ? 'green' : rowApp.status === 'declined' ? 'rose' : 'indigo')}>
                      {rowApp.status === 'approved' ? 'Approved' : rowApp.status === 'declined' ? 'Declined' : 'With the bank'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginTop: 16 }} aria-label="Application detail">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'start' }}>
          <div>
            <h2>{applicant?.full_name}</h2>
            <p className="footnote">{applicant?.town} · {applicant?.age} · live score recomputed just now</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={'pill ' + (score.band.key === 'strong' ? 'green' : score.band.key === 'building' ? 'amber' : 'rose')}>
              {score.total} · {score.band.label}
            </span>
            <span className="pill grey">{score.confidence} confidence</span>
          </div>
        </div>

        <div className="grid two" style={{ marginTop: 14 }}>
          <div>
            <h3>Signals, as the applicant entered them</h3>
            {score.signals.map((signal) => (
              <div className="signal" key={signal.key}>
                <span className="icon" style={{ background: SIGNAL_TINTS[signal.key] }} aria-hidden="true">
                  {SIGNAL_ICONS[signal.key]}
                </span>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{signal.label}</strong>
                  <p className="footnote">{signal.statusText}</p>
                </div>
                <div className="pts num">{Math.round(signal.points)}<small>of {signal.weightMax}</small></div>
              </div>
            ))}
            <p className="footnote" style={{ marginTop: 8 }}>
              Score without the guarantor: <strong>{score.scoreWithoutGuarantor}</strong> of 100 — the fairness check.
            </p>
          </div>

          <div>
            <h3>Guarantor checks</h3>
            {checks ? (
              <>
                <p className="footnote" style={{ marginTop: 4 }}>
                  {GUARANTOR_NAMES[vouch!.guarantorId ?? ''] ?? 'A guarantor'} backs {rand(vouch!.cap ?? 0)} of this file.
                </p>
                <RuleList rules={checks.rules} />
              </>
            ) : (
              <p className="footnote" style={{ marginTop: 4 }}>No verified guarantor on this file, so there is nothing to check.</p>
            )}

            {application?.status === 'submitted' ? (
              <div style={{ marginTop: 16 }}>
                <h3>Decision</h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button className="btn primary" onClick={() => onDecide(applicantId, 'approved')}>
                    Approve · zero-fee account
                  </button>
                  <button className="btn ghost" onClick={() => onDecide(applicantId, 'declined', reason)}>
                    Decline
                  </button>
                </div>
                <label className="footnote" style={{ display: 'block', marginTop: 10 }} htmlFor="decline">
                  Decline reason (shown to the applicant)
                </label>
                <select
                  id="decline"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  style={{ marginTop: 4, padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', width: '100%' }}
                >
                  {DECLINE_REASONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p style={{ marginTop: 14 }}>
                <span className={'pill ' + (application?.status === 'approved' ? 'green' : 'rose')}>
                  {application?.status === 'approved' ? 'Approved' : 'Declined'}
                </span>{' '}
                <span className="footnote">This file has been decided.</span>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
type ExampleKey = 'overLimit' | 'selfVouch' | 'mutual'

function MethodView({ vouches }: { vouches: Record<string, VouchState> }) {
  const [example, setExample] = useState<ExampleKey | null>(null)

  const result = (() => {
    if (!example) return null
    if (example === 'overLimit') {
      const book = bookFor(PERSONA_IDS.pastor, PERSONA_IDS.thandi, vouches)
      return {
        title: 'Pastor Michael → Thandi at R2 000',
        evaluation: evaluateVouch(personFor(PERSONA_IDS.pastor), personFor(PERSONA_IDS.thandi), 2000, book),
      }
    }
    if (example === 'selfVouch') {
      return {
        title: 'Thandi → Thandi at R1 000',
        evaluation: evaluateVouch(personFor(PERSONA_IDS.thandi), personFor(PERSONA_IDS.thandi), 1000, bookFor(PERSONA_IDS.thandi, PERSONA_IDS.thandi, vouches)),
      }
    }
    const book: VouchBook = {
      ...bookFor(PERSONA_IDS.sipho, PERSONA_IDS.bongani, vouches),
      applicantBacksGuarantor: true,
      mutualNames: ['Bongani Ndlovu'],
    }
    return {
      title: 'Sipho → Bongani at R500 (they named each other)',
      evaluation: evaluateVouch(personFor(PERSONA_IDS.sipho), personFor(PERSONA_IDS.bongani), 500, book),
    }
  })()

  return (
    <div className="fade" style={{ paddingTop: 22 }}>
      <div className="grid two">
        <section className="card">
          <h2>The score, in one table</h2>
          <p className="footnote">One brick per point, one hundred bricks in a house.</p>
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr><th>Part</th><th>Signal</th><th>Bricks</th><th>What fills it</th></tr>
            </thead>
            <tbody>
              <tr><td>Foundation</td><td>Stokvel</td><td className="num">{WEIGHTS.stokvel}</td><td className="footnote">tenure and consistency, best group, +0.05 for two groups</td></tr>
              <tr><td>Walls</td><td>Wallet</td><td className="num">{WEIGHTS.wallet}</td><td className="footnote">stability (cv), regularity, tenure</td></tr>
              <tr><td>Roof</td><td>Spaza credit</td><td className="num">{WEIGHTS.spaza}</td><td className="footnote">on-time rate with a 3-day grace, plus depth</td></tr>
              <tr><td>Door</td><td>Guarantor</td><td className="num">{WEIGHTS.guarantor}</td><td className="footnote">verified only: R500 → 0.5, R1 000 → 0.8, R2 000 → 1.0</td></tr>
            </tbody>
          </table>
          <p className="footnote" style={{ marginTop: 10 }}>
            Probability is a logistic of contribution consistency, wallet volatility, spaza timing and the guarantee,
            clamped to 5–97%. Bands: Strong ≥ 70, Building 40–69, Early days &lt; 40. Approve needs 70+ with a verified
            guarantor and 75%+; the score without a guarantor is shown rebased out of 80.
          </p>
        </section>

        <section className="card">
          <h2>Try to break it</h2>
          <p className="footnote">Six rules run before anything is signed. These are the real checks, on the demo rows.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btn ghost" onClick={() => setExample('overLimit')}>Pastor is near his limit</button>
            <button className="btn ghost" onClick={() => setExample('selfVouch')}>Vouch for yourself</button>
            <button className="btn ghost" onClick={() => setExample('mutual')}>The mutual pair</button>
          </div>

          {result ? (
            <div style={{ marginTop: 14 }}>
              <div className={'callout' + (result.evaluation.allowed ? ' info' : '')}>
                <p className="t">{result.evaluation.allowed ? 'Allowed' : 'Blocked'} — {result.title}</p>
                {result.evaluation.blockers.map((blocker) => (
                  <p key={blocker} className="b">{blocker}</p>
                ))}
                {result.evaluation.warnings.map((warning) => (
                  <p key={warning} className="b">⚠ {warning}</p>
                ))}
                <p className="b num">
                  Backing {rand(result.evaluation.exposure.current)} now · with this promise{' '}
                  {rand(result.evaluation.exposure.total)} of {rand(result.evaluation.exposure.limit)}.
                </p>
              </div>
              <RuleList rules={result.evaluation.rules} />
            </div>
          ) : (
            <p className="footnote" style={{ marginTop: 12 }}>Pick one of the three to run the checks.</p>
          )}

          <div className="callout" style={{ marginTop: 16 }}>
            <p className="t">Why this matters</p>
            <p className="b">
              A guarantee is only credible if it is limited, visible and enforced. The limit protects the guarantor;
              the cap protects the applicant; the rules stop one person promising the same money five times.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<'applicant' | 'guarantor' | 'bank' | 'method'>('applicant')
  const [applicantId, setApplicantId] = useState<string>(PERSONA_IDS.thandi)
  const [guarantorId, setGuarantorId] = useState<string>(PERSONA_IDS.gogo)
  const [vouches, setVouches] = useState<Record<string, VouchState>>(initialVouches)
  const [apps, setApps] = useState<Record<string, AppState>>(initialApps)
  const [toast, setToast] = useState<string | null>(null)

  const scores = useMemo(() => {
    const map: Record<string, ScoreResult> = {}
    for (const person of PROFILES) {
      if (person.role !== 'applicant') continue
      map[person.id] = computeTrustScore(inputFor(person.id, vouches))
    }
    return map
  }, [vouches])

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3400)
  }

  const reset = () => {
    setVouches(initialVouches())
    setApps(initialApps())
    setApplicantId(PERSONA_IDS.thandi)
    setGuarantorId(PERSONA_IDS.gogo)
    flash('Demo restored to the seeded story.')
  }

  const sign = (applicant: string, guarantor: string, cap: number) => {
    setVouches((current) => ({ ...current, [applicant]: { status: 'verified', cap, guarantorId: guarantor } }))
    setTab('applicant')
    setApplicantId(applicant)
    flash(GUARANTOR_NAMES[guarantor] + ' signed for ' + rand(cap) + '. The door just lit.')
  }

  return (
    <div>
      <div className="demo-banner">
        <strong>Interactive demo</strong> · simulated South African data · the real scoring engine, running in your browser
      </div>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="2" y="11" width="28" height="19" rx="4" fill="#312e81" />
              <path d="M4 12 L16 3 L28 12" stroke="#E4572E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <rect x="13" y="18" width="6" height="12" rx="2" fill="#FBF7F0" />
            </svg>
            TrustKhaya
          </div>
          <span className="tagline">Your informal financial life, made visible.</span>
          <div className="spacer" style={{ flex: 1 }} />
          <nav className="tabs" aria-label="Sections">
            {(('applicant guarantor bank method').split(' ') as Array<'applicant' | 'guarantor' | 'bank' | 'method'>).map((value) => (
              <button key={value} className="tab" aria-selected={tab === value} onClick={() => setTab(value)}>
                {value === 'applicant' ? 'Applicant' : value === 'guarantor' ? 'Guarantor' : value === 'bank' ? 'FNB desk' : 'The method'}
              </button>
            ))}
          </nav>
          <button className="btn ghost" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={reset}>
            Reset demo
          </button>
        </div>
      </header>
      <main className="shell">
        {tab === 'applicant' ? (
          <ApplicantView
            applicantId={applicantId}
            setApplicantId={setApplicantId}
            scores={scores}
            vouches={vouches}
            apps={apps}
            onApply={(id) => {
              setApps((current) => ({ ...current, [id]: { status: 'submitted' } }))
              flash('Application sent to the FNB underwriting desk.')
            }}
            onSwitchToGuarantor={() => setTab('guarantor')}
          />
        ) : null}
        {tab === 'guarantor' ? (
          <GuarantorView
            guarantorId={guarantorId}
            setGuarantorId={setGuarantorId}
            vouches={vouches}
            scores={scores}
            onSign={sign}
          />
        ) : null}
        {tab === 'bank' ? (
          <BankView
            scores={scores}
            vouches={vouches}
            apps={apps}
            onDecide={(id, status, reason) => {
              setApps((current) => ({ ...current, [id]: { status, reason } }))
              setTab('applicant')
              setApplicantId(id)
              flash(status === 'approved' ? 'Approved. The applicant sees it immediately.' : 'Declined with a written reason.')
            }}
          />
        ) : null}
        {tab === 'method' ? <MethodView vouches={vouches} /> : null}

        <footer style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <p className="footnote">
            TrustKhaya · FNB hackathon prototype · demo data only. Guarantor agreements here are not legally binding.
            The full product adds Supabase persistence, consent per scope, audit history, a portfolio view and a PWA.
          </p>
          <p className="footnote" style={{ marginTop: 10 }}>
            <a href="demo/TrustKhaya_Functional_Demo.mp4" target="_blank" rel="noreferrer">
              Watch the 86-second system demo
            </a>
            {' · '}
            <a href="demo/TrustKhaya_Pitch_Deck.pdf" target="_blank" rel="noreferrer">
              Pitch deck (PDF)
            </a>
          </p>
        </footer>
      </main>

      {toast ? (
        <div
          role="status"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            background: 'var(--ink)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: '0.85rem',
            boxShadow: '0 6px 20px rgba(26,23,54,0.25)',
            zIndex: 50,
            maxWidth: '90vw',
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
