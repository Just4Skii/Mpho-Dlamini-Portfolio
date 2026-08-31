import { ShopClient } from "./ShopClient";
import { Suspense } from "react";

export const metadata = { title: "Shop — KasiCart" };

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading shop…</div>}>
      <ShopClient />
    </Suspense>
  );
}
