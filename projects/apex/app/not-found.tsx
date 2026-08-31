import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-stone min-h-[60vh] flex items-center">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-16 w-full">
        <div className="bg-white border border-neutral-200 p-10 max-w-2xl">
          <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">404 — NOT FOUND</div>
          <h1 className="font-display text-[32px] font-semibold mt-3">The page you’re looking for doesn’t exist.</h1>
          <p className="text-sm text-neutral-600 mt-3 leading-relaxed">It may have moved, or the link is incorrect. Try the homepage or services.</p>
          <div className="flex gap-3 mt-6">
            <Link href="/" className="bg-ink text-white px-5 py-2.5 text-sm font-medium">Go home →</Link>
            <Link href="/services" className="border border-neutral-200 px-5 py-2.5 text-sm font-medium hover:border-ink">View services</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
