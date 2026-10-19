import React from 'react';
import heroMark from '../assets/hero.png';

const GITHUB_URL = 'https://github.com/Just4Skii/Klarrow';
const MAILTO = 'mailto:Mphojunior6@gmail.com?subject=Klarrow%20-%20Request%20a%20controlled%20demo';

const PROBLEMS = [
  {
    n: '01',
    h: 'Which raw lots entered the plant?',
    p: 'Receiving notes, supplier invoices and delivery records do not share a format. The same lot can appear as 0427, RM-0427 or 0-427.'
  },
  {
    n: '02',
    h: 'Which batches did they become?',
    p: 'Batch sheets mix issue slips, yields and rework lines. Quantities rarely reconcile cleanly across shifts and spreadsheets.'
  },
  {
    n: '03',
    h: 'Which finished lots shipped where?',
    p: 'Dispatch records sit in ledgers, printouts and someone\u2019s inbox, usually with different date and lot conventions per site.'
  },
  {
    n: '04',
    h: 'Where does the evidence break?',
    p: 'During an alert these records are scattered across PDFs, scans, emails and separate systems that were never designed to answer trace questions.'
  }
];

const PIPELINE = [
  {
    n: '01 · Ingest',
    h: 'Evidence intake',
    p: 'PDFs, CSV/TSV, XLSX/XLS, TXT, LOG and EML under 10 MB, hashed with SHA-256. Duplicates are rejected so the record set stays clean.',
    hl: false
  },
  {
    n: '02 · Extract',
    h: 'Deterministic + AI parsing',
    p: 'Structured files go through deterministic parsers. Text evidence can run through a local Llama 3.2 3B for candidate-fact proposals.',
    hl: false
  },
  {
    n: '03 · Ground',
    h: 'Verbatim source grounding',
    p: 'Every claim carries a locator into its source document. Value-in-quote, adjacent-line context, identifier-only and unlocated claims stay distinct. No line-1 fallbacks.',
    hl: true
  },
  {
    n: '04 · Review',
    h: 'Human review desk',
    p: 'Operators confirm, reject or edit proposed facts. An invalidation cascade demotes relationships when supporting evidence is rejected.',
    hl: false
  },
  {
    n: '05 · Relate',
    h: 'Relationship engine',
    p: 'Multi-tier candidate links are proposed across the supply chain: raw lots to batches, batches to finished lots, finished lots to customers.',
    hl: false
  },
  {
    n: '06 · Trace',
    h: 'Dual-path traversal',
    p: 'Two BFS traversals over the same graph, never blended: confirmed scope from human-confirmed links, and possible exposure from candidates and re-review paths.',
    hl: true
  },
  {
    n: '07 · Report',
    h: 'Findings and exports',
    p: 'Gap detection and mass-balance discrepancies with caveats, exported as provenance-carrying HTML, JSON, CSV and five-sheet XLSX workbooks.',
    hl: false
  }
];

const CAPABILITIES = [
  'Investigation workspaces',
  'Evidence ingestion with SHA-256 dedupe',
  'Deterministic structured parsing',
  'Local Llama 3.2 3B candidate extraction',
  'Source-grounded provenance taxonomy',
  'Human fact and relation review',
  'Near-match alias proposals, no auto-merge',
  'Bidirectional multi-tier trace execution',
  'Confirmed scope vs possible exposure',
  'Findings, gaps and mass-balance limits',
  'Append-only audit history',
  'HTML, JSON, CSV and XLSX exports'
];

const AI_ROLES = [
  {
    who: 'The model proposes',
    h: 'Llama 3.2 3B, local',
    p: 'A small local Ollama-hosted model reads supported text evidence and proposes candidate facts. When it is unreachable, deterministic parsing takes over, so the pipeline never blocks on the model.',
    strong: false
  },
  {
    who: 'The human decides',
    h: 'Review as a gate, not a rubber stamp',
    p: 'Proposed facts enter the confirmed record only after operator confirmation with a reason. Rejected evidence demotes anything that relied on it, and nothing is silently merged.',
    strong: false
  },
  {
    who: 'The system preserves',
    h: 'Provenance and uncertainty',
    p: 'Link strength classes, alias ambiguity, rejected histories and audit events are kept apart in an append-only trail, so every confirmed scope can be defended line by line.',
    strong: false
  },
  {
    who: 'The model never decides',
    h: 'No autonomous determinations',
    p: 'Candidate links never promote themselves. Ambiguous identifiers surface as proposals. Safety conclusions stay with the qualified operator.',
    strong: true
  }
];

const EVAL_ROWS: { mode: string; result: React.ReactNode; detail: string }[] = [
  {
    mode: 'Deterministic extraction',
    result: <span className="pill ok">13 / 13 · all scenarios</span>,
    detail: 'All 13 locked ground-truth checks passed across the three authored scenarios, with the model offline.'
  },
  {
    mode: 'Llama-assisted extraction',
    result: (
      <span className="pill part">
        A pass · B pass · C 11 / 13
      </span>
    ),
    detail: 'On the fragmented-evidence scenario, the 3B model left extra candidate links in Candidate state. They remained subject to human review and never auto-confirmed.'
  },
  {
    mode: 'Run 4 baseline',
    result: <span className="pill ok">End-to-end pass</span>,
    detail: 'The preserved baseline scenario demonstrated the full workflow operating on live local Llama inference, from upload to confirmed trace scope.'
  },
  {
    mode: 'Automated test suite',
    result: <span className="pill ok">43 / 43 · 25 / 25</span>,
    detail: 'xUnit integration tests and Playwright end-to-end tests, run in CI on every push and pull request.'
  }
];

const STACK = [
  { b: 'ASP.NET Core · .NET 10', p: 'Layered Web API with OpenAPI docs and a schema-versioned initializer' },
  { b: 'EF Core + SQLite', p: 'Stores, evidence files, per-workspace isolation and append-only audit' },
  { b: 'React 19 + TypeScript', p: 'Vite-built operator workbench with Playwright E2E coverage' },
  { b: 'Llama 3.2 3B · Ollama', p: 'Local, OpenAI-compatible extraction provider with graceful fallback' },
  { b: 'xUnit', p: '43 integration, API and provider tests on isolated temp databases' },
  { b: 'Playwright', p: '25 end-to-end operator-journey tests against the full stack' }
];

const YES = [
  'Investigation aid for documented traceability questions',
  'Human-confirmed evidence with verbatim locators',
  'Separation of confirmed and possible scope',
  'Gap detection, caveats and audit trail',
  'Evaluation on locked synthetic ground truth'
];
const NO = [
  'Food-safety clearance or product release authority',
  'Mandatory withdrawal or regulatory compliance decisions',
  'A certified food-safety system, recall authority or legal counsel',
  'An ERP or traceability-system replacement',
  'Judgment of real-world product safety'
];

export const CaseStudy: React.FC = () => {
  return (
    <main>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="w">
          <div className="heroG">
            <div>
              <span className="eyebrow"><i />Prototype / MVP · Local-first · Llama 3.2 3B</span>
              <h1>Klarrow<span className="glow">.</span></h1>
              <p className="lead">
                An <b>evidence-reconciliation workbench</b> for food-safety and QA teams answering traceability
                questions from records that were never designed to cooperate: invoices, batch sheets, ledgers,
                emails and scans.
              </p>
              <div className="stack">
                <span>ASP.NET Core · .NET 10</span>
                <span>React 19 + TypeScript</span>
                <span>EF Core + SQLite</span>
                <span>Ollama · Llama 3.2 3B</span>
              </div>
              <div className="cta">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn p">
                  View source <span>↗</span>
                </a>
                <a href={MAILTO} className="btn g">Request a controlled demo</a>
              </div>
            </div>
            <div className="shotWrap">
              <img src={heroMark} alt="Klarrow product mark" />
              <div className="shotCap m">
                <span>Klarrow / product mark</span>
              </div>
            </div>
          </div>

          <div className="banner">
            <i />
            <p>
              <b>Synthetic demonstration data only.</b> Everything shown here runs on authored fictional records.
              Klarrow is an investigation aid, not a food-safety clearance, withdrawal or compliance system.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section id="problem">
        <div className="w">
          <div className="m kick">The problem</div>
          <h2>A recall question, answered by documents that argue with each other.</h2>
          <p className="sub">
            During a contamination alert or customer complaint, an FSQA team has to stand up a defensible answer from
            whatever paperwork already exists on the floor. Four questions decide the scope:
          </p>
          <div className="pg">
            {PROBLEMS.map(p => (
              <div className="pcard" key={p.n}>
                <span className="pn m">{p.n}</span>
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PIPELINE ============ */}
      <section id="pipeline">
        <div className="w">
          <div className="m kick">How it works</div>
          <h2>Projection to confirmation, with the human at the gate.</h2>
          <p className="sub">
            Klarrow does not ask teams to replace their ERP or traceability system. It ingests the evidence they
            already have and builds a reviewable trace from it:
          </p>
          <div className="pipe">
            {PIPELINE.map(s => (
              <div className={`step${s.hl ? ' hl' : ''}`} key={s.n}>
                <span className="num">{s.n}</span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
          <div className="pathnote">
            <span><b className="pn-c">Confirmed scope</b> · human-confirmed links only</span>
            <span><b className="pn-p">Possible exposure</b> · candidates &amp; re-review paths, always flagged</span>
          </div>
        </div>
      </section>

      {/* ============ CAPABILITIES ============ */}
      <section id="capabilities">
        <div className="w">
          <div className="m kick">Capabilities</div>
          <h2>What the workbench covers.</h2>
          <div className="capg">
            {CAPABILITIES.map(c => <div className="cap" key={c}>{c}</div>)}
          </div>
        </div>
      </section>

      {/* ============ AI DISCIPLINE ============ */}
      <section id="ai">
        <div className="w">
          <div className="m kick">AI with discipline</div>
          <h2>A model that proposes. A person that decides.</h2>
          <p className="sub">
            The design goal was simple: let a small local model widen the evidence funnel, while the official record
            can only grow through grounded, human-reviewed facts.
          </p>
          <div className="aiGrid">
            {AI_ROLES.map(a => (
              <div className="ai" key={a.who}>
                <span className="who m">{a.who}</span>
                <h3>{a.h}</h3>
                <p>{a.p}</p>
              </div>
            ))}
          </div>
          <blockquote className="aiQuote">
            <b>Llama does not make food-safety decisions.</b> Candidate links never promote themselves; ambiguity
            surfaces as proposals; the confidence of a confirmed scope is the confidence of the evidence behind it.
          </blockquote>
        </div>
      </section>

      {/* ============ EVALUATION ============ */}
      <section id="evaluation">
        <div className="w">
          <div className="m kick">Evaluation</div>
          <h2>Measured against locked ground truth.</h2>
          <p className="sub">
            Three authored synthetic scenarios with hash-verified ground truth, run in two modes, plus the preserved
            single-scenario baseline. Latest consolidated evaluation: <span className="m">eval-dev-20261019-final</span>.
          </p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr><th scope="col">Mode / suite</th><th scope="col">Result</th><th scope="col">Observation</th></tr>
              </thead>
              <tbody>
                {EVAL_ROWS.map(r => (
                  <tr key={r.mode}>
                    <td>{r.mode}</td>
                    <td>{r.result}</td>
                    <td>{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scopeNote">
            These are controlled synthetic-scenario results. They demonstrate workflow operation and evaluation
            discipline; they do not establish general accuracy, customer demand, time savings, or production readiness.
          </p>
        </div>
      </section>

      {/* ============ ENGINEERING ============ */}
      <section id="engineering">
        <div className="w">
          <div className="m kick">Engineering</div>
          <h2>Built like production software, honestly labelled as a prototype.</h2>
          <div className="engr">
            {STACK.map(s => (
              <div key={s.b}>
                <b>{s.b}</b>
                {s.p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BOUNDARIES ============ */}
      <section id="boundaries">
        <div className="w">
          <div className="m kick">Status &amp; boundaries</div>
          <h2>What Klarrow is, and what it refuses to claim.</h2>
          <div className="bound">
            <div className="bcard yes">
              <h3>Designed for</h3>
              <ul>{YES.map(y => <li key={y}>{y}</li>)}</ul>
            </div>
            <div className="bcard no">
              <h3>Explicitly not</h3>
              <ul>{NO.map(n => <li key={n}>{n}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SANDBOX / CTA ============ */}
      <section id="sandbox">
        <div className="w">
          <div className="sandbox">
            <div className="m kick">Interactive demo</div>
            <h2>A synthetic sandbox is on the workbench.</h2>
            <p>
              The next build exposes the seeded <b>Savanna Bites</b> demonstration investigation as a public sandbox:
              pre-loaded fictional evidence only, no document uploads, a persistent synthetic-data banner, and a
              resettable workspace. Until then, the full product lives in the repository, and demos happen by request.
            </p>
            <div className="sandboxChips">
              <span><i />Pre-seeded synthetic workspace</span>
              <span><i />No public uploads, by design</span>
              <span><i />Resettable demo state</span>
              <span><i />Pilot installs disable demo seed via Seed:DemoEnabled</span>
            </div>
            <div className="final">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn p">View the source <span>↗</span></a>
              <a href={MAILTO} className="btn g">Request a controlled demo</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="w">
          <span>Klarrow · an independent full-stack product by <a href="https://graffgrid.co.za" target="_blank" rel="noopener noreferrer">Mpho Dlamini</a> · GraffGrid</span>
          <span className="m">Prototype · synthetic data · not a certification</span>
        </div>
      </footer>
    </main>
  );
};

export default CaseStudy;
