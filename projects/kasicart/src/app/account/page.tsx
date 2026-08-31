
import { useState, useEffect } from "react";
import Link from "@/projects/kasicart/compat/next";
import { formatPrice } from "@/projects/kasicart/lib/utils";

type Order = { id:string; date:string; status:string; items:any[]; total:number; deliveryMethod:string; address:string };

export default function AccountPage() {
  const [tab, setTab] = useState<"orders"|"addresses"|"profile"|"preferences">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [profile, setProfile] = useState({ name:"Demo User", email:"demo@example.com" });

  useEffect(()=>{
    try {
      const raw = localStorage.getItem("kasicart_orders");
      if (raw) setOrders(JSON.parse(raw));
      else {
        // seed demo orders
        const demo: Order[] = [
          { id:"KC-2025-4821", date:"2026-02-10", status:"delivered", items:[{ slug:"umhlanga-stoneware-mug", name:"Umhlanga Stoneware Mug", price:249, qty:2, image:"https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"}], total:593, deliveryMethod:"standard", address:"12 Rosebank Rd, Johannesburg, 2196" },
          { id:"KC-2026-1033", date:"2026-02-18", status:"shipped", items:[{ slug:"handwoven-reversible-throw", name:"Handwoven Reversible Throw", price:1299, qty:1, image:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"}], total:1299, deliveryMethod:"express", address:"8 Umhlanga Rocks Dr, Durban, 4319" },
          { id:"KC-2026-2041", date:"2026-02-20", status:"processing", items:[{ slug:"durban-coast-coffee-house-roast", name:"Durban Coast Coffee — House Roast", price:195, qty:2, image:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop"}], total:485, deliveryMethod:"standard", address:"45 Long St, Cape Town, 8001" },
        ];
        setOrders(demo);
      }
      const s = localStorage.getItem("kasicart_signed_in");
      if (s==="true") setSignedIn(true);
    } catch {}
  }, []);

  const toggleSignIn = () => {
    const next = !signedIn;
    setSignedIn(next);
    try{ localStorage.setItem("kasicart_signed_in", String(next)); } catch{}
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 sm:py-8 grid md:grid-cols-[220px_1fr] gap-4 sm:gap-6">
      <aside className="bg-white border border-[#E8E2D8] rounded-[20px] p-4 h-fit md:sticky md:top-[76px]">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-[#11110F] text-white flex items-center justify-center">◯</span>
          <div>
            <p className="text-sm font-medium">{signedIn?profile.name:"Guest"}</p>
            <p className="text-xs text-stone-500">{signedIn?"Signed in (demo)":"Not signed in"}</p>
          </div>
        </div>
        <button onClick={toggleSignIn} className={`w-full h-9 rounded-full text-sm font-medium mb-4 ${signedIn?"bg-white border border-[#E8E2D8]":"bg-[#11110F] text-white"}`}>{signedIn?"Sign out (demo)":"Sign in (demo)"}</button>
        <nav className="flex md:flex-col gap-1.5 md:space-y-1 text-sm overflow-auto scrollbar-none pb-1 md:pb-0 -mx-1 md:mx-0 px-1 md:px-0 snap-x">
          {[
            ["orders","Orders"],
            ["addresses","Addresses"],
            ["profile","Profile"],
            ["preferences","Preferences"],
          ].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id as any)} className={`whitespace-nowrap shrink-0 snap-start w-auto md:w-full text-left px-4 md:px-3 py-2.5 md:py-2 rounded-full ${tab===id?"bg-[#11110F] text-white":"hover:bg-[#F5EEE6] bg-white border border-[#E8E2D8] md:border-0"}`}>{label}</button>
          ))}
          <Link href="/wishlist" className="whitespace-nowrap shrink-0 snap-start block px-4 md:px-3 py-2.5 md:py-2 rounded-full hover:bg-[#F5EEE6] bg-white border border-[#E8E2D8] md:border-0">Wishlist →</Link>
        </nav>
        <p className="text-[11px] text-stone-400 mt-4">Auth is frontend-only. No real account or OAuth. State isolated for future integration.</p>
      </aside>

      <div className="bg-white border border-[#E8E2D8] rounded-[20px] p-4 sm:p-6 min-h-[400px]">
        {tab==="orders" && (
          <div>
            <h1 className="text-[22px] font-semibold mb-1" style={{fontFamily:"var(--font-instrument)"}}>Orders</h1>
            <p className="text-sm text-stone-500 mb-4">Frontend orders stored locally. No backend.</p>
            <div className="space-y-3">
              {orders.map(o=>(
                <div key={o.id} className="p-4 rounded-xl border border-[#E8E2D8] flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-[#F5EEE6] px-2 py-0.5 rounded-full">{o.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${o.status==="delivered"?"bg-[#1E3A2E] text-white":o.status==="shipped"?"bg-[#C45D3C] text-white":o.status==="cancelled"?"bg-stone-200":"bg-amber-100"}`}>{o.status}</span>
                      <span className="text-xs text-stone-500">{o.date}</span>
                    </div>
                    <p className="text-sm mt-2 line-clamp-1">{o.items.map((it:any)=> `${it.name} ×${it.qty}`).join(" · ")}</p>
                    <p className="text-xs text-stone-500 mt-1">{o.address} · {o.deliveryMethod}</p>
                    {/* timeline teaser */}
                    <div className="flex gap-1 mt-3">
                      {["Order placed","Processing","Shipped","Delivered"].map((s,idx)=>(
                        <span key={s} className={`h-1 flex-1 rounded-full ${idx <= (o.status==="delivered"?3:o.status==="shipped"?2:o.status==="processing"?1:0) ? "bg-[#1E3A2E]" : "bg-[#E8E2D8]"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="md:text-right shrink-0">
                    <p className="font-semibold">{formatPrice(o.total)}</p>
                    <Link href={`/account?order=${o.id}`} className="text-xs underline">View details</Link>
                    <div className="mt-2">
                      <Link href={`/account`} className="text-xs px-3 py-1 rounded-full border border-[#E8E2D8]">Track</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {orders.length===0 && <p className="text-sm text-stone-500 py-10 text-center">No orders yet. Place a demo order via checkout.</p>}
            <div className="mt-6 p-4 rounded-xl bg-[#F5EEE6] text-sm">
              <p className="font-medium">Return an item?</p>
              <p className="text-stone-600">Select order → select item → reason → submit (frontend demo, not sent).</p>
            </div>
          </div>
        )}

        {tab==="addresses" && (
          <div>
            <h2 className="text-[18px] font-semibold mb-3">Addresses</h2>
            <div className="p-4 rounded-xl border border-[#E8E2D8] bg-[#F5EEE6] text-sm">
              <p className="font-medium">Home — 12 Rosebank Rd, Rosebank, Johannesburg, 2196</p>
              <p className="text-stone-600">Default delivery address (demo, stored locally).</p>
            </div>
            <button className="mt-4 h-9 px-4 rounded-full border border-[#E8E2D8] bg-white text-sm">Add address (demo)</button>
          </div>
        )}

        {tab==="profile" && (
          <div>
            <h2 className="text-[18px] font-semibold mb-3">Profile</h2>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={profile.email} onChange={e=>setProfile({...profile, email:e.target.value})} className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm" />
              </div>
              <p className="text-xs text-stone-500">Changes saved locally only. Future auth boundary isolated in store.</p>
              <button className="h-10 px-6 rounded-full bg-[#11110F] text-white text-sm">Save (demo)</button>
            </div>
          </div>
        )}

        {tab==="preferences" && (
          <div>
            <h2 className="text-[18px] font-semibold mb-3">Preferences</h2>
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Email me about new arrivals (demo, no email sent)</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> SMS updates (demo)</label>
              <p className="text-xs text-stone-500">All preferences stored locally.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
