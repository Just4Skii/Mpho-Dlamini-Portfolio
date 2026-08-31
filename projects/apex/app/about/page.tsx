import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Operational model, people, quality, safety and reporting — how Apex Facilities Group delivers integrated property services.",
};

export default function AboutPage() {
  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">ABOUT — APEX FACILITIES GROUP</div>
              <h1 className="font-display text-[36px] lg:text-[48px] font-semibold leading-[0.9] tracking-tight mt-3">Operational maturity you can audit. <span className="text-concrete font-light italic">Not just claim.</span></h1>
              <p className="text-[16px] leading-relaxed text-neutral-600 mt-6 max-w-2xl">
                Apex Facilities Group is an independent concept project for a hypothetical South African facilities-management business. It demonstrates how a property-services company operating across Johannesburg, Cape Town, Durban, Pretoria, Gqeberha and Bloemfontein could present operational maturity, technical competence and accountability.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-stone border border-neutral-200 p-6">
                <div className="font-mono text-[11px] tracking-wide text-concrete">AT A GLANCE — CONCEPT</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-neutral-200 pb-2"><span className="text-neutral-600">Model</span><span className="font-medium">Integrated · Multi-trade</span></div>
                  <div className="flex justify-between border-b border-neutral-200 pb-2"><span className="text-neutral-600">Coverage</span><span className="font-medium">South Africa — JHB · CPT · DBN · PTA</span></div>
                  <div className="flex justify-between border-b border-neutral-200 pb-2"><span className="text-neutral-600">Delivery</span><span className="font-medium">Planned + Reactive</span></div>
                  <div className="flex justify-between"><span className="text-neutral-600">Reporting</span><span className="font-medium">Auditable close-out</span></div>
                </div>
                <p className="text-[11px] font-mono text-concrete mt-4">Independent concept project — illustrative, not a real company.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h2 className="font-display text-[26px] font-semibold leading-tight">How we’re structured.</h2>
            <p className="text-[15px] leading-relaxed text-neutral-600 mt-4">
              Not a two-person trades business. Not an inflated corporate claim. Apex is presented as a capable, portfolio-ready operation — large enough to manage programmes, disciplined enough to control a single job.
            </p>
            <div className="mt-8 aspect-[4/3] overflow-hidden bg-neutral-200 border border-neutral-200">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            {[
              { title: "Operational model", desc: "Central coordination with field teams. One programme view, multiple trades, consistent standards." },
              { title: "People", desc: "Vetted, qualified engineers. Competency assessed per discipline; supervision and QA built in." },
              { title: "Quality", desc: "Photo close-out, checklists and peer review — not just ‘job done’." },
              { title: "Safety", desc: "Risk assessments, method statements and permit discipline as standard." },
              { title: "Accountability", desc: "Named account management. You know who owns your portfolio." },
              { title: "Technology & reporting", desc: "Job tracking with status, evidence and reporting — ready for audit, recharge or compliance." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-neutral-200 p-6 flex gap-4">
                <span className="w-8 h-8 bg-ink text-white flex items-center justify-center text-xs font-mono shrink-0">✓</span>
                <div>
                  <h3 className="font-medium text-[15px]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-display text-[22px] font-semibold">Leadership — concept</h2>
            <span className="text-xs font-mono bg-stone border border-neutral-200 px-2.5 py-1">DEMO PROFILES</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Whitaker", role: "Operations Director", bio: "15 years in facilities and housing maintenance — portfolio programmes and compliance." },
              { name: "David Mensah", role: "Head of Building Services", bio: "Electrical & HVAC background — leads technical standards and competency." },
              { name: "Priya Patel", role: "Client Services Lead", bio: "Account management and reporting — the voice property managers hear." },
            ].map((p) => (
              <div key={p.name} className="border border-neutral-200 bg-stone p-6">
                <div className="w-14 h-14 bg-neutral-300 rounded-full overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${Math.floor(Math.random()*40)+10}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="font-medium mt-4">{p.name}</div>
                <div className="text-xs font-mono tracking-wide text-concrete">{p.role.toUpperCase()}</div>
                <p className="text-sm leading-relaxed text-neutral-600 mt-3">{p.bio}</p>
                <p className="text-[11px] font-mono text-concrete mt-3">Fictional profile — portfolio concept</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h2 className="font-display text-[22px] font-semibold">Values — quietly confident.</h2>
            <p className="text-sm leading-relaxed text-neutral-600 mt-3">We let delivery speak. No revolution claims — just dependable execution.</p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {[
              ["Dependable", "We do what we say, when we say."],
              ["Precise", "Right trade, right materials, right documentation."],
              ["Calm", "Urgent doesn’t mean chaotic."],
              ["Accountable", "Named ownership, visible progress."],
              ["Human", "Respectful on site, clear in communication."],
              ["Competent", "Technically assured, without jargon."],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white border border-neutral-200 p-6">
                <div className="font-display font-semibold">{title}</div>
                <div className="text-sm text-neutral-600 mt-1 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-ink text-white p-8">
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-white/40">
            <span className="w-8 h-px bg-amber" />
            ACCREDITATIONS — REPRESENTATIVE FRAMEWORK — ILLUSTRATIVE ONLY
          </div>
          <p className="text-sm text-white/60 mt-3 max-w-3xl">
            Representative accreditation framework — shown for illustrative purposes only. In a live deployment, this section would display verified certifications with links. Included here to demonstrate information architecture for a South African context.
          </p>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10 border border-white/10 mt-6">
            {["Health & Safety", "Quality Management", "Environmental", "Gas Safe", "Electrical Competence", "Fire Safety"].map((a) => (
              <div key={a} className="bg-ink p-4 text-center">
                <div className="text-xs font-mono tracking-wide">{a}</div>
                <div className="text-[11px] text-white/40 mt-1">DEMO</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-8">
        <div className="bg-white border border-neutral-200 p-8 lg:p-10">
          <div className="font-mono text-[11px] tracking-[0.18em] text-concrete">PORTFOLIO NOTE — INDEPENDENT CONCEPT PROJECT</div>
          <p className="text-[15px] leading-relaxed text-neutral-700 mt-4 max-w-3xl">
            Apex Facilities Group is an independent commercial website concept designed and developed from scratch for a hypothetical South African facilities-management business.
          </p>
          <p className="text-[15px] leading-relaxed text-neutral-600 mt-3 max-w-3xl">
            The project explores how a property-services company could structure its online presence around service discovery, sector-specific journeys, case studies, mobile-first enquiry flows and operational credibility.
          </p>
          <p className="text-[15px] leading-relaxed text-neutral-600 mt-3 max-w-3xl">
            The project demonstrates UX strategy, responsive frontend development, conversion-focused information architecture, accessibility, performance-conscious implementation and SEO-ready page structure.
          </p>
          <p className="text-xs font-mono text-concrete mt-6">Customer-facing copy remains realistic; disclosure is intentionally subtle and professional.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-16">
        <div className="bg-amber p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <h3 className="font-display text-[20px] font-semibold">Want to see how we’d support your estate?</h3>
          <Link href="/contact" className="bg-ink text-white px-6 py-3 text-sm font-semibold hover:bg-ink-2 transition-colors shrink-0">Discuss Your Requirements →</Link>
        </div>
      </section>
    </div>
  );
}
