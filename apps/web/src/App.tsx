import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout, AuthLayout } from '@/components/layout/Layout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ScrollToTop } from '@/components/utils/ScrollToTop';
import { useDocumentLanguage } from '@/hooks/useDocumentLanguage';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { CookieConsent } from '@/components/ui/CookieConsent';

// Lazy load pages for code splitting
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const Pricing = lazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })));
const SectorPage = lazy(() => import('@/pages/SectorPage').then(m => ({ default: m.SectorPage })));
const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/auth/Register').then(m => ({ default: m.Register })));
const MagicAuth = lazy(() => import('@/pages/auth/MagicAuth').then(m => ({ default: m.MagicAuth })));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Reviews = lazy(() => import('@/pages/dashboard/Reviews'));
const History = lazy(() => import('@/pages/dashboard/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('@/pages/dashboard/Settings').then(m => ({ default: m.Settings })));
const ResponseStylePage = lazy(() => import('@/pages/dashboard/settings/ResponseStylePage').then(m => ({ default: m.ResponseStylePage })));
const PlatformsPage = lazy(() => import('@/pages/dashboard/settings/PlatformsPage').then(m => ({ default: m.PlatformsPage })));
const LanguagePage = lazy(() => import('@/pages/dashboard/settings/LanguagePage').then(m => ({ default: m.LanguagePage })));
const SupportedPlatforms = lazy(() => import('@/pages/dashboard/SupportedPlatforms').then(m => ({ default: m.SupportedPlatforms })));
const BlogIndex = lazy(() => import('@/pages/blog/BlogIndex').then(m => ({ default: m.BlogIndex })));
const BlogPost = lazy(() => import('@/pages/blog/BlogPost').then(m => ({ default: m.BlogPost })));
const CompareIndex = lazy(() => import('@/pages/compare/CompareIndex').then(m => ({ default: m.CompareIndex })));
const ComparePage = lazy(() => import('@/pages/compare/ComparePage').then(m => ({ default: m.ComparePage })));
const AlternativesPage = lazy(() => import('@/pages/alternatives/AlternativesPage').then(m => ({ default: m.AlternativesPage })));

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

// Component that applies document-level effects
function AppEffects() {
  useDocumentLanguage();
  return null;
}

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <AppEffects />
      <GoogleAnalytics />
      <ScrollToTop />
      <OnboardingProvider>
      <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* Blog routes - EN (default) */}
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          {/* Blog routes - FR */}
          <Route path="/fr/blog" element={<BlogIndex />} />
          <Route path="/fr/blog/:slug" element={<BlogPost />} />
          {/* Blog routes - ES */}
          <Route path="/es/blog" element={<BlogIndex />} />
          <Route path="/es/blog/:slug" element={<BlogPost />} />
          {/* Blog routes - PT */}
          <Route path="/pt/blog" element={<BlogIndex />} />
          <Route path="/pt/blog/:slug" element={<BlogPost />} />
          {/* Comparison pages - EN (default) */}
          <Route path="/compare" element={<CompareIndex />} />
          <Route path="/compare/:slug" element={<ComparePage />} />
          <Route path="/en/compare" element={<CompareIndex />} />
          <Route path="/en/compare/:slug" element={<ComparePage />} />
          {/* Comparison pages - FR */}
          <Route path="/fr/compare" element={<CompareIndex />} />
          <Route path="/fr/compare/:slug" element={<ComparePage />} />
          {/* Comparison pages - ES */}
          <Route path="/es/compare" element={<CompareIndex />} />
          <Route path="/es/compare/:slug" element={<ComparePage />} />
          {/* Comparison pages - PT */}
          <Route path="/pt/compare" element={<CompareIndex />} />
          <Route path="/pt/compare/:slug" element={<ComparePage />} />
          {/* Alternatives/Hub pages - EN */}
          <Route path="/alternatives/:slug" element={<AlternativesPage />} />
          {/* Alternatives/Hub pages - FR */}
          <Route path="/fr/alternatives/:slug" element={<AlternativesPage />} />
          {/* Alternatives/Hub pages - ES */}
          <Route path="/es/alternatives/:slug" element={<AlternativesPage />} />
          {/* Alternatives/Hub pages - PT */}
          <Route path="/pt/alternatives/:slug" element={<AlternativesPage />} />
          {/* Sector pages - FR */}
          <Route path="/fr/secteurs/:sector" element={<SectorPage />} />
          {/* Sector pages - EN */}
          <Route path="/sectors/:sector" element={<SectorPage />} />
          <Route path="/en/sectors/:sector" element={<SectorPage />} />
          {/* Sector pages - ES */}
          <Route path="/es/sectores/:sector" element={<SectorPage />} />
          {/* Sector pages - PT */}
          <Route path="/pt/setores/:sector" element={<SectorPage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Magic auth (no layout needed) */}
        <Route path="/auth/magic" element={<MagicAuth />} />

        {/* Protected dashboard routes with new layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/history" element={<History />} />
          <Route path="/platforms" element={<SupportedPlatforms />} />

          {/* Settings routes with nested layout */}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Settings />} />
            <Route path="response-style" element={<ResponseStylePage />} />
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="language" element={<LanguagePage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      </OnboardingProvider>
      <CookieConsent />
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
