
import { useState } from "react";
import { useCart } from "@/projects/kasicart/store/CartContext";
import { formatPrice } from "@/projects/kasicart/lib/utils";
import Link from "@/projects/kasicart/compat/next";
import { useRouter } from "@/projects/kasicart/compat/next";

type Step = 1|2|3|4;

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  // form state
  const [contact, setContact] = useState({ name:"", email:"", phone:"" });
  const [address, setAddress] = useState({ line1:"", suburb:"", city:"", province:"Gauteng", postal:"" });
  const [delivery, setDelivery] = useState<"standard"|"express"|"collection">("standard");
  const [payment, setPayment] = useState<"card"|"eft"|"other">("card");
  const [card, setCard] = useState({ number:"4242 4242 4242 4242", expiry:"12/28", cvc:"123", name:"" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [placing, setPlacing] = useState(false);

  const deliveryCost = delivery==="standard" ? (subtotal>750?0:95) : delivery==="express" ? 195 : 0;
  const total = subtotal - discount + deliveryCost;

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    if (c==="LOCAL10") { setDiscount(Math.round(subtotal*0.10)); setCouponMsg("LOCAL10 — 10% off"); }
    else if (c==="WELCOME15") { setDiscount(Math.round(subtotal*0.15)); setCouponMsg("WELCOME15 — 15% off"); }
    else { setDiscount(0); setCouponMsg("Invalid code. Try LOCAL10 or WELCOME15"); }
  };

  const validateStep = (s:Step) => {
    const e: Record<string,string> = {};
    if (s===1) {
      if (!contact.name.trim()) e.name="Full name required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email="Valid email required";
      if (!/^0\d{9}$/.test(contact.phone.replace(/\s/g,""))) e.phone="SA phone, e.g. 0821234567";
    }
    if (s===2) {
      if (!address.line1.trim()) e.line1="Address required";
      if (!address.suburb.trim()) e.suburb="Suburb required";
      if (!address.city.trim()) e.city="City required";
      if (!/^\d{4}$/.test(address.postal)) e.postal="4-digit postal code";
    }
    if (s===3) {
      if (payment==="card") {
        if (!card.name.trim()) e.cardName="Name on card required";
        if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(card.number.replace(/\s/g,"").replace(/ /g,"")) && card.number!=="4242 4242 4242 4242") e.cardNumber="Use placeholder 4242 4242 4242 4242 (demo)";
      }
    }
    if (s===4) {
      if (!terms) e.terms="Please accept terms";
      if (items.length===0) e.cart="Cart is empty";
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep(s=> Math.min(4, (s+1) as Step) as Step);
    window.scrollTo({top:0, behavior:"smooth"});
  };
  const back = () => setStep(s=> Math.max(1,(s-1) as Step) as Step);

  const placeOrder = () => {
    if (!validateStep(4)) return;
    setPlacing(true);
    setTimeout(()=>{
      const id = `KC-2026-${Math.floor(1000+Math.random()*9000)}`;
      try {
        localStorage.setItem("kasicart_last_order", JSON.stringify({ id, items, total, delivery, address, contact, date: new Date().toISOString() }));
        // also push to orders localStorage for account
        const raw = localStorage.getItem("kasicart_orders");
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift({ id, date: new Date().toISOString().slice(0,10), status:"processing", items: items.map(it=> ({ slug: it.product.slug, name: it.product.name, price: it.product.price, qty: it.quantity, image: it.product.images[0] })), total, deliveryMethod: delivery, address: `${address.line1}, ${address.suburb}, ${address.city}, ${address.postal}` });
        localStorage.setItem("kasicart_orders", JSON.stringify(arr));
      } catch {}
      clear();
      router.push(`/checkout?success=${id}`);
    }, 900);
  };

  // success view if query param
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("success")) {
    const id = new URLSearchParams(window.location.search).get("success");
    return (
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-10 text-center">
        <div className="bg-white border border-[#E8E2D8] rounded-[20px] p-8">
          <p className="w-12 h-12 rounded-full bg-[#1E3A2E] text-white flex items-center justify-center mx-auto text-xl">✓</p>
          <h1 className="text-[28px] font-semibold mt-4" style={{fontFamily:"var(--font-instrument)"}}>Order confirmed.</h1>
          <p className="text-sm text-stone-500 mt-1">Thank you — your order has been placed (frontend demo).</p>
          <p className="mt-4 font-mono text-sm bg-[#F5EEE6] inline-block px-3 py-1 rounded-full">Order number: {id}</p>
          <div className="text-left mt-6 p-4 rounded-xl bg-[#F5EEE6] text-sm space-y-1">
            <p><strong>Delivery:</strong> {delivery==="standard"?"Standard (2–4 business days)":delivery==="express"?"Express (1–2 business days)":"Collection"}</p>
            <p><strong>Estimated window:</strong> 2–4 business days</p>
            <p><strong>Address:</strong> {address.line1}, {address.suburb}, {address.city}, {address.postal}</p>
            <p className="text-xs text-stone-500 mt-2">This is a frontend-generated order ID. No real order exists, no payment was processed, no email sent.</p>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/account" className="h-10 px-6 rounded-full bg-[#11110F] text-white flex items-center text-sm">Track order</Link>
            <Link href="/shop" className="h-10 px-6 rounded-full border border-[#E8E2D8] flex items-center text-sm bg-white">Continue shopping</Link>
          </div>
        </div>
        <p className="text-xs text-stone-400 mt-4">Independent concept — designed and developed from scratch. No real transactions.</p>
      </div>
    );
  }

  if (items.length===0 && step!==4) {
    // but allow seeing checkout with empty cart warning
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link> <span>/</span> <Link href="/shop" className="hover:underline">Shop</Link> <span>/</span> <span className="text-[#11110F] font-medium">Checkout</span>
      </div>

      {/* progress — scroll on mobile */}
      <div className="flex items-center gap-2 mb-6 overflow-auto scrollbar-none pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
        {[
          [1,"Contact"],
          [2,"Delivery"],
          [3,"Payment"],
          [4,"Review"],
        ].map(([n,label])=>(
          <div key={n as unknown as number} className="flex items-center gap-2 shrink-0">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step===(n as unknown as number)?"bg-[#11110F] text-white": (step as number)>(n as unknown as number)?"bg-[#1E3A2E] text-white":"bg-white border border-[#E8E2D8] text-stone-500"}`}>{(step as number)>(n as unknown as number)?"✓":n as unknown as number}</span>
            <span className={`text-sm ${step===(n as unknown as number)?"font-medium text-[#11110F]":"text-stone-500"}`}>{label as string}</span>
            {(n as unknown as number)!==4 && <span className="w-8 h-px bg-[#E8E2D8] hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-6">
        <div className="bg-white border border-[#E8E2D8] rounded-[20px] p-4 sm:p-6">
          {step===1 && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-semibold">Contact</h2>
              <div>
                <label className="text-sm font-medium">Full name</label>
                <input value={contact.name} onChange={e=>setContact({...contact, name:e.target.value})} placeholder="Noluthando Dlamini" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm focus:border-[#11110F] outline-none" />
                {errors.name && <p className="text-xs text-[#C45D3C] mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={contact.email} onChange={e=>setContact({...contact, email:e.target.value})} placeholder="you@example.com" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm focus:border-[#11110F] outline-none" />
                {errors.email && <p className="text-xs text-[#C45D3C] mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Phone (SA)</label>
                <input value={contact.phone} onChange={e=>setContact({...contact, phone:e.target.value})} placeholder="0821234567" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm focus:border-[#11110F] outline-none" />
                {errors.phone && <p className="text-xs text-[#C45D3C] mt-1">{errors.phone}</p>}
                <p className="text-xs text-stone-500 mt-1">For delivery updates (demo — no SMS sent).</p>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={next} className="h-11 px-7 rounded-full bg-[#11110F] text-white font-medium">Continue to delivery</button>
              </div>
            </div>
          )}

          {step===2 && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-semibold">Delivery</h2>
              <div>
                <label className="text-sm font-medium">Street address</label>
                <input value={address.line1} onChange={e=>setAddress({...address, line1:e.target.value})} placeholder="45 Ridge Rd" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm outline-none focus:border-[#11110F]" />
                {errors.line1 && <p className="text-xs text-[#C45D3C] mt-1">{errors.line1}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Suburb</label>
                  <input value={address.suburb} onChange={e=>setAddress({...address, suburb:e.target.value})} placeholder="Rosebank" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm outline-none" />
                  {errors.suburb && <p className="text-xs text-[#C45D3C] mt-1">{errors.suburb}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <input value={address.city} onChange={e=>setAddress({...address, city:e.target.value})} placeholder="Johannesburg" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm outline-none" />
                  {errors.city && <p className="text-xs text-[#C45D3C] mt-1">{errors.city}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Province</label>
                  <select value={address.province} onChange={e=>setAddress({...address, province:e.target.value})} className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-3 text-sm bg-white">
                    <option>Gauteng</option><option>Western Cape</option><option>KwaZulu-Natal</option><option>Eastern Cape</option><option>Free State</option><option>Limpopo</option><option>Mpumalanga</option><option>North West</option><option>Northern Cape</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Postal code</label>
                  <input value={address.postal} onChange={e=>setAddress({...address, postal:e.target.value})} placeholder="2196" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm outline-none" />
                  {errors.postal && <p className="text-xs text-[#C45D3C] mt-1">{errors.postal}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium">Delivery method</p>
                {[
                  ["standard", "Standard — R95 (free over R750) · 2–4 business days"],
                  ["express", "Express — R195 · 1–2 business days"],
                  ["collection", "Collection — Free · Selected areas only"],
                ].map(([v,label])=>(
                  <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${delivery===v?"border-[#11110F] bg-[#F5EEE6]":"border-[#E8E2D8] bg-white"}`}>
                    <input type="radio" name="delivery" checked={delivery===v} onChange={()=>setDelivery(v as any)} />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={back} className="h-11 px-6 rounded-full border border-[#E8E2D8] bg-white text-sm">Back</button>
                <button onClick={next} className="h-11 px-7 rounded-full bg-[#11110F] text-white font-medium">Continue to payment</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-semibold">Payment</h2>
              <p className="text-xs bg-[#F5EEE6] p-3 rounded-xl">Demo checkout — no real payment is processed. Use placeholder card 4242 4242 4242 4242. No card data is stored or sent.</p>

              <div className="flex gap-2">
                {[
                  ["card","Card"],
                  ["eft","Instant EFT-style"],
                  ["other","Other method"],
                ].map(([v,l])=>(
                  <button key={v} onClick={()=>setPayment(v as any)} className={`flex-1 h-10 rounded-full border text-sm font-medium ${payment===v?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{l}</button>
                ))}
              </div>

              {payment==="card" && (
                <div className="space-y-3 p-4 rounded-xl bg-[#F5EEE6] border border-[#E8E2D8]">
                  <p className="text-xs tracking-widest uppercase text-stone-500">Card — simulated</p>
                  <div>
                    <label className="text-sm">Name on card</label>
                    <input value={card.name} onChange={e=>setCard({...card, name:e.target.value})} placeholder="N Dlamini" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm bg-white outline-none" />
                    {errors.cardName && <p className="text-xs text-[#C45D3C] mt-1">{errors.cardName}</p>}
                  </div>
                  <div>
                    <label className="text-sm">Card number — placeholder 4242 4242 4242 4242</label>
                    <input value={card.number} onChange={e=>setCard({...card, number:e.target.value})} className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm bg-white outline-none font-mono" />
                    {errors.cardNumber && <p className="text-xs text-[#C45D3C] mt-1">{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">Expiry</label>
                      <input value={card.expiry} onChange={e=>setCard({...card, expiry:e.target.value})} placeholder="12/28" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="text-sm">CVC</label>
                      <input value={card.cvc} onChange={e=>setCard({...card, cvc:e.target.value})} placeholder="123" className="mt-1 w-full h-11 rounded-xl border border-[#E8E2D8] px-4 text-sm bg-white" />
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">This is a UI simulation. No payment provider is contacted.</p>
                </div>
              )}
              {payment==="eft" && (
                <div className="p-4 rounded-xl bg-white border border-[#E8E2D8] text-sm">
                  <p>Instant EFT-style option — you would be redirected to your bank to approve the payment. (UI only, no redirect in demo.)</p>
                  <button className="mt-3 h-9 px-4 rounded-full bg-[#1E3A2E] text-white text-sm">Continue with bank (demo)</button>
                </div>
              )}
              {payment==="other" && (
                <div className="p-4 rounded-xl bg-white border border-[#E8E2D8] text-sm">
                  <p>Other method — wallet / store credit (UI placeholder).</p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={back} className="h-11 px-6 rounded-full border border-[#E8E2D8] bg-white text-sm">Back</button>
                <button onClick={next} className="h-11 px-7 rounded-full bg-[#11110F] text-white font-medium">Review order</button>
              </div>
            </div>
          )}

          {step===4 && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-semibold">Review</h2>

              <div className="p-4 rounded-xl bg-[#F5EEE6] space-y-2 text-sm">
                <p><strong>Contact:</strong> {contact.name} · {contact.email} · {contact.phone}</p>
                <p><strong>Ship to:</strong> {address.line1}, {address.suburb}, {address.city}, {address.province}, {address.postal}</p>
                <p><strong>Delivery:</strong> {delivery} — {deliveryCost===0?"Free":formatPrice(deliveryCost)}</p>
                <p><strong>Payment:</strong> {payment==="card"?`Card ending in •••• ${card.number.slice(-4)}` : payment}</p>
              </div>

              {items.length===0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                  Cart is empty — <Link href="/shop" className="underline">add items</Link> to place an order (demo).
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it,i)=>(
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-white border border-[#E8E2D8] text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.product.images[0]} alt={it.product.name} className="w-14 h-14 rounded-lg object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{it.product.name}</p>
                        <p className="text-xs text-stone-500">{[it.color,it.size].filter(Boolean).join(" · ")} · Qty {it.quantity}</p>
                      </div>
                      <span className="font-medium">{formatPrice(it.product.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} className="mt-1" />
                <span>I agree to the Terms and understand this is a frontend demo — no real payment or order will be created. <Link href="/help" className="underline">Learn more</Link>.</span>
              </label>
              {errors.terms && <p className="text-xs text-[#C45D3C]">{errors.terms}</p>}
              {errors.cart && <p className="text-xs text-[#C45D3C]">{errors.cart}</p>}

              <div className="flex justify-between pt-2">
                <button onClick={back} className="h-11 px-6 rounded-full border border-[#E8E2D8] bg-white text-sm">Back</button>
                <button onClick={placeOrder} disabled={placing || items.length===0} className="h-11 px-7 rounded-full bg-[#C45D3C] text-white font-medium hover:bg-[#A84E32] disabled:opacity-50">
                  {placing?"Placing order…":`Place order — ${formatPrice(total)}`}
                </button>
              </div>
              <p className="text-xs text-stone-500">Secure checkout (UI simulation). No card data is collected or transmitted.</p>
            </div>
          )}
        </div>

        {/* summary */}
        <div className="bg-white border border-[#E8E2D8] rounded-[20px] p-6 h-fit sticky top-[80px]">
          <h3 className="font-semibold mb-4">Order summary</h3>
          {items.length===0 ? (
            <p className="text-sm text-stone-500">No items yet.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {items.slice(0,4).map((it,i)=>(
                <div key={i} className="flex justify-between gap-2">
                  <span className="truncate">{it.product.name} × {it.quantity}</span>
                  <span className="font-medium shrink-0">{formatPrice(it.product.price * it.quantity)}</span>
                </div>
              ))}
              {items.length>4 && <p className="text-xs text-stone-500">+{items.length-4} more items</p>}
              <div className="border-t border-[#E8E2D8] pt-3 space-y-1.5">
                <div className="flex justify-between"><span className="text-stone-600">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Coupon" className="flex-1 h-8 rounded-full border border-[#E8E2D8] px-3 text-xs" />
                  <button onClick={applyCoupon} className="h-8 px-3 rounded-full bg-white border border-[#11110F] text-xs">Apply</button>
                </div>
                {couponMsg && <p className={`text-xs ${discount>0?"text-green-700":"text-[#C45D3C]"}`}>{couponMsg}</p>}
                {discount>0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-stone-600">Delivery ({delivery})</span><span>{deliveryCost===0?"Free":formatPrice(deliveryCost)}</span></div>
                <div className="flex justify-between font-semibold text-[16px] pt-2 border-t border-[#E8E2D8]"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              <p className="text-xs text-stone-500">Free standard delivery over R750.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
