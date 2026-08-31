import { useState, useMemo } from "react";
import { products } from "@/projects/kasicart/data/products";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import { useSearchParams, useRouter } from "@/projects/kasicart/compat/next";
import { Suspense } from "react";
import { GiftFinder } from "@/projects/kasicart/components/gifting/GiftFinder";

function GiftsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const budget = params.get("budget"); // 300,750,1500
  const occasion = params.get("occasion");
  const recipient = params.get("recipient");

  const filtered = useMemo(()=>{
    let list = [...products].filter(p=> ["gifts","home","beauty","food","design","fashion"].includes(p.category) || p.tags.includes("gift"));
    // broader: include housewarming/gifting items etc
    list = products.filter(()=>true); // use all for gifting demo but apply budget
    if (budget) {
      const max = Number(budget);
      list = list.filter(p=> p.price <= max);
    }
    if (occasion) {
      if (occasion==="housewarming") list = list.filter(p=> p.subcategory==="Housewarming" || p.tags.includes("housewarming") || ["home","design"].includes(p.category));
      if (occasion==="birthday") list = list.filter(p=> p.price < 1000);
      if (occasion==="corporate") list = list.filter(p=> p.price > 300 && p.price < 2000);
    }
    if (recipient) {
      // deterministic simple
      if (recipient==="her") list = list.filter(p=> ["beauty","fashion"].includes(p.category) || p.tags.includes("linen"));
      if (recipient==="him") list = list.filter(p=> ["tech","fashion","food"].includes(p.category));
    }
    return list.slice(0,16);
  }, [budget, occasion, recipient]);

  const update = (patch: Record<string,string|undefined>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k,v] of Object.entries(patch)) { if (!v) p.delete(k); else p.set(k,v); }
    router.push(`/gifts?${p.toString()}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap gap-2 items-start justify-between">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Gifting — curated</h1>
          <p className="text-sm text-stone-600 mt-1">Let&apos;s find a good gift — beautiful front-end decision tree with reveal animation.</p>
        </div>
        <span className="hidden sm:inline text-xs px-3 py-1.5 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">No backend · Deterministic</span>
      </div>

      <div className="mt-6">
        <GiftFinder />
      </div>

      <h2 className="text-[18px] font-semibold mt-10 mb-3">Or browse quickly</h2>

      <div className="grid md:grid-cols-3 gap-3 mt-6">
        <div className="p-4 rounded-[16px] bg-white border border-[#E8E2D8]">
          <p className="text-xs tracking-widest uppercase text-stone-500">Budget</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[
              ["300","Under R300"],
              ["750","Under R750"],
              ["1500","Under R1,500"],
            ].map(([v,l])=>(
              <button key={v} onClick={()=> update({ budget: budget===v? undefined : v })} className={`px-4 h-9 rounded-full text-sm border ${budget===v?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-[16px] bg-white border border-[#E8E2D8]">
          <p className="text-xs tracking-widest uppercase text-stone-500">Occasion</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {["Birthday","Housewarming","Wedding","Corporate","Just because"].map(o=>(
              <button key={o} onClick={()=> update({ occasion: occasion===o.toLowerCase()? undefined : o.toLowerCase() })} className={`px-3 h-8 rounded-full text-xs border ${occasion===o.toLowerCase()?"bg-[#C45D3C] text-white border-[#C45D3C]":"bg-white border-[#E8E2D8]"}`}>{o}</button>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-[16px] bg-white border border-[#E8E2D8]">
          <p className="text-xs tracking-widest uppercase text-stone-500">Recipient</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[
              ["her","Her"],
              ["him","Him"],
              ["home","Home"],
              ["any","Anyone"],
            ].map(([v,l])=>(
              <button key={v} onClick={()=> update({ recipient: recipient===v? undefined : v })} className={`px-3 h-8 rounded-full text-xs border ${recipient===v?"bg-[#1E3A2E] text-white border-[#1E3A2E]":"bg-white border-[#E8E2D8]"}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-stone-600">{filtered.length} gift ideas {budget?`under R${budget}`:""}</p>
        <button onClick={()=>router.push("/gifts")} className="text-xs underline">Clear all</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {filtered.map(p=> <ProductCard key={p.id} product={p} />)}
      </div>

      {filtered.length===0 && <p className="text-center py-10 text-stone-500">No gifts match that combination — try relaxing a filter.</p>}

      <section className="mt-10 p-6 rounded-[20px] bg-[#1E3A2E] text-[#FFFBF5]">
        <h3 className="font-semibold">Housewarming favourites</h3>
        <p className="text-sm text-white/70">Curated from local makers — thoughtful, not generic.</p>
      </section>
    </div>
  );
}

export default function GiftsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading gifts…</div>}>
      <GiftsInner />
    </Suspense>
  );
}
