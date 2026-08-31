import { useParams } from "react-router-dom";
import { products } from "@/projects/kasicart/data/products";
import { ProductClient } from "./ProductClient";
import { notFound } from "@/projects/kasicart/compat/next";

export function generateStaticParams() {
  return products.map(p=> ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = products.find(x=> x.slug===slug);
  if (!p) return { title: "Product not found" };
  return { title: `${p.name} — ${p.brand}`, description: p.shortDescription };
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find(p=> p.slug===slug);
  if (!product) return notFound();
  return <ProductClient product={product} />;
}
