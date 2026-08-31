import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./store/store";
import { Layout } from "./components/layout";
import { Skel } from "./components/ui";
import Home from "./pages/Home";

function getAppBasename(): string {
  if (typeof window === 'undefined') return '/work/carepoint';
  const pathname = window.location.pathname;
  const match = pathname.match(/^(.*\/work\/carepoint)/i);
  if (match && match[1]) {
    return match[1];
  }
  return '/work/carepoint';
}

const SearchPage = lazy(() => import("./pages/Search"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile"));
const BookingPage = lazy(() => import("./pages/Booking"));
const UrgentCare = lazy(() => import("./pages/UrgentCare"));
const ForProviders = lazy(() => import("./pages/ForProviders"));
const ComparePage = lazy(() => import("./pages/Compare"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Specialties = lazy(() => import("./pages/Specialties").then((m) => ({ default: m.SpecialtiesList })));
const SpecialtyDetail = lazy(() => import("./pages/Specialties").then((m) => ({ default: m.SpecialtyDetail })));
const ClinicsList = lazy(() => import("./pages/Clinics").then((m) => ({ default: m.ClinicsList })));
const ClinicDetail = lazy(() => import("./pages/Clinics").then((m) => ({ default: m.ClinicDetail })));
const LocationsList = lazy(() => import("./pages/Locations").then((m) => ({ default: m.LocationsList })));
const LocationDetail = lazy(() => import("./pages/Locations").then((m) => ({ default: m.LocationDetail })));
const GuidesList = lazy(() => import("./pages/Guides").then((m) => ({ default: m.GuidesList })));
const GuideDetail = lazy(() => import("./pages/Guides").then((m) => ({ default: m.GuideDetail })));
const AccountHome = lazy(() => import("./pages/Account").then((m) => ({ default: m.AccountHome })));
const AppointmentsList = lazy(() => import("./pages/Account").then((m) => ({ default: m.AppointmentsList })));
const AppointmentDetail = lazy(() => import("./pages/Account").then((m) => ({ default: m.AppointmentDetail })));
const SavedProviders = lazy(() => import("./pages/Account").then((m) => ({ default: m.SavedProviders })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="container-x py-10" aria-busy="true" aria-label="Loading page">
      <Skel className="h-4 w-32" />
      <Skel className="mt-4 h-10 w-2/3 max-w-md" />
      <Skel className="mt-3 h-4 w-1/2 max-w-sm" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skel key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={getAppBasename()}>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/*"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/find" element={<SearchPage />} />
                    <Route path="/providers/:slug" element={<ProviderProfile />} />
                    <Route path="/book/:slug" element={<BookingPage />} />
                    <Route path="/specialties" element={<Specialties />} />
                    <Route path="/specialties/:slug" element={<SpecialtyDetail />} />
                    <Route path="/clinics" element={<ClinicsList />} />
                    <Route path="/clinics/:slug" element={<ClinicDetail />} />
                    <Route path="/locations" element={<LocationsList />} />
                    <Route path="/locations/:slug" element={<LocationDetail />} />
                    <Route path="/account" element={<AccountHome />} />
                    <Route path="/account/appointments" element={<AppointmentsList />} />
                    <Route path="/account/appointments/:id" element={<AppointmentDetail />} />
                    <Route path="/account/saved" element={<SavedProviders />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/urgent-care" element={<UrgentCare />} />
                    <Route path="/guides" element={<GuidesList />} />
                    <Route path="/guides/:slug" element={<GuideDetail />} />
                    <Route path="/for-providers" element={<ForProviders />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
