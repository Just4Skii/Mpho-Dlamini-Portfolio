import { useState } from "react";
import Link from "@/projects/kasicart/compat/next";

const faqs = [
  { q:"How long is delivery?", a:"Standard delivery is 2–4 business days across South Africa. Express is 1–2 days where available. Free standard over R750. Estimates are illustrative in this frontend demo.", cat:"Delivery" },
  { q:"Do you offer collection?", a:"Collection is available in selected areas — shown at checkout when applicable. This is a UI feature in the demo.", cat:"Delivery" },
  { q:"What is the returns policy?", a:"14-day returns for undamaged items. Seller handles fulfilment. In production this would connect to an orders API — here it is a frontend flow.", cat:"Returns" },
  { q:"How do payments work?", a:"Demo checkout only. Card UI uses placeholder 4242 4242 4242 4242, Instant EFT-style is UI-only. No real payment is processed, no data stored or sent.", cat:"Payments" },
  { q:"Do I need an account?", a:"No. Wishlist, cart and recently viewed persist locally. Guest and signed-in UI states are demonstrated with local frontend state.", cat:"Account" },
  { q:"Are brands real?", a:"All brands (Moya Studio, Khumalo Home, etc.) are fictional concept brands for portfolio purposes. Clearly marked as such.", cat:"Selling" },
  { q:"How do I sell on KasiCart?", a:"Via /sell — multi-step application, validated locally, no real submission. Reviewed in 3–5 days in the concept story.", cat:"Selling" },
  { q:"Is my data sent anywhere?", a:"No backend. All state stays in localStorage of this browser. No analytics data is actually sent.", cat:"Account" },
];

export default function HelpPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const filtered = faqs.filter(f=>{
    const matchesQ = !q || f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase());
    const matchesCat = cat==="All" || f.cat===cat;
    return matchesQ && matchesCat;
  });
  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
      <h1 className="text-[32px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Help</h1>
      <p className="text-sm text-stone-600 mt-2">Searchable FAQ — frontend filtering, no backend.</p>

      <div className="mt-6 flex gap-2">
        <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-full bg-white border border-[#E8E2D8]">
          <span className="text-stone-400">⌕</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search help — e.g. delivery, returns, payments" className="flex-1 outline-none text-sm" />
        </div>
      </div>
      <div className="flex gap-2 mt-3 overflow-auto scrollbar-none pb-2">
        {["All","Delivery","Returns","Payments","Account","Selling"].map(c=>(
          <button key={c} onClick={()=>setCat(c)} className={`px-4 h-8 rounded-full text-sm border shrink-0 ${cat===c?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{c}</button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map(f=>(
          <details key={f.q} className="group p-5 rounded-[16px] bg-white border border-[#E8E2D8] open:border-[#11110F]">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              <span>{f.q}</span>
              <span className="text-stone-400 group-open:rotate-45 transition">+</span>
            </summary>
            <p className="text-sm text-stone-600 mt-3">{f.a}</p>
            <span className="inline-block mt-2 text-[11px] tracking-widest uppercase px-2 py-1 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">{f.cat}</span>
          </details>
        ))}
        {filtered.length===0 && <p className="text-center py-8 text-stone-500">No results for “{q}”.</p>}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-[16px] bg-[#11110F] text-[#FFFBF5]">
          <h3 className="font-medium">Still need help?</h3>
          <p className="text-sm text-white/70 mt-1">Contact is UI-only in this demo. In production, this would open a support ticket.</p>
          <Link href="/sell" className="inline-flex mt-3 h-9 px-4 rounded-full bg-white text-[#11110F] text-sm items-center">Contact (demo)</Link>
        </div>
        <div className="p-5 rounded-[16px] bg-white border border-[#E8E2D8]">
          <h3 className="font-medium">Order support flow (demo)</h3>
          <p className="text-sm text-stone-600">Select order → select item → reason → submit → confirmation (local only).</p>
        </div>
      </div>
    </div>
  );
}
