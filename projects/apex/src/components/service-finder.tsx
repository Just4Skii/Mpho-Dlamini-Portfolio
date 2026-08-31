import { useState } from "react";
import Link from "@/projects/apex/compat/next";

const options = {
  property: ["Residential portfolio", "Commercial", "Social housing", "Education", "Healthcare", "Hospitality", "Other"],
  issue: ["Reactive repair", "Planned maintenance", "Electrical fault", "HVAC", "Plumbing", "Gas", "Damp & mould", "Fire door", "Refurbishment", "Multiple / unsure"],
  urgency: ["Emergency (today)", "Urgent (this week)", "Planned (next weeks)", "Programme / quote"],
};

type Rec = { service: string; href: string; next: string; note: string };

function recommend(p: string, i: string, u: string): Rec {
  if (i === "Damp & mould") return { service: "Damp & Mould Remediation", href: "/services/damp-mould", next: "Arrange a diagnostic assessment", note: "We coordinate access, diagnosis and safe remediation with resident liaison." };
  if (i === "Fire door") return { service: "Fire Door Inspection & Maintenance", href: "/services/fire-doors", next: "Book a compliance inspection", note: "Inspection against regulatory standards with remedial works and auditable records." };
  if (i === "HVAC") return { service: "HVAC", href: "/services/hvac", next: "Request an HVAC assessment", note: "Diagnostics, servicing and replacement with minimal operational disruption." };
  if (i === "Electrical fault") return { service: "Electrical Services", href: "/services/electrical", next: "Report the fault for coordinated attendance", note: "Qualified engineers for testing, remedial works and certification." };
  if (i === "Gas") return { service: "Gas Services", href: "/services/gas", next: "Arrange Gas Safe attendance", note: "Gas Safe registered engineers for servicing, repairs and CP12." };
  if (i === "Plumbing") return { service: "Plumbing", href: "/services/plumbing", next: "Report for reactive attendance", note: "Rapid response for leaks, drainage and void preparation." };
  if (i === "Planned maintenance") return { service: "Planned Maintenance", href: "/services/planned-maintenance", next: "Discuss a maintenance programme", note: "Programmed works with reporting and lifecycle planning." };
  if (i === "Refurbishment") return { service: "Refurbishment & Improvement Works", href: "/services/refurbishment", next: "Scope the project with our team", note: "Multi-trade delivery with programme control and quality assurance." };
  if (i === "Reactive repair") return { service: "Reactive Repairs", href: "/services/reactive-repairs", next: u.includes("Emergency") ? "Request emergency coordination" : "Report the repair", note: u.includes("Emergency") ? "24/7 coordination — we prioritise diagnosis and clear communication." : "We handle diagnosis, attendance and completion documentation." };
  return { service: "Integrated Property Services", href: "/services", next: "Discuss your requirements", note: "Tell us more and we’ll recommend the right trade and timescales." };
}

export default function ServiceFinder() {
  const [property, setProperty] = useState("");
  const [issue, setIssue] = useState("");
  const [urgency, setUrgency] = useState("");
  const ready = property && issue && urgency;
  const rec = ready ? recommend(property, issue, urgency) : null;

  const pill = (active: boolean) =>
    `px-3.5 py-2 text-sm border transition-colors text-left leading-tight ${
      active ? "bg-ink text-white border-ink" : "bg-white border-neutral-200 hover:border-ink hover:bg-stone"
    }`;

  return (
    <div className="bg-white border border-neutral-200">
      <div className="grid lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-neutral-200">
          <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-2">SERVICE FINDER — RULES-BASED</div>
          <h3 className="font-display text-[22px] font-semibold leading-tight">What do you need help with?</h3>
          <p className="text-sm text-neutral-600 mt-2">Select the options that best describe your situation. We’ll recommend the relevant service and next step — no AI, just clear routing.</p>

          <div className="mt-8 space-y-6">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-ink mb-3">01 — PROPERTY TYPE</div>
              <div className="flex flex-wrap gap-2">
                {options.property.map((o) => (
                  <button key={o} onClick={() => setProperty(o)} className={pill(property === o)}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-ink mb-3">02 — ISSUE</div>
              <div className="flex flex-wrap gap-2">
                {options.issue.map((o) => (
                  <button key={o} onClick={() => setIssue(o)} className={pill(issue === o)}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-ink mb-3">03 — URGENCY</div>
              <div className="flex flex-wrap gap-2">
                {options.urgency.map((o) => (
                  <button key={o} onClick={() => setUrgency(o)} className={pill(urgency === o)}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!ready && <p className="mt-6 text-xs font-mono text-concrete">Select one option in each row to see a recommendation.</p>}
        </div>

        <div className="lg:col-span-5 bg-stone p-6 lg:p-8 flex flex-col">
          <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">RECOMMENDATION</div>
          {!ready ? (
            <div className="flex-1 flex items-center justify-center border border-dashed border-neutral-300 bg-white p-8 text-center">
              <p className="text-sm text-concrete leading-relaxed">
                Your recommendation will appear here once all three selections are made.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 p-6">
              <div className="text-xs font-mono tracking-wide text-concrete">RECOMMENDED SERVICE</div>
              <div className="font-display text-[20px] font-semibold mt-1">{rec!.service}</div>
              <p className="text-sm text-neutral-600 leading-relaxed mt-3">{rec!.note}</p>
              <div className="mt-5 p-4 bg-amber-light border border-amber/20">
                <div className="text-xs font-mono tracking-wide text-ink/70">SUGGESTED NEXT STEP</div>
                <div className="text-sm font-medium mt-1">{rec!.next}</div>
                <div className="text-xs text-neutral-600 mt-1">
                  For {property.toLowerCase()} · {issue.toLowerCase()} · {urgency.toLowerCase()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Link href={rec!.href} className="bg-ink text-white text-sm font-medium py-3 text-center hover:bg-ink-2 transition-colors">
                  View service
                </Link>
                <Link href="/contact" className="border border-ink text-sm font-medium py-3 text-center hover:bg-ink hover:text-white transition-colors">
                  Discuss requirements
                </Link>
              </div>
              <p className="text-[11px] font-mono text-concrete mt-4">Concept routing — final scope confirmed after assessment.</p>
            </div>
          )}
          <button
            onClick={() => { setProperty(""); setIssue(""); setUrgency(""); }}
            className="mt-4 text-xs font-mono tracking-wide text-concrete hover:text-ink underline underline-offset-4 self-start"
          >
            Reset selections
          </button>
        </div>
      </div>
    </div>
  );
}
