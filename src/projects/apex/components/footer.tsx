import Link from "@/projects/apex/compat/next";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="font-mono text-[11px] tracking-[0.2em] text-white/50 mb-3">START A CONVERSATION</div>
            <h2 className="font-display text-[32px] lg:text-[44px] font-semibold leading-[0.95] tracking-tight">
              Have a property<br />requirement?
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-white/70 text-sm lg:text-[15px] leading-relaxed max-w-md lg:ml-auto">
              Whether it&apos;s a single repair or a multi-site programme, our team will outline scope, timescales and next steps within one working day.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 lg:justify-end">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-amber text-ink px-6 py-3 text-sm font-semibold hover:bg-amber-hover transition-colors">
                Let&apos;s talk <span>→</span>
              </Link>
              <a href="tel:+27112345678" className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-sm font-medium hover:bg-white hover:text-ink transition-colors">
                +27 (0)11 234 5678
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white text-ink flex items-center justify-center font-display font-bold text-[13px] tracking-widest">AF</div>
              <div>
                <div className="font-display font-bold tracking-[0.18em] text-[15px] leading-none">APEX</div>
                <div className="font-mono text-[9px] tracking-[0.22em] text-white/50 -mt-[1px]">FACILITIES GROUP</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60 mt-6 max-w-sm">
              Integrated property maintenance, facilities management and building services for organisations that cannot afford operational disruption.
            </p>
            <div className="mt-6 space-y-1 font-mono text-xs text-white/50">
              <p>Independent concept project — portfolio demonstration.</p>
              <p>Apex Facilities Group, Johannesburg, South Africa</p>
              <p>
                <a href="mailto:hello@apexfacilities.example" className="hover:text-white transition-colors">hello@apexfacilities.example</a> · <a href="tel:+27112345678" className="hover:text-white transition-colors">+27 (0)11 234 5678 — demonstration</a>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="font-mono text-[11px] tracking-[0.18em] text-white/40 mb-4">SERVICES</div>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href="/services/reactive-repairs" className="hover:text-white">Reactive Repairs</Link></li>
              <li><Link href="/services/planned-maintenance" className="hover:text-white">Planned Maintenance</Link></li>
              <li><Link href="/services/electrical" className="hover:text-white">Electrical</Link></li>
              <li><Link href="/services/hvac" className="hover:text-white">HVAC</Link></li>
              <li><Link href="/services/plumbing" className="hover:text-white">Plumbing</Link></li>
              <li><Link href="/services/gas" className="hover:text-white">Gas Services</Link></li>
              <li><Link href="/services/fire-doors" className="hover:text-white">Fire Doors</Link></li>
              <li><Link href="/services/damp-mould" className="hover:text-white">Damp & Mould</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="font-mono text-[11px] tracking-[0.18em] text-white/40 mb-4">SECTORS</div>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href="/sectors/property-management" className="hover:text-white">Property Management</Link></li>
              <li><Link href="/sectors/social-housing" className="hover:text-white">Social Housing</Link></li>
              <li><Link href="/sectors/commercial-property" className="hover:text-white">Commercial Property</Link></li>
              <li><Link href="/sectors/education" className="hover:text-white">Education</Link></li>
              <li><Link href="/sectors/healthcare" className="hover:text-white">Healthcare</Link></li>
              <li><Link href="/sectors/hospitality" className="hover:text-white">Hospitality</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="font-mono text-[11px] tracking-[0.18em] text-white/40 mb-4">COMPANY</div>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
              <li><Link href="/insights" className="hover:text-white">Insights</Link></li>
              <li><Link href="/services" className="hover:text-white">All Services</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
            <div className="mt-6 font-mono text-[11px] tracking-[0.18em] text-white/40">ACCREDITATIONS — ILLUSTRATIVE</div>
            <p className="text-xs text-white/50 leading-relaxed mt-2">Representative accreditation framework — illustrative only.</p>
          </div>

          <div className="col-span-2 lg:col-span-2">
            <div className="font-mono text-[11px] tracking-[0.18em] text-white/40 mb-4">CONTACT</div>
            <div className="space-y-3 text-sm text-white/70">
              <p>Johannesburg · South Africa<br />Nationwide — JHB · CPT · DBN · PTA · Gqeberha · Bloemfontein</p>
              <p>Mon–Fri 08:00–18:00<br />Emergency response 24/7 — illustrative</p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-white border-b border-white/20 pb-1 text-sm hover:border-amber hover:text-amber transition-colors">
                Request a quote →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs font-mono text-white/40">
          <p>© 2026 Apex Facilities Group — Independent concept project. Illustrative scenario — all contact details are demonstration content.</p>
          <div className="flex gap-6">
            <span>Privacy — demo</span>
            <span>Terms — demo</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
