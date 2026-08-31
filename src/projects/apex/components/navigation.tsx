import Link from "@/projects/apex/compat/next";
import { useState, useEffect } from "react";
import { usePathname } from "@/projects/apex/compat/next";

const serviceGroups = [
  {
    label: "PROPERTY SERVICES",
    items: [
      { name: "Reactive Repairs", href: "/services/reactive-repairs" },
      { name: "Planned Maintenance", href: "/services/planned-maintenance" },
      { name: "Property Assessments", href: "/services/property-assessments" },
    ],
  },
  {
    label: "BUILDING SERVICES",
    items: [
      { name: "Electrical", href: "/services/electrical" },
      { name: "HVAC", href: "/services/hvac" },
      { name: "Plumbing", href: "/services/plumbing" },
      { name: "Gas Services", href: "/services/gas" },
    ],
  },
  {
    label: "COMPLIANCE & SAFETY",
    items: [
      { name: "Fire Doors", href: "/services/fire-doors" },
      { name: "Damp & Mould", href: "/services/damp-mould" },
      { name: "Compliance Support", href: "/services/property-assessments" },
    ],
  },
  {
    label: "PROJECT WORKS",
    items: [
      { name: "Refurbishment", href: "/services/refurbishment" },
      { name: "Multi-Trade Works", href: "/services/planned-maintenance" },
    ],
  },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // lock body when mobile open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled || servicesOpen || mobileOpen
            ? "bg-white/95 backdrop-blur-md border-neutral-200"
            : "bg-stone border-transparent"
        }`}
      >
        {/* top bar - contact strip - hidden on mobile */}
        <div className="hidden lg:block border-b border-neutral-200/60 bg-white">
          <div className="mx-auto max-w-[88rem] px-6 lg:px-8 flex items-center justify-between h-7 text-[11px] tracking-wide">
            <div className="flex items-center gap-6 font-mono text-concrete">
              <span className="text-ink font-medium">APEX FACILITIES GROUP</span>
              <span className="hidden xl:inline">Integrated maintenance for portfolios that cannot afford downtime.</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-concrete">
              <a href="tel:+27112345678" className="hover:text-ink transition-colors">+27 (0)11 234 5678 — demonstration</a>
              <span className="w-px h-3 bg-neutral-300" />
              <a href="mailto:hello@apexfacilities.example" className="hover:text-ink transition-colors">hello@apexfacilities.example</a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px] lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="Apex Facilities Group home">
              <div className="w-9 h-9 bg-ink text-white flex items-center justify-center font-display font-bold text-[13px] tracking-widest leading-none">
                AF
              </div>
              <div className="leading-none">
                <div className="font-display font-bold tracking-[0.18em] text-[14px] lg:text-[15px]">APEX</div>
                <div className="font-mono text-[9px] tracking-[0.22em] text-concrete group-hover:text-ink transition-colors -mt-[1px]">FACILITIES GROUP</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
              <div className="relative">
                <button
                  onClick={() => setServicesOpen((v) => !v)}
                  onMouseEnter={() => setServicesOpen(true)}
                  className={`flex items-center gap-2 text-[13px] tracking-wide font-medium uppercase py-2 ${servicesOpen ? "text-ink" : "text-ink/80 hover:text-ink"}`}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                >
                  Services
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </div>

              <Link href="/sectors" className="text-[13px] tracking-wide font-medium uppercase text-ink/80 hover:text-ink transition-colors">
                Sectors
              </Link>
              <Link href="/projects" className="text-[13px] tracking-wide font-medium uppercase text-ink/80 hover:text-ink transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-[13px] tracking-wide font-medium uppercase text-ink/80 hover:text-ink transition-colors">
                About
              </Link>
              <Link href="/insights" className="text-[13px] tracking-wide font-medium uppercase text-ink/80 hover:text-ink transition-colors">
                Insights
              </Link>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden xl:inline-flex text-[13px] font-medium tracking-wide text-ink hover:text-concrete transition-colors px-3 py-2"
              >
                Contact
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-ink text-white px-5 py-[10px] text-[13px] font-medium tracking-wide hover:bg-ink-2 transition-colors"
              >
                Discuss Your Requirements
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.2"/></svg>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] border border-neutral-300 bg-white"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className={`block w-4 h-px bg-ink transition-all ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
              <span className={`block w-4 h-px bg-ink transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-px bg-ink transition-all ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <div
          onMouseLeave={() => setServicesOpen(false)}
          className={`hidden lg:block absolute left-0 right-0 top-full bg-white border-t border-neutral-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden ${
            servicesOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible pointer-events-none"
          }`}
        >
          <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-10">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-3 pr-8 border-r border-neutral-200">
                <div className="font-mono text-[10px] tracking-[0.2em] text-concrete mb-3">SERVICES OVERVIEW</div>
                <Link href="/services" className="font-display text-[22px] leading-[1.1] font-semibold hover:text-amber transition-colors">
                  Services built around the property lifecycle.
                </Link>
                <p className="text-sm text-concrete leading-relaxed mt-3">
                  From a single repair to a multi-site maintenance programme — one operational partner.
                </p>
                <Link href="/services" className="inline-flex items-center gap-2 mt-6 text-[13px] font-medium border-b border-ink pb-1 hover:border-amber hover:text-amber transition-colors">
                  View all services <span aria-hidden>→</span>
                </Link>
              </div>
              <div className="col-span-9 grid grid-cols-4 gap-8">
                {serviceGroups.map((group) => (
                  <div key={group.label}>
                    <div className="font-mono text-[10px] tracking-[0.18em] text-concrete mb-4">{group.label}</div>
                    <ul className="space-y-3">
                      {group.items.map((item) => (
                        <li key={item.href + item.name}>
                          <Link href={item.href} className="text-[14px] font-medium text-ink hover:text-amber transition-colors flex items-center justify-between group">
                            {item.name}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-concrete">↗</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-concrete">
              <span>Need urgent assistance? Call our coordination team — 24/7 response for reactive faults.</span>
              <Link href="/contact" className="text-ink font-medium hover:text-amber">Report a repair →</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-40 transition ${mobileOpen ? "visible" : "invisible"}`}>
        <div onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute right-0 top-0 h-full w-[86%] max-w-[380px] bg-white flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-concrete">MENU</span>
            <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center border border-neutral-200" aria-label="Close menu">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-7">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">SERVICES</div>
              <div className="space-y-5">
                {serviceGroups.map(g => (
                  <div key={g.label}>
                    <div className="text-[11px] font-semibold tracking-wide text-ink/60 mb-2">{g.label}</div>
                    <ul className="space-y-2">
                      {g.items.map(i => (
                        <li key={i.name}><Link href={i.href} className="text-[15px] font-medium text-ink">{i.name}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Link href="/services" className="inline-flex mt-4 text-sm font-medium border border-ink px-4 py-2">View all services</Link>
            </div>
            <nav className="space-y-1 border-t border-neutral-200 pt-6">
              {[
                { label: "Sectors", href: "/sectors" },
                { label: "Projects", href: "/projects" },
                { label: "About", href: "/about" },
                { label: "Insights", href: "/insights" },
                { label: "Contact", href: "/contact" },
              ].map(link => (
                <Link key={link.href} href={link.href} className="flex items-center justify-between py-3 text-[16px] font-medium border-b border-neutral-100">
                  {link.label} <span className="text-concrete">→</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6 border-t border-neutral-200 bg-stone">
            <Link href="/contact" className="flex items-center justify-center gap-2 bg-ink text-white py-4 text-sm font-medium tracking-wide w-full">
              Discuss Your Requirements →
            </Link>
            <div className="mt-4 text-center font-mono text-xs text-concrete">
              <a href="tel:+27112345678">+27 (0)11 234 5678</a> · <a href="mailto:hello@apexfacilities.example">hello@apexfacilities.example</a><br />
              <span className="text-[11px]">Independent concept project — South Africa</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
