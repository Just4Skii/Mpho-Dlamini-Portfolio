export type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "pre-order";

export interface ProductVariant {
  id: string;
  color?: string;
  colorHex?: string;
  size?: string;
  sku: string;
  stock: number;
  price?: number;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  currency: "ZAR";
  images: string[];
  description: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  stockCount: number;
  variants: ProductVariant[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  seller: string;
  sellerSlug: string;
  sellerLocation: string;
  deliveryEstimate: string;
  tags: string[];
  badges?: ("New" | "Bestseller" | "Local" | "Limited" | "Editor's Pick")[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  materials?: string;
  dimensions?: string;
  weight?: string;
  care?: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  story: string;
  location: string;
  city: string;
  province: string;
  category: string[];
  image: string;
  coverImage: string;
  productCount: number;
  established: string;
  deliveryNotes: string;
  social?: { instagram?: string; website?: string };
  featured?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  subcategories: string[];
  heroCopy: string;
}

export interface CartItem {
  product: Product;
  variantId?: string;
  color?: string;
  size?: string;
  quantity: number;
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

export interface Order {
  id: string;
  date: string;
  status: "delivered" | "processing" | "shipped" | "cancelled";
  items: { slug: string; name: string; price: number; qty: number; image: string }[];
  total: number;
  deliveryMethod: string;
  address: string;
}
