import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface OnboardingTriggerProps {
  collapsed?: boolean;
  compact?: boolean;
}

export function OnboardingTrigger({ collapsed = false, compact = false }: OnboardingTriggerProps) {
  const { t } = useTranslation('onboarding');
  const { startOnboarding, isActive } = useOnboarding();

  if (isActive) return null;

  // Compact mode - icon only button
  if (compact) {
    return (
      <button
        onClick={() => startOnboarding('essential')}
        className={`
          flex items-center justify-center p-2 rounded-lg
          text-text-dark-secondary dark:text-text-secondary
          hover:bg-light-hover dark:hover:bg-dark-hover
          hover:text-text-dark-primary dark:hover:text-text-primary
          transition-all duration-150
          ${collapsed ? 'w-full' : ''}
        `}
        title={t('trigger.title')}
      >
        <HelpCircle size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={() => startOnboarding('essential')}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        text-text-dark-secondary dark:text-text-secondary
        hover:bg-light-hover dark:hover:bg-dark-hover
        hover:text-text-dark-primary dark:hover:text-text-primary
        transition-all duration-150 group relative
        ${collapsed ? 'justify-center' : ''}
      `}
      title={collapsed ? t('trigger.title') : undefined}
    >
      <HelpCircle size={20} />
      {!collapsed && <span>{t('trigger.title')}</span>}

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
          {t('trigger.title')}
        </div>
      )}
    </button>
  );
}
