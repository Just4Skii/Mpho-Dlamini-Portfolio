export function Badge({ children, tone="default" }: { children: React.ReactNode; tone?: "default" | "terracotta" | "green" | "stone" }) {
  const tones = {
    default: "bg-[#11110F] text-white",
    terracotta: "bg-[#C45D3C] text-white",
    green: "bg-[#1E3A2E] text-white",
    stone: "bg-[#E8E2D8] text-[#11110F]"
  };
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-widest uppercase rounded-full ${tones[tone]}`}>{children}</span>;
}
