import { brands } from "@/projects/kasicart/data/brands";
import Link from "@/projects/kasicart/compat/next";

export const metadata = { title: "Brands — KasiCart" };

export default function BrandsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Directory</p>
          <h1 className="text-[32px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Meet the makers</h1>
          <p className="text-sm text-stone-600 mt-2 max-w-[60ch]">Independent South African brands — fictional concept brands for portfolio demonstration. Browse by category, city or product type. Every brand has a story, a place, and a collection.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/local" className="h-9 px-4 rounded-full border border-[#E8E2D8] bg-white text-sm flex items-center">Browse by city</Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-auto scrollbar-none pb-2 mb-6">
        {["All", "Home", "Fashion", "Beauty & Wellness", "Food & Specialty", "Art & Design", "Tech & Accessories"].map(f=>(
          <span key={f} className="px-4 h-9 rounded-full bg-white border border-[#E8E2D8] text-sm flex items-center shrink-0">{f}</span>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(b=>(
          <Link key={b.slug} href={`/brands/${b.slug}`} className="group rounded-[20px] overflow-hidden bg-white border border-[#E8E2D8] hover:border-[#11110F] flex flex-col">
            <div className="relative h-[180px] bg-[#F5EEE6] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.coverImage} alt={b.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.name} className="w-9 h-9 rounded-full object-cover border-2 border-white" />
                <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium">{b.city}</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-semibold">{b.name}</h3>
              <p className="text-xs tracking-widest uppercase text-stone-500">{b.location}</p>
              <p className="text-sm text-stone-600 mt-2 line-clamp-2 flex-1">{b.story.slice(0,140)}…</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {b.category.map(c=> <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">{c}</span>)}
              </div>
              <p className="text-xs text-stone-500 mt-3">{b.productCount} products · Est. {b.established}</p>
              <span className="mt-3 inline-flex h-8 px-4 rounded-full bg-[#11110F] text-white text-xs items-center w-fit group-hover:bg-black">View brand →</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-[20px] bg-[#F5EEE6] p-6 md:p-8">
        <h2 className="text-[20px] font-semibold" style={{fontFamily:"var(--font-instrument)"}}>Sell on KasiCart?</h2>
        <p className="text-sm text-stone-600 mt-1">We review applications from independent makers every week.</p>
        <Link href="/sell" className="inline-flex mt-4 h-10 px-6 rounded-full bg-[#11110F] text-white text-sm items-center">Apply to sell</Link>
      </section>
    </div>
  );
}
