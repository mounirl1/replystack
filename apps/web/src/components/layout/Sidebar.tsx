import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Home,
  MessageSquare,
  History,
  BarChart3,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useReviewStats } from '@/hooks/useReviews';
import { userApi } from '@/services/api';
import { OnboardingTrigger } from '@/components/onboarding';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string | number;
  badgeType?: 'default' | 'count';
  disabled?: boolean;
  onboardingId?: string;
}

interface GetNavItemsParams {
  pendingCount?: number;
  t: (key: string) => string;
}

const getNavItems = ({ pendingCount, t }: GetNavItemsParams): NavItem[] => [
  { icon: <Home size={20} />, label: t('nav.dashboard'), href: '/dashboard', onboardingId: 'dashboard-link' },
  {
    icon: <MessageSquare size={20} />,
    label: t('nav.reviews'),
    href: '/reviews',
    badge: pendingCount && pendingCount > 0 ? pendingCount : undefined,
    badgeType: 'count',
    onboardingId: 'reviews-link',
  },
  { icon: <History size={20} />, label: t('nav.history'), href: '/history', onboardingId: 'history-link' },
  { icon: <BarChart3 size={20} />, label: t('nav.analytics'), href: '/analytics', badge: t('sidebar.soon'), disabled: true },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { data: reviewStats } = useReviewStats({});
  const { data: quota } = useQuery({
    queryKey: ['quota'],
    queryFn: userApi.getQuota,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const navItems = getNavItems({ pendingCount: reviewStats?.pending, t });

  const quotaUsed = quota?.used ?? 0;
  const quotaLimit = quota?.is_unlimited ? null : (typeof quota?.limit === 'number' ? quota.limit : 10);
  const quotaRemaining = quota?.is_unlimited ? 'unlimited' : (quota?.remaining ?? 0);
  const quotaPercent = quotaLimit ? (quotaUsed / quotaLimit) * 100 : 0;

  const isActive = (href: string) => {
    if (href === '/settings') {
      return location.pathname.startsWith('/settings');
    }
    return location.pathname === href;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        flex flex-col
        bg-light-surface dark:bg-dark-surface
        border-r border-light-border dark:border-dark-border
        transition-all duration-200 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-light-border dark:border-dark-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
              ReplyStack
            </span>
          )}
        </Link>
        {onToggle && (
          <button
            onClick={onToggle}
            className={`
              ml-auto p-1.5 rounded-lg
              text-text-dark-secondary dark:text-text-secondary
              hover:bg-light-hover dark:hover:bg-dark-hover
              transition-colors duration-150
              ${collapsed ? 'ml-0' : 'ml-auto'}
            `}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" data-onboarding="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.disabled ? '#' : item.href}
            data-onboarding={item.onboardingId}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-150
              group relative
              ${
                isActive(item.href)
                  ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400 font-medium'
                  : item.disabled
                  ? 'text-text-tertiary cursor-not-allowed opacity-60'
                  : 'text-text-dark-secondary dark:text-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover hover:text-text-dark-primary dark:hover:text-text-primary'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            {/* Active indicator */}
            {isActive(item.href) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
            )}

            <span className="flex-shrink-0">{item.icon}</span>

            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      item.badgeType === 'count'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-primary-500/20 text-primary-500 dark:text-primary-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="
                absolute left-full ml-2 px-2 py-1
                bg-dark-surface dark:bg-light-surface
                text-text-primary dark:text-text-dark-primary
                text-sm rounded-lg shadow-lg
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-150 whitespace-nowrap z-50
              ">
                {item.label}
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      item.badgeType === 'count'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-primary-500/20 text-primary-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-light-border dark:border-dark-border space-y-3">
        {/* Quota Bar */}
        {quotaRemaining !== 'unlimited' && !collapsed && (
          <div className="px-3 py-2 rounded-xl bg-light-hover dark:bg-dark-hover" data-onboarding="quota-bar">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-dark-secondary dark:text-text-secondary">
                {t('sidebar.monthlyQuota')}
              </span>
              <span className="text-xs font-semibold text-text-dark-primary dark:text-text-primary">
                {quotaRemaining}/{quotaLimit}
              </span>
            </div>
            <div className="h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  quotaPercent > 80
                    ? 'bg-red-500'
                    : quotaPercent > 50
                    ? 'bg-yellow-500'
                    : 'bg-primary-500'
                }`}
                style={{ width: `${Math.min(quotaPercent, 100)}%` }}
              />
            </div>
            {quotaPercent > 80 && (
              <Link
                to="/pricing"
                className="block mt-2 text-[10px] text-primary-500 hover:text-primary-400 font-medium"
              >
                {t('sidebar.upgradeForMore')}
              </Link>
            )}
          </div>
        )}

        {/* Settings Link */}
        <Link
          to="/settings"
          data-onboarding="settings-link"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-text-dark-secondary dark:text-text-secondary
            hover:bg-light-hover dark:hover:bg-dark-hover
            hover:text-text-dark-primary dark:hover:text-text-primary
            transition-all duration-150 group relative
            ${isActive('/settings') ? 'bg-primary-500/10 text-primary-500' : ''}
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Settings size={20} />
          {!collapsed && <span>{t('nav.settings')}</span>}
          {collapsed && (
            <div className="
              absolute left-full ml-2 px-2 py-1
              bg-dark-surface dark:bg-light-surface
              text-text-primary dark:text-text-dark-primary
              text-sm rounded-lg shadow-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-150 whitespace-nowrap z-50
            ">
              {t('nav.settings')}
            </div>
          )}
        </Link>

        {/* Theme Toggle + Onboarding Help */}
        <div className={`flex ${collapsed ? 'flex-col gap-1' : 'gap-1'}`}>
          <button
            onClick={toggleTheme}
            data-onboarding="theme-toggle"
            className={`
              flex items-center justify-center p-2 rounded-lg
              text-text-dark-secondary dark:text-text-secondary
              hover:bg-light-hover dark:hover:bg-dark-hover
              hover:text-text-dark-primary dark:hover:text-text-primary
              transition-all duration-150
              ${collapsed ? 'w-full' : ''}
            `}
            title={isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <OnboardingTrigger collapsed={collapsed} compact />
        </div>

        {/* User Section */}
        <div
          data-onboarding="user-profile"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl
            bg-light-hover dark:bg-dark-hover
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-dark-primary dark:text-text-primary truncate">
                {user?.name || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-text-tertiary capitalize">
                {t(`plan.${user?.plan || 'free'}`)} {t('sidebar.planLabel')}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title={t('nav.logout')}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
