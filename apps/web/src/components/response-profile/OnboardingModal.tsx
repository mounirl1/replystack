import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BusinessSectorStep } from './steps/BusinessSectorStep';
import { ToneStep } from './steps/ToneStep';
import { LengthStep } from './steps/LengthStep';
import { IncludeElementsStep } from './steps/IncludeElementsStep';
import { NegativeStrategyStep } from './steps/NegativeStrategyStep';
import { BusinessInfoStep } from './steps/BusinessInfoStep';
import { AdvancedStep } from './steps/AdvancedStep';
import type {
  ResponseProfileFormData,
  ResponseProfileOptions,
} from '@/types/responseProfile';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: ResponseProfileFormData) => void;
  initialData: ResponseProfileFormData;
  options: ResponseProfileOptions;
  locationName: string;
}

const TOTAL_STEPS = 7;
const OPTIONAL_STEPS = [4, 7]; // 1-indexed: Elements step and Advanced step

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialData,
  options,
  locationName,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ResponseProfileFormData>({
    ...initialData,
    business_name: initialData.business_name || locationName,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        ...initialData,
        business_name: initialData.business_name || locationName,
      });
      setErrors({});
    }
  }, [isOpen, initialData, locationName]);

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Sector
        // Optional - no validation needed
        break;
      case 2: // Tone
        if (!formData.tone) {
          newErrors.tone = 'Veuillez sélectionner un ton';
        }
        break;
      case 3: // Length
        if (!formData.default_length) {
          newErrors.default_length = 'Veuillez sélectionner une longueur';
        }
        break;
      case 5: // Negative strategy
        if (!formData.negative_strategy) {
          newErrors.negative_strategy = 'Veuillez sélectionner une stratégie';
        }
        break;
      case 6: // Business info
        if (!formData.business_name.trim()) {
          newErrors.business_name = 'Le nom de l\'établissement est requis';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      onComplete({
        ...formData,
        onboarding_completed: true,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const canSkip = OPTIONAL_STEPS.includes(currentStep);
  const isLastStep = currentStep === TOTAL_STEPS;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessSectorStep
            value={formData.business_sector}
            onChange={(value) => setFormData({ ...formData, business_sector: value })}
            sectors={options.sectors}
          />
        );
      case 2:
        return (
          <ToneStep
            value={formData.tone}
            onChange={(value) => setFormData({ ...formData, tone: value })}
            tones={options.tones}
          />
        );
      case 3:
        return (
          <LengthStep
            value={formData.default_length}
            onChange={(value) => setFormData({ ...formData, default_length: value })}
            lengths={options.lengths}
          />
        );
      case 4:
        return (
          <IncludeElementsStep
            value={formData.include_elements}
            onChange={(value) => setFormData({ ...formData, include_elements: value })}
          />
        );
      case 5:
        return (
          <NegativeStrategyStep
            value={formData.negative_strategy}
            onChange={(value) => setFormData({ ...formData, negative_strategy: value })}
            strategies={options.negativeStrategies}
          />
        );
      case 6:
        return (
          <BusinessInfoStep
            businessName={formData.business_name}
            signature={formData.signature}
            onBusinessNameChange={(value) => setFormData({ ...formData, business_name: value })}
            onSignatureChange={(value) => setFormData({ ...formData, signature: value })}
            errors={{ business_name: errors.business_name }}
          />
        );
      case 7:
        return (
          <AdvancedStep
            highlights={formData.highlights}
            avoidTopics={formData.avoid_topics}
            additionalContext={formData.additional_context}
            onHighlightsChange={(value) => setFormData({ ...formData, highlights: value })}
            onAvoidTopicsChange={(value) => setFormData({ ...formData, avoid_topics: value })}
            onAdditionalContextChange={(value) => setFormData({ ...formData, additional_context: value })}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-light-bg dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-tertiary hover:text-text-dark-primary dark:hover:text-text-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-light-hover dark:bg-dark-hover">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <p className="text-sm text-text-tertiary">
            Étape {currentStep} sur {TOTAL_STEPS}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px] max-h-[70vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-hover flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                leftIcon={<ArrowLeft size={16} />}
              >
                Retour
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canSkip && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                rightIcon={<SkipForward size={16} />}
              >
                Passer
              </Button>
            )}
            <Button
              onClick={handleNext}
              rightIcon={isLastStep ? <Check size={16} /> : <ArrowRight size={16} />}
            >
              {isLastStep ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
