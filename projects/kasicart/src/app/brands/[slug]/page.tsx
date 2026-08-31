import { useParams } from "react-router-dom";
import { brands } from "@/projects/kasicart/data/brands";
import { products } from "@/projects/kasicart/data/products";
import Link from "@/projects/kasicart/compat/next";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import { notFound } from "@/projects/kasicart/compat/next";

export function generateStaticParams() { return brands.map(b=> ({ slug: b.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = brands.find(x=>x.slug===slug);
  return { title: b ? `${b.name} — KasiCart` : "Brand not found" };
}

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const brand = brands.find(b=> b.slug===slug);
  if (!brand) return notFound();
  const brandProducts = products.filter(p=> p.brandSlug===slug);
  return (
    <div>
      <div className="relative h-[280px] md:h-[360px] bg-[#F5EEE6] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.coverImage} alt={brand.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 max-w-[1440px] mx-auto px-4 md:px-6 flex items-end pb-8">
          <div className="flex gap-4 items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.image} alt={brand.name} className="w-20 h-20 md:w-24 md:h-24 rounded-[16px] object-cover border-4 border-white shadow-lg" />
            <div className="text-white pb-2">
              <h1 className="text-[26px] md:text-[32px] font-semibold leading-tight" style={{fontFamily:"var(--font-instrument)"}}>{brand.name}</h1>
              <p className="text-sm text-white/90">{brand.tagline} · {brand.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Brand story</p>
          <p className="text-[15px] leading-relaxed text-stone-800 mt-3">{brand.story}</p>
          <div className="mt-6 p-4 rounded-xl bg-white border border-[#E8E2D8]">
            <p className="text-sm font-medium">Delivery notes</p>
            <p className="text-sm text-stone-600">{brand.deliveryNotes}</p>
            <p className="text-xs text-stone-500 mt-2">Est. {brand.established} · {brand.productCount} products</p>
            {brand.social && (
              <div className="flex gap-2 mt-3">
                {brand.social.instagram && <span className="text-xs px-3 py-1 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">{brand.social.instagram}</span>}
                {brand.social.website && <span className="text-xs px-3 py-1 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">{brand.social.website}</span>}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-[20px] font-semibold mb-4" style={{fontFamily:"var(--font-instrument)"}}>Featured collection</h2>
            <div className="grid grid-cols-2 gap-4">
              {brandProducts.slice(0,4).map(p=> <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-[76px] space-y-4">
            <div className="p-5 rounded-[16px] bg-[#11110F] text-[#FFFBF5]">
              <p className="text-sm font-medium">From {brand.city}</p>
              <p className="text-xs text-white/70 mt-1">Explore more local brands from {brand.city} and surrounds.</p>
              <Link href={`/local#${brand.city.toLowerCase()}`} className="inline-flex mt-3 h-8 px-4 rounded-full bg-white text-[#11110F] text-xs items-center">Explore {brand.city}</Link>
            </div>
            <div className="p-5 rounded-[16px] bg-white border border-[#E8E2D8]">
              <p className="text-sm font-medium">Shop all from {brand.name}</p>
              <Link href={`/shop?brand=${brand.slug}`} className="inline-flex mt-3 h-9 px-5 rounded-full bg-[#11110F] text-white text-sm items-center">View {brandProducts.length} products →</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-[1440px] mx-auto px-4 md:px-6 pb-10">
        <h2 className="text-[18px] font-semibold mb-4">All products — {brand.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brandProducts.map(p=> <ProductCard key={p.id} product={p} />)}
        </div>
        {brandProducts.length===0 && <p className="text-sm text-stone-500">No products yet for this brand.</p>}
      </section>
    </div>
  );
}
