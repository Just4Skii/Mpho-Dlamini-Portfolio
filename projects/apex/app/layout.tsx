import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Apex Facilities Group — Integrated Property Maintenance & Facilities Management | Independent Concept Project",
    template: "%s — Apex Facilities Group",
  },
  description:
    "Independent concept project exploring integrated repairs, planned maintenance and specialist building services for property teams across South Africa. One partner for the entire property lifecycle — portfolio demonstration.",
  metadataBase: new URL("https://apexfacilities.example"),
  openGraph: {
    title: "Apex Facilities Group — Independent Concept Project",
    description: "Property maintenance without the operational headaches. Independent concept for South African portfolios.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA" className={`${inter.variable} ${space.variable} ${mono.variable}`}>
      <body className="font-sans bg-stone text-ink antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:text-sm">
          Skip to content
        </a>
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
