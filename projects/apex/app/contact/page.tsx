import EnquiryForm from "@/components/enquiry-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you need — we’ll outline scope, timescales and next steps within one working day.",
};

export default function ContactPage() {
  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">CONTACT</div>
              <h1 className="font-display text-[36px] lg:text-[48px] font-semibold leading-[0.9] tracking-tight mt-3">Tell us what you need.</h1>
              <p className="text-[16px] leading-relaxed text-neutral-600 mt-6 max-w-xl">
                Whether it’s a single repair or a multi-site programme, we’ll respond within one working day with scope, timescales and next steps.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-ink text-white p-6">
                <div className="font-mono text-[11px] tracking-[0.18em] text-white/50">DIRECT CONTACT — DEMONSTRATION</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="text-white/60 text-xs font-mono">PHONE</div>
                    <a href="tel:+27112345678" className="font-medium hover:text-amber transition-colors">+27 (0)11 234 5678 — demonstration</a>
                    <div className="text-xs text-white/40">Mon–Fri 08:00–18:00 · Emergency 24/7 — illustrative</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-mono">EMAIL</div>
                    <a href="mailto:hello@apexfacilities.example" className="font-medium hover:text-amber transition-colors">hello@apexfacilities.example</a>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-mono">ADDRESS — INDEPENDENT CONCEPT</div>
                    <div className="text-white/80">Apex Facilities Group<br />Johannesburg, South Africa<br />Nationwide — JHB · Cape Town · Durban · Pretoria · Gqeberha · Bloemfontein</div>
                  </div>
                </div>
                <p className="text-[11px] font-mono text-white/30 mt-6">Independent concept project — all contact details are demonstration content.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h2 className="font-display text-[22px] font-semibold">What happens after you enquire?</h2>
            <ol className="mt-6 space-y-4">
              {[
                { t: "We review", d: "Your requirements are routed to the right team — reactive, planned or compliance." },
                { t: "We respond", d: "Within one working day with scope, trades, timescales and reporting approach." },
                { t: "We scope", d: "If needed, we arrange an assessment or survey to confirm scope and costs." },
                { t: "We deliver", d: "Programme agreed, delivery coordinated, documentation issued." },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center text-xs font-mono shrink-0">{i + 1}</span>
                  <div>
                    <div className="font-medium text-sm">{s.t}</div>
                    <div className="text-sm text-neutral-600 leading-relaxed">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 bg-white border border-neutral-200 p-6">
              <div className="font-mono text-[11px] tracking-wide text-concrete">CRM-READY ARCHITECTURE</div>
              <p className="text-sm text-neutral-600 leading-relaxed mt-2">
                This form is frontend-only for the portfolio. Submission is abstracted via <code className="bg-stone border border-neutral-200 px-1 py-0.5 font-mono text-xs">submitEnquiry()</code> in <code className="font-mono text-xs">lib/crm.ts</code> — ready for HubSpot, Salesforce, Zoho or Dynamics. Analytics hooks are documented for <code className="font-mono text-xs">enquiry_started</code>, <code className="font-mono text-xs">enquiry_step_completed</code> and <code className="font-mono text-xs">enquiry_submitted</code>.
              </p>
            </div>

            <div className="mt-6 bg-amber-light border border-amber/20 p-5">
              <div className="font-medium text-sm">Prefer to call?</div>
              <p className="text-sm text-neutral-600 mt-1">For urgent faults, call directly — we triage and dispatch the right trade.</p>
              <a href="tel:+27112345678" className="inline-flex mt-3 bg-ink text-white px-4 py-2 text-sm font-medium">Call +27 (0)11 234 5678</a>
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
