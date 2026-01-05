import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { t } = useTranslation('common');
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-gray-900">ReplyStack</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center ml-10 space-x-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/history')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.history')}
                </Link>
                <Link
                  to="/settings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/settings')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.settings')}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/pricing"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {user?.plan === 'free' ? t('nav.upgrade') : t('nav.plans')}
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{t(`plan.${user?.plan || 'free'}`)} plan</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    {t('nav.logout')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  {t('nav.pricing')}
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{t('nav.getStarted')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
