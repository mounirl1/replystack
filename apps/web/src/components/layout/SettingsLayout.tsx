import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Palette, Link2, Globe, Settings } from 'lucide-react';

interface SettingsNavItem {
  icon: React.ReactNode;
  labelKey: string;
  href: string;
}

const settingsNavItems: SettingsNavItem[] = [
  { icon: <User size={18} />, labelKey: 'profile.title', href: '/settings' },
  { icon: <Palette size={18} />, labelKey: 'responseStyle.title', href: '/settings/response-style' },
  { icon: <Link2 size={18} />, labelKey: 'platforms.title', href: '/settings/platforms' },
  { icon: <Globe size={18} />, labelKey: 'language.title', href: '/settings/language' },
];

export function SettingsLayout() {
  const { t } = useTranslation('settings');
  const location = useLocation();

  return (
    <div className="flex gap-6 animate-fade-in">
      {/* Settings Sidebar */}
      <aside className="w-56 flex-shrink-0">
        <div className="sticky top-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
                {t('title')}
              </h1>
              <p className="text-xs text-text-tertiary">
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {settingsNavItems.map((item) => {
              // Check if this is the active route (exact match for /settings, startsWith for others)
              const isActive = item.href === '/settings'
                ? location.pathname === '/settings'
                : location.pathname.startsWith(item.href);

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-150 group relative
                    ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-text-dark-secondary dark:text-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover hover:text-text-dark-primary dark:hover:text-text-primary'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full" />
                  )}
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="text-sm">{t(item.labelKey)}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
