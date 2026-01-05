import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TransitionModalProps {
  onContinue: () => void;
  onFinish: () => void;
}

export function TransitionModal({ onContinue, onFinish }: TransitionModalProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFinish}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-light-border dark:border-dark-border p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onFinish}
          className="absolute top-4 right-4 p-1 rounded-md text-text-tertiary hover:text-text-dark-primary dark:hover:text-text-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-primary-500" />
          </div>

          <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary mb-2">
            {t('transition.title')}
          </h2>
          <p className="text-sm text-text-dark-secondary dark:text-text-secondary mb-6">
            {t('transition.description')}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onContinue}
              rightIcon={<ArrowRight size={16} />}
              className="w-full"
            >
              {t('transition.continue')}
            </Button>
            <Button
              variant="ghost"
              onClick={onFinish}
              className="w-full"
            >
              {t('transition.finish')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
