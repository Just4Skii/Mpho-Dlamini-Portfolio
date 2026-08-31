import { useParams } from "react-router-dom";
import { categories } from "@/projects/kasicart/data/categories";
import { products } from "@/projects/kasicart/data/products";
import { brands } from "@/projects/kasicart/data/brands";
import Link from "@/projects/kasicart/compat/next";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import { notFound } from "@/projects/kasicart/compat/next";

export function generateStaticParams() {
  return categories.map(c=> ({ slug: c.slug }));
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const cat = categories.find(c=> c.slug===slug);
  if (!cat) return notFound();
  const catProducts = products.filter(p=> p.category===slug);
  const catBrands = brands.filter(b=> b.category.some(c=> c.toLowerCase().includes(cat.name.split(" ")[0].toLowerCase()) || c.toLowerCase()===slug));
  const featured = catProducts.filter(p=>p.featured).slice(0,3);
  return (
    <div>
      {/* hero */}
      <div className="relative overflow-hidden bg-[#F5EEE6]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Category</p>
            <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight leading-none mt-2" style={{fontFamily:"var(--font-instrument)"}}>{cat.name}</h1>
            <p className="text-[15px] text-stone-700 mt-4 leading-relaxed max-w-[50ch]">{cat.heroCopy}</p>
            <p className="text-sm text-stone-500 mt-2">{cat.description}</p>
            <div className="flex gap-2 mt-6 flex-wrap">
              {cat.subcategories.map(s=>(
                <Link key={s} href={`/shop?category=${slug}&subcategory=${encodeURIComponent(s)}`} className="px-4 h-9 rounded-full bg-white border border-[#E8E2D8] text-sm flex items-center hover:border-[#11110F]">{s}</Link>
              ))}
            </div>
            <Link href={`/shop?category=${slug}`} className="inline-flex mt-6 h-11 px-6 rounded-full bg-[#11110F] text-white font-medium items-center">Shop {cat.name}</Link>
          </div>
          <div className="relative rounded-[24px] overflow-hidden aspect-[4/3] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* featured collection */}
      {featured.length>0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
          <h2 className="text-[22px] font-semibold mb-4" style={{fontFamily:"var(--font-instrument)"}}>Featured in {cat.name}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {featured.map(p=>(
              <Link key={p.id} href={`/product/${p.slug}`} className="relative rounded-[20px] overflow-hidden bg-[#F5EEE6] aspect-[4/5] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <p className="text-xs tracking-widest uppercase text-white/80">{p.brand}</p>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm">R{p.price.toLocaleString("en-ZA")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* popular products */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[22px] font-semibold" style={{fontFamily:"var(--font-instrument)"}}>Popular in {cat.name}</h2>
          <Link href={`/shop?category=${slug}`} className="text-sm underline hidden md:inline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {catProducts.slice(0,8).map(p=>(
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* brands */}
      {catBrands.length>0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
          <h2 className="text-[18px] font-semibold mb-4">Brands in {cat.name}</h2>
          <div className="flex gap-3 overflow-auto scrollbar-none pb-2">
            {catBrands.slice(0,8).map(b=>(
              <Link key={b.slug} href={`/brands/${b.slug}`} className="shrink-0 flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E8E2D8] min-w-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-stone-500">{b.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* buying guide teaser */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
        <div className="rounded-[24px] bg-[#11110F] text-[#FFFBF5] p-6 md:p-10 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-xs tracking-widest uppercase text-white/60">Buying guide</p>
            <h3 className="text-[22px] font-semibold mt-2" style={{fontFamily:"var(--font-instrument)"}}>How to choose thoughtful {cat.name.toLowerCase()} that lasts</h3>
            <p className="text-sm text-white/70 mt-2 max-w-[50ch]">Our editor’s notes on materials, care and what actually matters when you buy from independent makers.</p>
          </div>
          <Link href="/guides" className="h-10 px-6 rounded-full bg-white text-[#11110F] font-medium inline-flex items-center self-start md:self-center shrink-0">Read guide</Link>
        </div>
      </section>
    </div>
  );
}
