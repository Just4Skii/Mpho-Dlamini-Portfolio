import { useState } from "react";
import Link from "@/projects/kasicart/compat/next";

type Step = 1|2|3|4|5;

export default function SellPage() {
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({
    business:"", owner:"", email:"", phone:"", city:"Johannesburg", category:"Home & Living", website:"", about:""
  });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e:Record<string,string>={};
    if(step===1){ if(!data.business.trim()) e.business="Business name required"; if(!data.owner.trim()) e.owner="Owner name required"; }
    if(step===4){ if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email="Valid email required"; if(!/^0\d{9}$/.test(data.phone.replace(/\s/g,""))) e.phone="SA phone required"; }
    if(step===3){ if(!data.city) e.city="City required"; }
    if(step===2){ if(!data.category) e.category="Category required"; }
    setErrors(e);
    return Object.keys(e).length===0;
  };
  const next = ()=>{ if(!validate()) return; setStep(s=> Math.min(5, (s+1) as Step) as Step); };
  const back = ()=> setStep(s=> Math.max(1,(s-1) as Step) as Step);

  if (done) {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-6 py-10 text-center">
        <div className="bg-white border border-[#E8E2D8] rounded-[20px] p-8">
          <p className="w-12 h-12 rounded-full bg-[#1E3A2E] text-white flex items-center justify-center mx-auto">✓</p>
          <h1 className="text-[24px] font-semibold mt-4">Application received — thank you.</h1>
          <p className="text-sm text-stone-500 mt-2">We review applications within 3–5 business days. (Demo — no data was sent.)</p>
          <p className="text-sm mt-4">Submitted as <strong>{data.business}</strong> — {data.city} · {data.category}</p>
          <Link href="/brands" className="inline-flex mt-6 h-10 px-6 rounded-full bg-[#11110F] text-white items-center text-sm">Explore brands</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-6 py-8">
      <h1 className="text-[32px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Sell on KasiCart</h1>
      <p className="text-sm text-stone-600 mt-2">Reach new customers, build your storefront in minutes, manage products, grow your brand. Applications reviewed within 3–5 days.</p>

      <div className="flex items-center gap-2 mt-6 mb-6">
        {[1,2,3,4,5].map(n=>(
          <div key={n} className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step===n?"bg-[#11110F] text-white": step>n?"bg-[#1E3A2E] text-white":"bg-white border border-[#E8E2D8]"}`}>{step>n?"✓":n}</span>
            <span className={`text-xs hidden md:inline ${step===n?"font-medium":"text-stone-500"}`}>{["About business","What you sell","Where based","Contact","Review"][n-1]}</span>
            {n!==5 && <span className="w-6 h-px bg-[#E8E2D8] hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E8E2D8] rounded-[20px] p-6">
        {step===1 && (
          <div className="space-y-4">
            <h2 className="font-semibold">01 — About the business</h2>
            <div>
              <label className="text-sm font-medium">Business name</label>
              <input value={data.business} onChange={e=>setData({...data, business:e.target.value})} placeholder="Moya Studio" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm" />
              {errors.business && <p className="text-xs text-[#C45D3C] mt-1">{errors.business}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Owner name</label>
              <input value={data.owner} onChange={e=>setData({...data, owner:e.target.value})} placeholder="Noluthando Dlamini" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm" />
              {errors.owner && <p className="text-xs text-[#C45D3C] mt-1">{errors.owner}</p>}
            </div>
          </div>
        )}
        {step===2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">02 — What do you sell?</h2>
            <div>
              <label className="text-sm font-medium">Primary category</label>
              <select value={data.category} onChange={e=>setData({...data, category:e.target.value})} className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-3 text-sm bg-white">
                <option>Home & Living</option><option>Fashion</option><option>Beauty & Wellness</option><option>Food & Specialty</option><option>Art & Design</option><option>Tech & Accessories</option><option>Gifts</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Website / social link</label>
              <input value={data.website} onChange={e=>setData({...data, website:e.target.value})} placeholder="instagram.com/yourbrand or yourbrand.co.za" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Tell us about your business</label>
              <textarea value={data.about} onChange={e=>setData({...data, about:e.target.value})} placeholder="Materials, process, story, where you make…" rows={4} className="mt-1 w-full rounded-xl border border-[#E8E2D8] px-4 py-3 text-sm" />
            </div>
          </div>
        )}
        {step===3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">03 — Where are you based?</h2>
            <div>
              <label className="text-sm font-medium">City</label>
              <select value={data.city} onChange={e=>setData({...data, city:e.target.value})} className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-3 text-sm bg-white">
                <option>Johannesburg</option><option>Durban</option><option>Cape Town</option><option>Pretoria</option><option>Gqeberha</option><option>Bloemfontein</option><option>Stellenbosch</option><option>Other</option>
              </select>
            </div>
            <p className="text-xs text-stone-500">Your city helps customers discover you via Local.</p>
          </div>
        )}
        {step===4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">04 — Contact details</h2>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input value={data.email} onChange={e=>setData({...data, email:e.target.value})} placeholder="hello@yourbrand.co.za" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm" />
              {errors.email && <p className="text-xs text-[#C45D3C] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input value={data.phone} onChange={e=>setData({...data, phone:e.target.value})} placeholder="0821234567" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm" />
              {errors.phone && <p className="text-xs text-[#C45D3C] mt-1">{errors.phone}</p>}
            </div>
          </div>
        )}
        {step===5 && (
          <div className="space-y-3 text-sm">
            <h2 className="font-semibold">05 — Review</h2>
            <div className="p-4 rounded-xl bg-[#F5EEE6] space-y-1">
              <p><strong>Business:</strong> {data.business || "—"} — {data.owner || "—"}</p>
              <p><strong>Sells:</strong> {data.category}</p>
              <p><strong>Based:</strong> {data.city}</p>
              <p><strong>Contact:</strong> {data.email} · {data.phone}</p>
              <p><strong>Link:</strong> {data.website || "—"}</p>
              <p><strong>About:</strong> {data.about || "—"}</p>
            </div>
            <p className="text-xs text-stone-500">No data will be sent — frontend validation only, for portfolio demonstration.</p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={back} disabled={step===1} className="h-10 px-6 rounded-full border border-[#E8E2D8] bg-white text-sm disabled:opacity-40">Back</button>
          {step<5 ? (
            <button onClick={next} className="h-10 px-7 rounded-full bg-[#11110F] text-white text-sm font-medium">Continue</button>
          ) : (
            <button onClick={()=>setDone(true)} className="h-10 px-7 rounded-full bg-[#C45D3C] text-white text-sm font-medium">Submit application</button>
          )}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-3 text-sm">
        <div className="p-4 rounded-xl bg-white border border-[#E8E2D8]">Reach new customers across South Africa</div>
        <div className="p-4 rounded-xl bg-white border border-[#E8E2D8]">Build your storefront — editorial brand pages</div>
        <div className="p-4 rounded-xl bg-white border border-[#E8E2D8]">Grow your brand with curated discovery</div>
      </div>
    </div>
  );
}
