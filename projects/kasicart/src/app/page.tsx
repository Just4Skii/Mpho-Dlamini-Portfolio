import Link from "@/projects/kasicart/compat/next";
import { products } from "@/projects/kasicart/data/products";
import { brands } from "@/projects/kasicart/data/brands";
import { categories } from "@/projects/kasicart/data/categories";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import { HomeClient } from "./HomeClient";

export default function Home() {
  const featured = products.filter(p=>p.featured).slice(0,3);
  const newArrivals = products.filter(p=>p.newArrival).slice(0,8);
  const best = products.filter(p=>p.bestSeller).slice(0,8);
  const trending = products.slice(0,8);
  return <HomeClient featured={featured} newArrivals={newArrivals} best={best} trending={trending} brands={brands} categories={categories} products={products} />;
}
