import Link from "@/projects/kasicart/compat/next";

export function Footer() {
  return (
    <footer className="bg-[#11110F] text-[#FFFBF5] mt-12 sm:mt-16 pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10 sm:py-12">
        <div className="grid md:grid-cols-5 gap-8 text-sm">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white text-[#11110F] flex items-center justify-center text-xs font-bold">KC</span>
              <span className="text-lg font-semibold">KasiCart</span>
            </div>
            <p className="text-[#D6CFC2] leading-relaxed max-w-sm">Discovery-driven marketplace for independent South African brands. Independent product concept — designed and developed from scratch.</p>
            <p className="text-xs text-stone-400">Good things, close to home. · Discover independent South African brands.</p>
            <form onSubmit={e=>e.preventDefault()} className="flex gap-2 max-w-sm">
              <input placeholder="Email for new arrivals" className="flex-1 h-10 rounded-full bg-white/10 border border-white/10 px-4 placeholder:text-stone-400 focus:outline-none focus:border-white text-white text-sm" />
              <button className="h-10 px-5 rounded-full bg-white text-[#11110F] text-sm font-medium hover:bg-[#F5EEE6]">Join</button>
            </form>
            <p className="text-[11px] text-stone-500">Frontend only — no emails are sent. For portfolio demonstration.</p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Shop</h4>
            <ul className="space-y-2 text-[#D6CFC2]">
              <li><Link href="/shop" className="hover:text-white">All products</Link></li>
              <li><Link href="/category/home" className="hover:text-white">Home</Link></li>
              <li><Link href="/category/fashion" className="hover:text-white">Fashion</Link></li>
              <li><Link href="/category/beauty" className="hover:text-white">Beauty</Link></li>
              <li><Link href="/category/food" className="hover:text-white">Food</Link></li>
              <li><Link href="/category/design" className="hover:text-white">Design</Link></li>
              <li><Link href="/category/tech" className="hover:text-white">Tech</Link></li>
              <li><Link href="/gifts" className="hover:text-white">Gifts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Discover</h4>
            <ul className="space-y-2 text-[#D6CFC2]">
              <li><Link href="/discover" className="hover:text-white">Discover</Link></li>
              <li><Link href="/moodboard" className="hover:text-white">Moodboard</Link></li>
              <li><Link href="/build-room" className="hover:text-white">Build a Room</Link></li>
              <li><Link href="/build-look" className="hover:text-white">Build a Look</Link></li>
              <li><Link href="/stories" className="hover:text-white">Stories</Link></li>
              <li><Link href="/brands" className="hover:text-white">Brands</Link></li>
              <li><Link href="/local" className="hover:text-white">Local — Made near you</Link></li>
              <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
              <li><Link href="/compare" className="hover:text-white">Compare</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Customer care</h4>
            <ul className="space-y-2 text-[#D6CFC2]">
              <li>Delivery 2–4 business days</li>
              <li>Free delivery over R750</li>
              <li>Returns within 14 days</li>
              <li>Secure checkout (demo)</li>
              <li>Collection available in selected areas</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 justify-between text-xs text-stone-400">
          <span>© 2026 KasiCart — Independent concept. No real transactions.</span>
          <span>Pay securely with card · Instant EFT-style option (UI only)</span>
        </div>
      </div>
    </footer>
  );
}
