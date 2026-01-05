import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SpotlightMask } from './SpotlightMask';
import { TooltipBubble } from './TooltipBubble';
import { StepNavigation } from './StepNavigation';
import { TransitionModal } from './TransitionModal';

export function OnboardingOverlay() {
  const { t } = useTranslation('onboarding');
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    currentPart,
    showTransitionModal,
    nextStep,
    previousStep,
    skipPart,
    continueToComplementary,
    dismissTransitionModal,
  } = useOnboarding();

  // Handle ESC key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        skipPart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, skipPart]);

  // Prevent body scroll when onboarding is active
  useEffect(() => {
    if (isActive || showTransitionModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive, showTransitionModal]);

  // Scroll to target element when step changes
  useEffect(() => {
    if (isActive && currentStep) {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        // Small delay to allow DOM to update
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [isActive, currentStep]);

  // Show transition modal between parts
  if (showTransitionModal) {
    return (
      <TransitionModal
        onContinue={continueToComplementary}
        onFinish={dismissTransitionModal}
      />
    );
  }

  // Don't render if not active or no current step
  if (!isActive || !currentStep) return null;

  const partLabel = currentPart === 'essential'
    ? t('parts.essential')
    : t('parts.complementary');

  return (
    <>
      {/* Spotlight mask */}
      <SpotlightMask
        targetSelector={currentStep.targetSelector}
        padding={8}
        borderRadius={12}
      />

      {/* Tooltip */}
      <TooltipBubble
        step={currentStep}
        title={t(currentStep.titleKey)}
        description={t(currentStep.descriptionKey)}
      >
        <StepNavigation
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipPart}
          isFirstStep={currentStepIndex === 0}
          isLastStep={currentStepIndex === totalSteps - 1}
          partLabel={partLabel}
        />
      </TooltipBubble>
    </>
  );
}
