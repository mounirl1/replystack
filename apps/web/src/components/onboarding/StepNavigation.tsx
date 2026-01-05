import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  partLabel?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  isFirstStep,
  isLastStep,
  partLabel,
}: StepNavigationProps) {
  const { t } = useTranslation('onboarding');

  void partLabel; // Not used anymore

  return (
    <div className="space-y-3">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">
          {currentStep + 1} / {totalSteps}
        </span>

        {/* Skip button (X) */}
        <button
          onClick={onSkip}
          className="p-1 rounded-md text-text-tertiary hover:text-text-dark-primary dark:hover:text-text-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          title={t('navigation.skip')}
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'w-6 bg-primary-500'
                : index < currentStep
                ? 'w-1.5 bg-primary-500/50'
                : 'w-1.5 bg-light-border dark:bg-dark-border'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        {!isFirstStep && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            leftIcon={<ChevronLeft size={16} />}
            className="flex-1"
          >
            {t('navigation.previous')}
          </Button>
        )}
        <Button
          size="sm"
          onClick={onNext}
          rightIcon={!isLastStep ? <ChevronRight size={16} /> : undefined}
          className="flex-1"
        >
          {isLastStep ? t('navigation.finish') : t('navigation.next')}
        </Button>
      </div>
    </div>
  );
}
