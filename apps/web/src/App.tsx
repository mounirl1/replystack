import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, AuthLayout } from '@/components/layout/Layout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { Landing } from '@/pages/Landing';
import { Pricing } from '@/pages/Pricing';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import Reviews from '@/pages/dashboard/Reviews';
import { History } from '@/pages/dashboard/History';
import { Settings } from '@/pages/dashboard/Settings';
import { ResponseStylePage } from '@/pages/dashboard/settings/ResponseStylePage';
import { PlatformsPage } from '@/pages/dashboard/settings/PlatformsPage';
import { LanguagePage } from '@/pages/dashboard/settings/LanguagePage';

function App() {
  return (
    <BrowserRouter>
      <OnboardingProvider>
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

        {/* Protected dashboard routes with new layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/history" element={<History />} />

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
      </OnboardingProvider>
    </BrowserRouter>
  );
}

export default App;
