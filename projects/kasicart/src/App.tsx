import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './store/ThemeContext';
import { DataSaverProvider } from './store/DataSaverContext';
import { OfflineProvider } from './store/OfflineContext';
import { CartProvider } from './store/CartContext';
import { WishlistProvider } from './store/WishlistContext';
import { CompareProvider } from './store/CompareContext';
import { RecentProvider } from './store/RecentContext';
import { Header } from './components/navigation/Header';
import { Footer } from './components/navigation/Footer';
import { MobileNav } from './components/navigation/MobileNav';
import { SystemBanners } from './components/system/OfflineBanner';
import { ReturnToPortfolio } from './components/ReturnToPortfolio';

// Pages & Data
import { products } from './data/products';
import { brands } from './data/brands';
import { categories } from './data/categories';
import { HomeClient } from './app/HomeClient';
import ShopPage from './app/shop/page';
import BrandsPage from './app/brands/page';
import BrandDetailPage from './app/brands/[slug]/page';
import CategoryPage from './app/category/[slug]/page';
import ProductPage from './app/product/[slug]/page';
import LocalPage from './app/local/page';
import BuildLookPage from './app/build-look/page';
import BuildRoomPage from './app/build-room/page';
import WishlistPage from './app/wishlist/page';
import CheckoutPage from './app/checkout/page';
import ComparePage from './app/compare/page';
import DiscoverPage from './app/discover/page';
import GiftsPage from './app/gifts/page';
import GuidesPage from './app/guides/page';
import MoodboardPage from './app/moodboard/page';
import StoriesPage from './app/stories/page';
import HelpPage from './app/help/page';
import SellPage from './app/sell/page';
import AccountPage from './app/account/page';

import './styles/kasicart.css';

export const App: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 8);
  const best = products.filter((p) => p.bestSeller).slice(0, 8);
  const trending = products.slice(0, 8);

  return (
    <ThemeProvider>
      <DataSaverProvider>
        <OfflineProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <RecentProvider>
                  <div className="kasicart-root">
                    <ReturnToPortfolio projectName="KasiCart" />
                    <SystemBanners />
                    <Header />

                    <main style={{ minHeight: '80vh' }}>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <HomeClient
                              featured={featured}
                              newArrivals={newArrivals}
                              best={best}
                              trending={trending}
                              brands={brands}
                              categories={categories}
                              products={products}
                            />
                          }
                        />
                        <Route path="shop" element={<ShopPage />} />
                        <Route path="brands" element={<BrandsPage />} />
                        <Route path="brands/:slug" element={<BrandDetailPage />} />
                        <Route path="category/:slug" element={<CategoryPage />} />
                        <Route path="product/:slug" element={<ProductPage />} />
                        <Route path="local" element={<LocalPage />} />
                        <Route path="build-look" element={<BuildLookPage />} />
                        <Route path="build-room" element={<BuildRoomPage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="compare" element={<ComparePage />} />
                        <Route path="discover" element={<DiscoverPage />} />
                        <Route path="gifts" element={<GiftsPage />} />
                        <Route path="guides" element={<GuidesPage />} />
                        <Route path="moodboard" element={<MoodboardPage />} />
                        <Route path="stories" element={<StoriesPage />} />
                        <Route path="help" element={<HelpPage />} />
                        <Route path="sell" element={<SellPage />} />
                        <Route path="account" element={<AccountPage />} />
                        <Route
                          path="*"
                          element={
                            <HomeClient
                              featured={featured}
                              newArrivals={newArrivals}
                              best={best}
                              trending={trending}
                              brands={brands}
                              categories={categories}
                              products={products}
                            />
                          }
                        />
                      </Routes>
                    </main>

                    <Footer />
                    <MobileNav />
                  </div>
                </RecentProvider>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </OfflineProvider>
      </DataSaverProvider>
    </ThemeProvider>
  );
};

export default App;
