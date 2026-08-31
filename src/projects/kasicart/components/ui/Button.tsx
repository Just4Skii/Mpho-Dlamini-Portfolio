import { cn } from "@/projects/kasicart/lib/utils";
import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export function Button({ variant="primary", size="md", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base = "inline-flex items-center justify-center font-medium tracking-[-0.01em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C45D3C]";
  const variants: Record<Variant,string> = {
    primary: "bg-[#11110F] text-white hover:bg-black",
    secondary: "bg-[#C45D3C] text-white hover:bg-[#A84E32]",
    ghost: "bg-transparent hover:bg-[#F5EEE6] text-[#11110F]",
    outline: "border border-[#D6CFC2] bg-white hover:bg-[#FFFBF5] text-[#11110F]"
  };
  const sizes: Record<Size,string> = {
    sm: "h-8 px-3 text-[13px] rounded-full",
    md: "h-10 px-5 text-[14px] rounded-full",
    lg: "h-12 px-7 text-[15px] rounded-full"
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
