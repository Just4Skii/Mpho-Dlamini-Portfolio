import Link from "@/projects/apex/compat/next";
import { services, projects } from "@/projects/apex/lib/data";
import SectorInteractive from "@/projects/apex/components/sector-interactive";
import BeforeAfter from "@/projects/apex/components/before-after";
import ServiceFinder from "@/projects/apex/components/service-finder";
import EnquiryForm from "@/projects/apex/components/enquiry-form";

export default function Home() {
  return (
    <div className="bg-stone">
      {/* HERO */}
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-0 lg:gap-8 pt-8 lg:pt-12 pb-0">
            {/* Text */}
            <div className="lg:col-span-5 flex flex-col justify-center py-8 lg:py-16">
              <div className="inline-flex items-center gap-3 text-[11px] font-mono tracking-[0.16em] text-concrete mb-6">
                <span className="w-8 h-px bg-amber" />
                INDEPENDENT CONCEPT — SOUTH AFRICAN PORTFOLIOS
              </div>
              <h1 className="font-display text-[36px] sm:text-[42px] lg:text-[52px] font-semibold leading-[0.9] tracking-tight">
                Property maintenance <span className="font-light italic text-concrete">without</span><br />
                the operational<br />
                headaches.
              </h1>
              <p className="text-[16px] lg:text-[17px] leading-relaxed text-neutral-600 mt-6 max-w-[44ch]">
                Integrated repairs, planned maintenance and specialist building services for property teams across South Africa — from Johannesburg to Cape Town. One partner for the entire property lifecycle. <span className="text-xs font-mono text-concrete">Independent concept project.</span>
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3.5 text-sm font-medium hover:bg-ink-2 transition-colors">
                  Discuss Your Requirements <span aria-hidden>→</span>
                </Link>
                <Link href="/services" className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-6 py-3.5 text-sm font-medium hover:border-ink hover:bg-stone transition-colors">
                  Explore Our Services
                </Link>
              </div>
              <div className="mt-10 flex items-start gap-6 pt-6 border-t border-neutral-200">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <div className="text-xs leading-relaxed">
                  <div className="font-medium text-ink">Supporting properties across multiple sectors</div>
                  <div className="text-concrete font-mono text-[11px] tracking-wide">Property management · Social housing · Commercial · Education · Healthcare · Hospitality</div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="lg:col-span-7 relative">
              <div className="relative aspect-[4/3] lg:aspect-[5/4] lg:h-[520px] lg:aspect-auto overflow-hidden bg-neutral-100">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=1000&fit=crop"
                  alt="Commercial property exterior — modern building"
                  className="w-full h-full object-cover"
                />
                {/* overlay card */}
                <div className="absolute bottom-0 left-0 right-0 lg:left-auto lg:right-6 lg:bottom-6 bg-white lg:max-w-[360px] border border-neutral-200 p-5 lg:p-6 shadow-xl">
                  <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-concrete">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    COORDINATION IN PROGRESS
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center divide-x divide-neutral-200">
                    <div>
                      <div className="font-display text-[20px] font-semibold leading-none">24/7</div>
                      <div className="font-mono text-[10px] tracking-wide text-concrete mt-1">RESPONSE</div>
                    </div>
                    <div>
                      <div className="font-display text-[20px] font-semibold leading-none">Multi</div>
                      <div className="font-mono text-[10px] tracking-wide text-concrete mt-1">TRADE</div>
                    </div>
                    <div>
                      <div className="font-display text-[20px] font-semibold leading-none">SA</div>
                      <div className="font-mono text-[10px] tracking-wide text-concrete mt-1">COVERAGE</div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs leading-relaxed text-neutral-600 border-t border-neutral-100 pt-4">
                    Reactive and planned works coordinated from a single point of contact — with clear communication and completion documentation.
                  </div>
                </div>
              </div>
              {/* side label */}
              <div className="hidden lg:flex absolute -right-6 top-12 rotate-90 origin-top-right items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-concrete">
                <span className="w-6 h-px bg-concrete" />
                APEX FACILITIES GROUP — JOHANNESBURG · SOUTH AFRICA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="bg-ink text-white">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10 border-x border-white/10">
            {[
              { k: "01", v: "Multi-Trade Delivery", d: "One partner, many disciplines" },
              { k: "02", v: "Planned & Reactive", d: "Programmes + rapid response" },
              { k: "03", v: "Compliance Focused", d: "Auditable documentation" },
              { k: "04", v: "Nationwide Coverage", d: "Portfolio scale, local attendance" },
            ].map((i) => (
              <div key={i.k} className="px-5 lg:px-8 py-6 lg:py-7">
                <div className="font-mono text-[11px] tracking-[0.2em] text-white/40">{i.k}</div>
                <div className="font-display font-medium text-[15px] mt-1">{i.v}</div>
                <div className="font-mono text-xs text-white/50 mt-1">{i.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BUSINESS PROBLEM */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">THE REALITY FOR PROPERTY TEAMS</div>
            <h2 className="font-display text-[32px] lg:text-[40px] font-semibold leading-[0.95] tracking-tight mt-4">
              One property.<br />
              Dozens of<br />
              <span className="text-concrete font-light italic">moving parts.</span>
            </h2>
            <div className="mt-8 p-6 bg-white border border-neutral-200">
              <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">TYPICAL FRICTION</div>
              <ul className="space-y-3 text-sm leading-relaxed text-neutral-600">
                <li className="flex gap-3"><span className="text-amber mt-1">—</span> Multiple contractors, multiple inboxes, multiple standards of reporting</li>
                <li className="flex gap-3"><span className="text-amber mt-1">—</span> Reactive calls competing with planned programmes for attention</li>
                <li className="flex gap-3"><span className="text-amber mt-1">—</span> Compliance evidence scattered across folders and email threads</li>
                <li className="flex gap-3"><span className="text-amber mt-1">—</span> Occupants chasing updates while teams chase attendance</li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="bg-white border border-neutral-200">
              <div className="p-8 lg:p-10">
                <div className="font-mono text-[11px] tracking-[0.18em] text-amber">THE APEX MODEL — ONE OPERATIONAL PARTNER</div>
                <p className="text-[18px] lg:text-[20px] leading-relaxed font-medium mt-4">
                  Apex Facilities Group exists to remove that operational friction. We coordinate the trades, the timescales and the documentation — so your team can focus on the portfolio, not the chasing.
                </p>
                <p className="text-[15px] leading-relaxed text-neutral-600 mt-4">
                  From a single urgent repair to a multi-site maintenance programme, you have a dedicated point of contact and auditable reporting. Built around the way property teams actually work.
                </p>
                <div className="grid sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-neutral-200">
                  <div>
                    <div className="font-display text-[22px] font-semibold">Single</div>
                    <div className="text-xs font-mono tracking-wide text-concrete">POINT OF CONTACT</div>
                    <div className="text-sm text-neutral-600 mt-2 leading-relaxed">One team coordinating all trades and updates.</div>
                  </div>
                  <div>
                    <div className="font-display text-[22px] font-semibold">Clear</div>
                    <div className="text-xs font-mono tracking-wide text-concrete">COMMUNICATION</div>
                    <div className="text-sm text-neutral-600 mt-2 leading-relaxed">Status, access and completion — without chasing.</div>
                  </div>
                  <div>
                    <div className="font-display text-[22px] font-semibold">Auditable</div>
                    <div className="text-xs font-mono tracking-wide text-concrete">DOCUMENTATION</div>
                    <div className="text-sm text-neutral-600 mt-2 leading-relaxed">Photos, certificates and reports ready for audit.</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-neutral-200 border-t border-neutral-200 bg-stone text-center">
                <div className="py-5">
                  <div className="font-display text-lg font-semibold">From single</div>
                  <div className="font-mono text-[11px] tracking-wide text-concrete">REPAIR → PROGRAMME</div>
                </div>
                <div className="py-5">
                  <div className="font-display text-lg font-semibold">Planned +</div>
                  <div className="font-mono text-[11px] tracking-wide text-concrete">REACTIVE COVER</div>
                </div>
                <div className="py-5">
                  <div className="font-display text-lg font-semibold">Portfolio</div>
                  <div className="font-mono text-[11px] tracking-wide text-concrete">READY REPORTING</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SERVICES</div>
              <h2 className="font-display text-[30px] lg:text-[38px] font-semibold leading-tight tracking-tight mt-3">Services built around the<br />property lifecycle.</h2>
            </div>
            <div className="lg:text-right">
              <p className="text-sm leading-relaxed text-neutral-600 max-w-md">Not twelve identical cards. A clear architecture from reactive to planned, building services to compliance — with the right trade, at the right time.</p>
              <Link href="/services" className="inline-flex items-center gap-2 mt-4 text-sm font-medium border-b border-ink pb-1 hover:text-amber hover:border-amber transition-colors">
                View all services →
              </Link>
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-12 gap-6">
            {/* Featured */}
            <Link href="/services/reactive-repairs" className="lg:col-span-7 group relative overflow-hidden bg-ink text-white min-h-[420px] flex flex-col">
              <img src={services[0].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity group-hover:scale-[1.02] duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="relative mt-auto p-8">
                <div className="inline-flex items-center gap-2 bg-amber text-ink text-[11px] font-mono tracking-wide px-2.5 py-1 font-medium">FEATURED · 24/7 RESPONSE</div>
                <h3 className="font-display text-[26px] lg:text-[30px] font-semibold leading-tight mt-4">Reactive Repairs</h3>
                <p className="text-sm leading-relaxed text-white/80 mt-3 max-w-xl">From urgent faults to unexpected building issues, our teams coordinate diagnosis, attendance and completion with minimal disruption.</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {services[0].highlights.map((h) => (
                    <span key={h} className="text-xs font-mono bg-white/10 border border-white/20 px-2.5 py-1">{h}</span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 mt-6 text-sm font-medium">Explore Reactive Repairs <span className="group-hover:translate-x-1 transition-transform">→</span></div>
              </div>
            </Link>

            {/* stack */}
            <div className="lg:col-span-5 grid gap-6">
              {services.slice(1, 4).map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="group flex gap-5 bg-stone border border-neutral-200 p-5 hover:border-ink hover:bg-white transition-colors">
                  <div className="w-24 h-24 bg-neutral-200 overflow-hidden shrink-0">
                    <img src={s.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] tracking-[0.16em] text-concrete">{s.category.toUpperCase()}</div>
                    <div className="font-display font-semibold text-[17px] leading-tight mt-1 group-hover:text-amber transition-colors">{s.name}</div>
                    <div className="text-sm leading-relaxed text-neutral-600 mt-1 line-clamp-2">{s.short}</div>
                    <div className="text-xs font-medium mt-3 inline-flex items-center gap-1">View service <span className="group-hover:translate-x-0.5 transition-transform">→</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* secondary row */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(4, 7).map((s, idx) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group border border-neutral-200 bg-white p-6 hover:border-ink transition-colors flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="font-mono text-[11px] tracking-[0.18em] text-concrete">0{idx + 5} — {s.category.toUpperCase()}</div>
                  <span className="w-7 h-7 border border-neutral-200 flex items-center justify-center group-hover:bg-ink group-hover:text-white group-hover:border-ink transition-colors">→</span>
                </div>
                <h3 className="font-display text-[18px] font-semibold mt-4">{s.name}</h3>
                <p className="text-sm leading-relaxed text-neutral-600 mt-2 flex-1">{s.short}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-6">
            {services.slice(7).map((s, idx) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group flex items-center justify-between bg-white border border-neutral-200 px-6 py-5 hover:bg-ink hover:text-white hover:border-ink transition-colors">
                <div>
                  <div className="font-mono text-[11px] tracking-wide opacity-60">0{idx + 8} — {s.category.toUpperCase()}</div>
                  <div className="font-medium text-[15px] mt-1">{s.name}</div>
                </div>
                <span className="text-lg">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* REACTIVE DETAIL PREVIEW */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-0 border border-neutral-200 bg-white overflow-hidden">
          <div className="lg:col-span-5 p-8 lg:p-10">
            <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SERVICE DETAIL — PREVIEW</div>
            <h3 className="font-display text-[28px] font-semibold leading-tight mt-3">Reactive Repairs — coordinated, not chaotic.</h3>
            <p className="text-[15px] leading-relaxed text-neutral-600 mt-4">
              From urgent faults to unexpected building issues, our teams coordinate diagnosis, attendance and completion with minimal disruption. Occupants are kept informed; managers receive auditable close-out.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { t: "24/7 response", d: "Coordination centre triages and dispatches the right trade." },
                { t: "Multi-trade", d: "Electrical, plumbing, HVAC, gas and general works." },
                { t: "Clear comms", d: "Access, ETA and completion updates without chasing." },
                { t: "Documentation", d: "Photos and reports ready for audit and recharge." },
              ].map((x) => (
                <div key={x.t} className="border border-neutral-200 bg-stone p-4">
                  <div className="font-medium text-sm">{x.t}</div>
                  <div className="text-xs leading-relaxed text-neutral-600 mt-1">{x.d}</div>
                </div>
              ))}
            </div>
            <Link href="/services/reactive-repairs" className="inline-flex items-center gap-2 mt-8 bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-ink-2 transition-colors">
              Explore Reactive Repairs →
            </Link>
          </div>
          <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-stone p-6 lg:p-8">
            <div className="bg-white border border-neutral-200">
              <div className="grid grid-cols-3 divide-x divide-neutral-200 text-center">
                <div className="py-6">
                  <div className="font-display text-[22px] font-semibold">2 hr</div>
                  <div className="font-mono text-[11px] tracking-wide text-concrete">AVG. TRIAGE</div>
                </div>
                <div className="py-6">
                  <div className="font-display text-[22px] font-semibold">Same day</div>
                  <div className="font-mono text-[11px] tracking-wide text-concrete">PRIORITY ATTEND</div>
                </div>
                <div className="py-6">
                  <div className="font-display text-[22px] font-semibold">Photo</div>
                  <div className="font-mono text-[11px] tracking-wide text-concrete">CLOSE-OUT</div>
                </div>
              </div>
              <div className="p-6">
                <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">RESPONSE PROCESS</div>
                <ol className="space-y-3">
                  {[
                    "Report — phone, email or portal; we log and categorise.",
                    "Triage — we confirm trade, priority and access requirements.",
                    "Attend — qualified engineer attends with relevant parts.",
                    "Complete — repair finished, tested and documented.",
                    "Report — photos and job notes issued for your records.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center text-xs font-mono shrink-0">{i + 1}</span>
                      <span className="leading-relaxed text-neutral-700">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-amber bg-amber-light border border-amber/20 px-3 py-2">
                  <span className="w-2 h-2 bg-amber rounded-full" />
                  Need urgent assistance? Call +27 (0)11 234 5678 — demonstration, 24/7 illustrative.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SECTORS</div>
            <h2 className="font-display text-[30px] lg:text-[38px] font-semibold leading-tight tracking-tight mt-3">Built for the way different properties operate.</h2>
            <p className="text-[15px] leading-relaxed text-neutral-600 mt-4">
              A school, a housing block and a hotel share the same compliance — but not the same operational reality. Our delivery adapts to access, occupancy, safeguarding and commercial constraints.
            </p>
          </div>
          <div className="mt-10">
            <SectorInteractive />
          </div>
        </div>
      </section>

      {/* CASE STUDY — illustrative scenario */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-concrete mb-6">
          <span className="w-8 h-px bg-amber" />
          REPRESENTATIVE PROJECT SCENARIO — ILLUSTRATIVE
        </div>
        <div className="grid lg:grid-cols-12 gap-0 border border-neutral-200 bg-white overflow-hidden">
          <div className="lg:col-span-7 relative">
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[420px] overflow-hidden bg-neutral-100">
              <img src={projects[0].image} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-6 left-6 bg-white px-3 py-1.5 font-mono text-[11px] tracking-wide border border-neutral-200">SCENARIO · PROPERTY MANAGEMENT — ILLUSTRATIVE</div>
            </div>
          </div>
          <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col">
            <h3 className="font-display text-[26px] lg:text-[30px] font-semibold leading-tight">Portfolio maintenance programme — illustrative scenario.</h3>
            <p className="text-sm leading-relaxed text-neutral-600 mt-4">
              Scenario: a hypothetical mixed-tenure portfolio across Gauteng and Western Cape. An 18-week programme exploring coordinated trades, minimal occupant disruption and portfolio-wide reporting — demonstrating how the website communicates operational credibility.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-stone border border-neutral-200 p-4 text-center">
                <div className="font-display text-[24px] font-semibold leading-none">125</div>
                <div className="font-mono text-[11px] tracking-wide text-concrete mt-1">PROPERTIES</div>
              </div>
              <div className="bg-stone border border-neutral-200 p-4 text-center">
                <div className="font-display text-[24px] font-semibold leading-none">18 weeks</div>
                <div className="font-mono text-[11px] tracking-wide text-concrete mt-1">PROGRAMME</div>
              </div>
              <div className="bg-stone border border-neutral-200 p-4 text-center">
                <div className="font-display text-[24px] font-semibold leading-none">1,400+</div>
                <div className="font-mono text-[11px] tracking-wide text-concrete mt-1">WORKS COMPLETED</div>
              </div>
              <div className="bg-amber border border-amber p-4 text-center">
                <div className="font-display text-[24px] font-semibold leading-none">97%</div>
                <div className="font-mono text-[11px] tracking-wide text-ink/70 mt-1">FIRST-TIME FIX</div>
              </div>
            </div>
            <div className="mt-8 space-y-4 text-sm leading-relaxed">
              <div><span className="font-semibold">Scenario:</span> <span className="text-neutral-600">{projects[0].challenge}</span></div>
              <div><span className="font-semibold">Illustrative approach:</span> <span className="text-neutral-600">{projects[0].approach}</span></div>
            </div>
            <Link href="/projects/property-maintenance-programme" className="inline-flex items-center gap-2 mt-8 bg-ink text-white px-6 py-3 text-sm font-medium self-start hover:bg-ink-2 transition-colors">
              View Scenario →
            </Link>
            <p className="text-[11px] font-mono text-concrete mt-4">Illustrative scenario data — representative example, not a completed project.</p>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <div className="font-mono text-[11px] tracking-[0.2em] text-white/40">HOW WE WORK</div>
              <h2 className="font-display text-[30px] lg:text-[36px] font-semibold leading-tight mt-4">A clear process, from first call to continuous improvement.</h2>
              <p className="text-sm leading-relaxed text-white/60 mt-4">No black box. You see what’s planned, what’s in progress and what’s complete — with evidence.</p>
              <Link href="/about" className="inline-flex items-center gap-2 mt-6 text-sm font-medium border border-white/20 px-5 py-2.5 hover:bg-white hover:text-ink transition-colors">
                How we operate →
              </Link>
            </div>
            <div className="lg:col-span-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10 border border-white/10">
                {[
                  { n: "01", t: "Understand", d: "Portfolio, constraints, compliance scope and occupant needs. We listen before we schedule." },
                  { n: "02", t: "Plan", d: "Programme, trades, access windows and communications — agreed and visible." },
                  { n: "03", t: "Deliver", d: "Qualified engineers attend with the right parts. Site control and resident liaison handled." },
                  { n: "04", t: "Report", d: "Photos, certificates and job notes issued. Auditable and ready for recharge or audit." },
                  { n: "05", t: "Improve", d: "Data from completion feeds forward planning — reducing reactive load over time." },
                ].map((s) => (
                  <div key={s.n} className="bg-ink p-6">
                    <div className="font-mono text-amber text-sm tracking-wide">{s.n}</div>
                    <div className="font-display font-semibold text-[16px] mt-2">{s.t}</div>
                    <div className="text-sm leading-relaxed text-white/60 mt-2">{s.d}</div>
                  </div>
                ))}
              </div>
              {/* timeline line for desktop */}
              <div className="hidden lg:flex items-center gap-2 mt-6 font-mono text-[11px] tracking-wide text-white/30">
                <span>UNDERSTAND</span><span className="flex-1 h-px bg-white/10" /><span>PLAN</span><span className="flex-1 h-px bg-white/10" /><span>DELIVER</span><span className="flex-1 h-px bg-white/10" /><span>REPORT</span><span className="flex-1 h-px bg-white/10" /><span>IMPROVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPERATIONAL SCALE */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">OPERATIONAL SCALE</div>
            <h2 className="font-display text-[28px] lg:text-[34px] font-semibold leading-tight mt-3">Capable of portfolio delivery, without losing site-level control.</h2>
            <p className="text-[15px] leading-relaxed text-neutral-600 mt-4">
              We are structured to manage volume while maintaining accountability at the level of a single property. Dedicated account management, coordinated trades and consistent reporting — scaled to your portfolio.
            </p>
            <div className="mt-8 bg-white border border-neutral-200 p-6">
              <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">REPRESENTATIVE CAPABILITY — CONCEPT</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-neutral-100 pb-2"><span className="text-neutral-600">Reactive response</span><span className="font-medium">24/7 triage & coordination</span></div>
                <div className="flex justify-between border-b border-neutral-100 pb-2"><span className="text-neutral-600">Planned programmes</span><span className="font-medium">Multi-site scheduling</span></div>
                <div className="flex justify-between border-b border-neutral-100 pb-2"><span className="text-neutral-600">Trades</span><span className="font-medium">Electrical · HVAC · Plumbing · Gas · General</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">Documentation</span><span className="font-medium">Photo & certificate close-out</span></div>
              </div>
              <p className="text-[11px] font-mono text-concrete mt-4">No inflated claims — capability framed as operational model, not unverifiable volume.</p>
            </div>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            {[
              { title: "Dedicated account management", desc: "One point of contact who knows your portfolio, constraints and preferences." },
              { title: "Multi-site delivery", desc: "Coordinated teams across dispersed sites with consistent standards." },
              { title: "Compliance documentation", desc: "Inspection records, certificates and photo evidence organised for audit." },
              { title: "Completion reporting", desc: "Clear status, costs and next actions — without chasing for updates." },
              { title: "Resident & occupant liaison", desc: "Professional communication that protects your reputation on site." },
              { title: "Programme discipline", desc: "Works sequenced around occupancy and commercial constraints." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-neutral-200 p-6">
                <div className="w-8 h-8 bg-amber flex items-center justify-center text-ink font-mono text-xs font-bold">→</div>
                <h3 className="font-medium text-[15px] mt-4">{item.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE FINDER + BEFORE AFTER */}
      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20 space-y-16">
          <div>
            <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">INTERACTIVE TOOLS</div>
            <h2 className="font-display text-[28px] lg:text-[34px] font-semibold leading-tight mt-3">Find the right service — and see the standard.</h2>
            <p className="text-sm text-neutral-600 mt-3 max-w-2xl">Two portfolio-grade interactions: a rules-based service finder and a before/after remediation comparison. Both work with keyboard, mouse and touch; both respect reduced-motion preferences.</p>
          </div>
          <ServiceFinder />
          <BeforeAfter />
        </div>
      </section>

      {/* ENQUIRY */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">ENQUIRY</div>
            <h2 className="font-display text-[32px] lg:text-[40px] font-semibold leading-[0.95] tracking-tight mt-3">Tell us what<br />you need.</h2>
            <p className="text-[15px] leading-relaxed text-neutral-600 mt-4">
              Structured so we can respond usefully on first contact. Takes about 90 seconds; your enquiry is routed to the right team. Frontend-only demo — CRM integration documented for HubSpot, Salesforce, Zoho or Dynamics.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex gap-3"><span className="w-6 h-6 bg-ink text-white flex items-center justify-center text-xs shrink-0">1</span><span className="leading-relaxed"><strong>What can we help with?</strong> <span className="text-neutral-600">Select services.</span></span></div>
              <div className="flex gap-3"><span className="w-6 h-6 bg-ink text-white flex items-center justify-center text-xs shrink-0">2</span><span className="leading-relaxed"><strong>Property type.</strong> <span className="text-neutral-600">So we understand constraints.</span></span></div>
              <div className="flex gap-3"><span className="w-6 h-6 bg-ink text-white flex items-center justify-center text-xs shrink-0">3</span><span className="leading-relaxed"><strong>Contact.</strong> <span className="text-neutral-600">We respond within one working day.</span></span></div>
              <div className="flex gap-3"><span className="w-6 h-6 bg-ink text-white flex items-center justify-center text-xs shrink-0">4</span><span className="leading-relaxed"><strong>Details.</strong> <span className="text-neutral-600">Anything that helps us scope.</span></span></div>
            </div>
            <div className="mt-8 p-4 bg-white border border-neutral-200">
              <div className="font-mono text-[11px] tracking-wide text-concrete">PREFER TO TALK?</div>
              <div className="text-sm mt-2"><a href="tel:+27112345678" className="font-medium hover:text-amber">+27 (0)11 234 5678</a> <span className="text-concrete">— demonstration</span></div>
              <div className="text-sm"><a href="mailto:hello@apexfacilities.example" className="font-medium hover:text-amber">hello@apexfacilities.example</a></div>
              <div className="text-[11px] font-mono text-concrete mt-2">Johannesburg · South Africa — illustrative contact</div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
