
import { useCompare } from "@/projects/kasicart/store/CompareContext";
import { products } from "@/projects/kasicart/data/products";
import Link from "@/projects/kasicart/compat/next";
import { CompareVisual } from "./CompareVisual";

export default function ComparePage() {
  const { ids, toggle, clear } = useCompare();
  const items = products.filter(p=> ids.includes(p.id));
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold" style={{fontFamily:"var(--font-instrument)"}}>Compare — {items.length}/4</h1>
          <p className="text-sm text-stone-500">Compare up to 4 products side-by-side. Select from product cards or pages.</p>
        </div>
        {items.length>0 && <button onClick={clear} className="text-sm underline">Clear</button>}
      </div>

      {items.length===0 ? (
        <div className="py-16 text-center bg-white border border-[#E8E2D8] rounded-[20px]">
          <p className="font-medium">No products to compare</p>
          <p className="text-sm text-stone-500">Add products to comparison from any product page.</p>
          <Link href="/shop" className="inline-flex mt-4 h-10 px-6 rounded-full bg-[#11110F] text-white items-center text-sm">Browse shop</Link>
        </div>
      ) : (
        <>
          <div className="overflow-auto rounded-[16px] border border-[#E8E2D8] bg-white">
            <table className="w-full text-sm border-collapse min-w-[720px]">
            <thead>
              <tr>
                <th className="text-left p-3 font-medium text-stone-500 w-[160px]">Feature</th>
                {items.map(p=>(
                  <th key={p.id} className="p-3 text-left align-top min-w-[180px]">
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} className="w-full aspect-[4/5] object-cover rounded-xl bg-[#F5EEE6]"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                      <Link href={`/product/${p.slug}`} className="font-medium leading-tight hover:underline block">{p.name}</Link>
                      <p className="text-xs text-stone-500">{p.brand}</p>
                      <button onClick={()=>toggle(p.id)} className="text-xs underline">Remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D8]">
              {[
                ["Price", (p:any)=> `R${p.price.toLocaleString("en-ZA")}` + (p.compareAtPrice?` (was R${p.compareAtPrice.toLocaleString("en-ZA")})`:"")],
                ["Category", (p:any)=> `${p.category} / ${p.subcategory}`],
                ["Brand", (p:any)=> p.brand],
                ["Location", (p:any)=> p.sellerLocation],
                ["Rating", (p:any)=> `${p.rating} (${p.reviewCount})`],
                ["Materials", (p:any)=> p.materials || "—"],
                ["Dimensions", (p:any)=> p.dimensions || "—"],
                ["Availability", (p:any)=> p.stockStatus],
                ["Delivery", (p:any)=> p.deliveryEstimate],
                ["Colours", (p:any)=> p.colors?.map((c:any)=>c.name).join(", ") || "—"],
                ["Sizes", (p:any)=> p.sizes?.join(", ") || p.variants.map((v:any)=>v.size).filter(Boolean).join(", ") || "—"],
              ].map(([label, getter])=>(
                <tr key={label as string} className="even:bg-[#FFFBF5] odd:bg-white">
                  <td className="p-3 font-medium bg-[#F5EEE6]">{label as string}</td>
                  {items.map(p=>(
                    <td key={p.id} className="p-3">{(getter as any)(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          <CompareVisual items={items} />
          <p className="text-xs text-stone-400 mt-3 text-center">Visual race — strongest values animate into emphasis. Shareable via URL query (frontend state encoded where practical).</p>
        </>
      )}
    </div>
  );
}
