import Link from "@/projects/kasicart/compat/next";

export default function NotFound() {
  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16 text-center">
      <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">404</p>
      <h1 className="text-[32px] font-semibold tracking-tight mt-2" style={{fontFamily:"var(--font-instrument)"}}>Looks like this page wandered off.</h1>
      <p className="text-sm text-stone-600 mt-3">The page you’re looking for doesn’t exist — but there’s plenty to discover.</p>
      <div className="mt-6 flex gap-2 justify-center">
        <Link href="/" className="h-10 px-6 rounded-full bg-[#11110F] text-white text-sm flex items-center">Return home</Link>
        <Link href="/shop" className="h-10 px-6 rounded-full border border-[#E8E2D8] bg-white text-sm flex items-center">Browse shop</Link>
      </div>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
        <Link href="/category/home" className="p-4 rounded-xl bg-white border border-[#E8E2D8] text-sm">Home & Living →</Link>
        <Link href="/category/fashion" className="p-4 rounded-xl bg-white border border-[#E8E2D8] text-sm">Fashion →</Link>
        <Link href="/brands" className="p-4 rounded-xl bg-white border border-[#E8E2D8] text-sm">Brands →</Link>
        <Link href="/help" className="p-4 rounded-xl bg-white border border-[#E8E2D8] text-sm">Help →</Link>
      </div>
      <div className="mt-6">
        <Link href="/shop" className="text-sm underline">Or try searching</Link>
      </div>
    </div>
  );
}
