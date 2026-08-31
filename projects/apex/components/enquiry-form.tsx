"use client";
import { useState } from "react";

type Step = 1 | 2 | 3 | 4;

const helpOptions = ["Reactive repair", "Planned maintenance", "Electrical", "HVAC", "Compliance", "Refurbishment", "Multiple services", "Other"];
const propertyOptions = ["Residential portfolio", "Commercial", "Social housing", "Education", "Healthcare", "Hospitality", "Other"];

export default function EnquiryForm() {
  const [step, setStep] = useState<Step>(1);
  const [help, setHelp] = useState<string[]>([]);
  const [property, setProperty] = useState("");
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleHelp = (o: string) => {
    setHelp((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.company.trim()) e.company = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 9) e.phone = "Valid phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canContinue1 = help.length > 0;
  const canContinue2 = !!property;

  const submit = async () => {
    if (!validateStep3()) return;
    // CRM-ready abstraction: submitEnquiry would live in lib/crm.ts
    // await submitEnquiry({ help, property, ...form });
    setSubmitted(true);
    // analytics: enquiry_submitted
    if (typeof window !== "undefined" && (window as any).gtag) {
      // gtag('event', 'enquiry_submitted')
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-neutral-200 p-8 lg:p-10 text-center">
        <div className="w-12 h-12 bg-amber rounded-full flex items-center justify-center mx-auto">✓</div>
        <h3 className="font-display text-[22px] font-semibold mt-4">Thank you — we’ve received your enquiry.</h3>
        <p className="text-sm text-neutral-600 leading-relaxed mt-3 max-w-xl mx-auto">
          Our coordination team will review your requirements and respond within one working day. For urgent faults, please call <a href="tel:+27112345678" className="underline">+27 (0)11 234 5678</a> — demonstration.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-concrete bg-stone px-4 py-2 border border-neutral-200">
          Frontend-only demo — no data stored. CRM integration via <code>submitEnquiry()</code> in lib/crm.ts
        </div>
        <button onClick={() => { setSubmitted(false); setStep(1); setHelp([]); setProperty(""); setForm({ name: "", company: "", email: "", phone: "", message: "" }); }} className="mt-6 text-sm font-medium underline underline-offset-4">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200">
      {/* progress */}
      <div className="border-b border-neutral-200">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4">
          <div className="font-mono text-[11px] tracking-[0.18em] text-concrete">ENQUIRY — STEP {step} OF 4</div>
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? "w-8 bg-ink" : s < step ? "w-6 bg-amber" : "w-6 bg-neutral-200"}`} />
            ))}
          </div>
          <div className="text-xs font-mono text-concrete">{Math.round((step / 4) * 100)}% — {["Requirements","Property","Contact","Details"][step-1]}</div>
        </div>
        <div className="h-px bg-neutral-200">
          <div className="h-px bg-ink transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {step === 1 && (
          <div>
            <h3 className="font-display text-[20px] font-semibold">What can we help with?</h3>
            <p className="text-sm text-concrete mt-1">Select all that apply. This helps us route your enquiry to the right team.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {helpOptions.map((o) => {
                const active = help.includes(o);
                return (
                  <button
                    key={o}
                    onClick={() => toggleHelp(o)}
                    className={`text-left px-4 py-3.5 border text-sm font-medium flex items-center justify-between transition-colors ${active ? "bg-ink text-white border-ink" : "bg-white border-neutral-200 hover:border-ink"}`}
                  >
                    {o} <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${active ? "bg-white text-ink border-white" : "border-neutral-300 text-transparent"}`}>✓</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-8">
              <button disabled={!canContinue1} onClick={() => setStep(2)} className="bg-ink text-white px-6 py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-2 transition-colors flex items-center gap-2">
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-display text-[20px] font-semibold">What type of property?</h3>
            <p className="text-sm text-concrete mt-1">This helps us understand operational constraints and relevant compliance.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {propertyOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => setProperty(o)}
                  className={`text-left px-4 py-3.5 border text-sm font-medium flex items-center justify-between transition-colors ${property === o ? "bg-ink text-white border-ink" : "bg-white border-neutral-200 hover:border-ink"}`}
                >
                  {o} <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${property === o ? "bg-white border-white" : "border-neutral-300"}`}>{property === o && <span className="w-2 h-2 bg-ink rounded-full" />}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setStep(1)} className="text-sm font-medium px-4 py-3 border border-neutral-200 hover:border-ink transition-colors">Back</button>
              <button disabled={!canContinue2} onClick={() => setStep(3)} className="bg-ink text-white px-6 py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-2 transition-colors">Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-display text-[20px] font-semibold">How can we contact you?</h3>
            <p className="text-sm text-concrete mt-1">We’ll respond within one working day. For emergencies, call directly.</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <label className="space-y-1.5">
                <span className="text-xs font-mono tracking-wide">Full name *</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" className={`w-full px-3.5 py-3 border bg-white text-sm outline-none focus:border-ink ${errors.name ? "border-red-400" : "border-neutral-200"}`} />
                {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-mono tracking-wide">Company / organisation *</span>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Example Housing Association" className={`w-full px-3.5 py-3 border bg-white text-sm outline-none focus:border-ink ${errors.company ? "border-red-400" : "border-neutral-200"}`} />
                {errors.company && <span className="text-xs text-red-600">{errors.company}</span>}
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-mono tracking-wide">Email *</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@organisation.co.za" className={`w-full px-3.5 py-3 border bg-white text-sm outline-none focus:border-ink ${errors.email ? "border-red-400" : "border-neutral-200"}`} />
                {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-mono tracking-wide">Phone *</span>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27 82 123 4567" className={`w-full px-3.5 py-3 border bg-white text-sm outline-none focus:border-ink ${errors.phone ? "border-red-400" : "border-neutral-200"}`} />
                {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
              </label>
            </div>
            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setStep(2)} className="text-sm font-medium px-4 py-3 border border-neutral-200 hover:border-ink transition-colors">Back</button>
              <button onClick={() => { if (validateStep3()) setStep(4); }} className="bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-ink-2 transition-colors">Continue →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-display text-[20px] font-semibold">Additional information</h3>
            <p className="text-sm text-concrete mt-1">Share any useful detail — locations, timescales or specific requirements.</p>
            <label className="block mt-6 space-y-1.5">
              <span className="text-xs font-mono tracking-wide">Message (optional)</span>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us about the property, number of sites, access constraints, compliance needs..." className="w-full px-3.5 py-3 border border-neutral-200 bg-white text-sm outline-none focus:border-ink resize-none" />
            </label>
            <div className="mt-4 p-4 bg-stone border border-neutral-200 text-xs leading-relaxed text-neutral-600">
              <div className="font-mono text-[11px] tracking-wide text-ink mb-1">SUMMARY</div>
              <div>Help with: <span className="font-medium text-ink">{help.join(", ") || "—"}</span></div>
              <div>Property: <span className="font-medium text-ink">{property || "—"}</span></div>
              <div>Contact: <span className="font-medium text-ink">{form.name} · {form.company}</span></div>
            </div>
            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setStep(3)} className="text-sm font-medium px-4 py-3 border border-neutral-200 hover:border-ink transition-colors">Back</button>
              <button onClick={submit} className="bg-amber text-ink px-8 py-3 text-sm font-semibold hover:bg-amber-hover transition-colors">Submit enquiry</button>
            </div>
            <p className="text-[11px] font-mono text-concrete mt-4">By submitting, you agree we may contact you regarding your enquiry. Demo form — no data is stored. Integration point: <code>submitEnquiry()</code>.</p>
          </div>
        )}
      </div>
    </div>
  );
}
