import type { Metadata } from "@/projects/kasicart/compat/next";
import { Instrument_Serif, DM_Sans } from "@/projects/kasicart/compat/next";
import "./globals.css";
import { Header } from "@/projects/kasicart/components/navigation/Header";
import { Footer } from "@/projects/kasicart/components/navigation/Footer";
import { MobileNav } from "@/projects/kasicart/components/navigation/MobileNav";
import { CartProvider } from "@/projects/kasicart/store/CartContext";
import { WishlistProvider } from "@/projects/kasicart/store/WishlistContext";
import { CompareProvider } from "@/projects/kasicart/store/CompareContext";
import { RecentProvider } from "@/projects/kasicart/store/RecentContext";
import { DataSaverProvider } from "@/projects/kasicart/store/DataSaverContext";
import { OfflineProvider } from "@/projects/kasicart/store/OfflineContext";
import { SystemBanners } from "@/projects/kasicart/components/system/OfflineBanner";
import { ThemeProvider } from "@/projects/kasicart/store/ThemeContext";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: { default: "KasiCart — Good things, close to home.", template: "%s — KasiCart" },
  description: "Discover products from independent South African brands, makers and specialty retailers. Independent concept — frontend showcase.",
  openGraph: { title: "KasiCart — Good things, close to home.", description: "Independent South African brands, makers and specialty retailers.", type: "website" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.setItem('kasicart_theme','light');document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <DataSaverProvider>
            <OfflineProvider>
              <CartProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <RecentProvider>
                      <SystemBanners />
                      <Header />
                      <main className="flex-1 pb-16 md:pb-0">{children}</main>
                      <Footer />
                      <MobileNav />
                    </RecentProvider>
                  </CompareProvider>
                </WishlistProvider>
              </CartProvider>
            </OfflineProvider>
          </DataSaverProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
