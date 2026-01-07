import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, AuthLayout } from '@/components/layout/Layout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

// Lazy load pages for code splitting
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const Pricing = lazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })));
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

function App() {
  return (
    <BrowserRouter>
      <OnboardingProvider>
      <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
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
    </BrowserRouter>
  );
}

export default App;
