import { useParams } from "react-router-dom";
import { services, projects } from "@/projects/apex/lib/data";
import Link from "@/projects/apex/compat/next";
import { notFound } from "@/projects/apex/compat/next";
import type { Metadata } from "@/projects/apex/compat/next";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: s.name,
    description: s.desc,
  };
}

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.slug === slug);
  if (!service) return notFound();

  const faqs: Record<string, { q: string; a: string }[]> = {
    "reactive-repairs": [
      { q: "How quickly can you attend?", a: "Priority faults are triaged within 2 hours and attended same day where access allows. Standard jobs are scheduled within agreed SLAs." },
      { q: "Do you cover out-of-hours?", a: "Yes — 24/7 coordination with on-call engineers for emergencies. Non-urgent jobs are scheduled for the next working day." },
      { q: "How is completion documented?", a: "Every job is closed with photos, engineer notes and, where relevant, certificates. Reports are issued within one working day." },
    ],
    default: [
      { q: "How do you handle occupied properties?", a: "We coordinate access, communicate clearly with occupants and work to minimise disruption — including out-of-hours where required." },
      { q: "What documentation is provided?", a: "Photos, test results, certificates and job summaries — organised for audit, recharge or compliance reporting." },
      { q: "Can you work across multiple sites?", a: "Yes — we coordinate multi-site delivery with consistent standards, dedicated account management and portfolio reporting." },
    ],
  };

  const currentFaqs = faqs[service.slug] || faqs.default;

  return (
    <div className="bg-stone">
      {/* Hero */}
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SERVICES — {service.category.toUpperCase()}</div>
              <h1 className="font-display text-[34px] lg:text-[44px] font-semibold leading-[0.9] tracking-tight mt-3">{service.name}</h1>
              <p className="text-[16px] leading-relaxed text-neutral-600 mt-5 max-w-xl">{service.desc}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {service.highlights.map((h) => (
                  <span key={h} className="text-xs font-mono bg-stone border border-neutral-200 px-3 py-1.5">{h}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/contact" className="bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-ink-2 transition-colors">Discuss Your Requirements →</Link>
                <a href="tel:+27112345678" className="border border-neutral-300 bg-white px-6 py-3 text-sm font-medium hover:border-ink transition-colors">Need urgent assistance? Call</a>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100 border border-neutral-200">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typical problems */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="font-display text-[22px] font-semibold leading-tight">Typical problems we handle.</h2>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">Clear, practical scope — so you know whether to call us. If it’s not listed, ask — we’ll route it correctly.</p>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
            {[
              "Urgent faults and breakdowns",
              "Wear, damage and deterioration",
              "Compliance and safety issues",
              "Pre-let and void preparation",
              "Diagnosis and root-cause investigation",
              "Follow-on and associated works",
            ].map((item) => (
              <div key={item} className="bg-white border border-neutral-200 p-5 flex gap-3">
                <span className="w-6 h-6 bg-amber flex items-center justify-center text-xs shrink-0">✓</span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Apex handles + Process */}
      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[22px] font-semibold">What Apex handles.</h2>
            <ul className="mt-6 space-y-4">
              {[
                { title: "Coordination", desc: "Single point of contact — we schedule trades, confirm access and keep stakeholders updated." },
                { title: "Attendance", desc: "Qualified, vetted engineers with the right parts and certification." },
                { title: "Completion", desc: "Works tested, site left safe and documentation issued for your records." },
                { title: "Reporting", desc: "Status, costs and next actions visible — without chasing." },
              ].map((r) => (
                <li key={r.title} className="flex gap-4 border-b border-neutral-100 pb-4 last:border-0">
                  <span className="w-8 h-8 bg-ink text-white flex items-center justify-center text-xs font-mono shrink-0">→</span>
                  <div>
                    <div className="font-medium text-sm">{r.title}</div>
                    <div className="text-sm text-neutral-600 leading-relaxed mt-1">{r.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="bg-stone border border-neutral-200 p-6 lg:p-8">
              <div className="font-mono text-[11px] tracking-[0.18em] text-concrete">RESPONSE PROCESS</div>
              <h3 className="font-display text-[20px] font-semibold mt-2">From report to close-out.</h3>
              <ol className="mt-6 space-y-4">
                {[
                    "Report — via phone, email or portal. We log, categorise and confirm priority.",
                    "Triage — trade, parts and access requirements confirmed; ETA communicated.",
                    "Attend — engineer attends, diagnoses and completes where possible first time.",
                    "Document — photos, notes and certificates captured on site.",
                    "Close & report — job closed, stakeholders notified, records issued.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center text-xs font-mono shrink-0">{i + 1}</span>
                    <span className="text-sm leading-relaxed text-neutral-700">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 bg-amber-light border border-amber/20 p-4 text-sm">
                <div className="font-medium">Need urgent assistance?</div>
                <div className="text-neutral-600 mt-1">Call our coordination team — 24/7 triage for reactive faults. Demonstration: +27 (0)11 234 5678</div>
                <Link href="/contact" className="inline-flex mt-3 bg-ink text-white px-4 py-2 text-xs font-medium">Report a repair →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="font-display text-[22px] font-semibold">Capabilities & standards.</h2>
            <p className="text-sm text-neutral-600 leading-relaxed mt-3">
              Representative accreditation framework — illustrative only. Included to demonstrate information architecture for a South African facilities context. Not implying live certification.
            </p>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-3 gap-4">
            {[
              { k: "Health & Safety", v: "Risk assessments & method statements per job" },
              { k: "Quality Management", v: "Photo close-out and QA checks" },
              { k: "Environmental", v: "Waste and material control" },
              { k: "Gas Safety", v: "Gas Safe registered engineers" },
              { k: "Electrical", v: "Qualified & competency-assessed" },
              { k: "Fire Safety", v: "Regulatory inspection standards" },
            ].map((c) => (
              <div key={c.k} className="bg-white border border-neutral-200 p-5">
                <div className="font-mono text-[11px] tracking-wide text-concrete">{c.k.toUpperCase()}</div>
                <div className="text-sm font-medium mt-2">{c.v}</div>
                <div className="text-[11px] font-mono text-concrete mt-2">DEMO · Illustrative</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors served */}
      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12">
          <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SECTORS SERVED</div>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Property Management", "Social Housing", "Commercial Property", "Education", "Healthcare", "Hospitality"].map((s) => (
              <Link key={s} href={`/sectors/${s.toLowerCase().replace(/ /g, "-")}`} className="px-4 py-2 border border-neutral-200 text-sm hover:border-ink hover:bg-ink hover:text-white transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Case study */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12">
        <div className="bg-white border border-neutral-200 overflow-hidden grid lg:grid-cols-12">
          <div className="lg:col-span-5 p-8">
            <div className="font-mono text-[11px] tracking-wide text-concrete">REPRESENTATIVE PROJECT SCENARIO — ILLUSTRATIVE</div>
            <h3 className="font-display text-[20px] font-semibold mt-2">{projects[0].title}</h3>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{projects[0].desc}</p>
            <Link href={`/projects/${projects[0].slug}`} className="inline-flex mt-6 bg-ink text-white px-5 py-2.5 text-sm font-medium">View Scenario →</Link>
          </div>
          <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-neutral-100">
            <img src={projects[0].image} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-16">
        <div className="bg-white border border-neutral-200">
          <div className="p-8 border-b border-neutral-200">
            <h2 className="font-display text-[22px] font-semibold">FAQs</h2>
            <p className="text-sm text-neutral-600 mt-2">Straight answers — no marketing fluff. If you don’t see your question, contact us.</p>
          </div>
          <div className="divide-y divide-neutral-200">
            {currentFaqs.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-[15px]">{f.q}</span>
                  <span className="w-7 h-7 border border-neutral-200 flex items-center justify-center group-open:bg-ink group-open:text-white transition-colors">+</span>
                </summary>
                <p className="text-sm leading-relaxed text-neutral-600 mt-4 pr-10">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="mt-8 bg-ink text-white p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-[20px] font-semibold">Ready to discuss {service.name.toLowerCase()}?</h3>
            <p className="text-sm text-white/60 mt-1">We’ll outline scope, timescales and next steps within one working day.</p>
          </div>
          <Link href="/contact" className="bg-amber text-ink px-6 py-3 text-sm font-semibold hover:bg-amber-hover transition-colors inline-flex items-center gap-2 shrink-0">
            Discuss Your Requirements →
          </Link>
        </div>
      </section>
    </div>
  );
}
