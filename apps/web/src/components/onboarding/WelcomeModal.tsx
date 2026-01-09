import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/Button';

export function WelcomeModal() {
  const { t } = useTranslation('onboarding');
  const { showWelcomeModal, dismissWelcomeModal, startTourFromWelcome } = useOnboarding();

  if (!showWelcomeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-light-border dark:border-dark-border p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary-400/20 to-teal-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-primary-400/20 to-emerald-400/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative text-center">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
            <Sparkles size={36} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold text-text-dark-primary dark:text-text-primary mb-3">
            {t('welcome.title')}
          </h2>
          <p className="text-text-dark-secondary dark:text-text-secondary mb-8 leading-relaxed">
            {t('welcome.description')}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={startTourFromWelcome}
              rightIcon={<ArrowRight size={18} />}
              className="w-full py-3 text-base"
            >
              {t('welcome.startTour')}
            </Button>
            <Button
              variant="ghost"
              onClick={dismissWelcomeModal}
              className="w-full"
            >
              {t('welcome.skip')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
