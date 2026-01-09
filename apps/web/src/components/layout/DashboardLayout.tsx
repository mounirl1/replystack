import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { OnboardingOverlay, WelcomeModal } from '@/components/onboarding';
import { Menu, X } from 'lucide-react';

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-text-dark-secondary dark:text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm"
      >
        <Menu size={20} className="text-text-dark-primary dark:text-text-primary" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar collapsed={false} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-dark-hover text-text-primary"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`
          min-h-screen transition-all duration-200
          pt-16 lg:pt-0
          ${sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}
        `}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Welcome Modal (first-time users) */}
      <WelcomeModal />

      {/* Onboarding Overlay */}
      <OnboardingOverlay />
    </div>
  );
}
