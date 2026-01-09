import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type OnboardingPart = 'essential' | 'complementary';

export interface OnboardingStep {
  id: string;
  targetSelector: string;
  targetPage: string;
  titleKey: string;
  descriptionKey: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface OnboardingState {
  isActive: boolean;
  currentPart: OnboardingPart | null;
  currentStepIndex: number;
  hasSeenOnboarding: boolean;
  showTransitionModal: boolean;
  showWelcomeModal: boolean;
}

export interface OnboardingActions {
  startOnboarding: (part?: OnboardingPart) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  skipPart: () => void;
  endOnboarding: () => void;
  resetOnboarding: () => void;
  continueToComplementary: () => void;
  dismissTransitionModal: () => void;
  dismissWelcomeModal: () => void;
  startTourFromWelcome: () => void;
}

interface OnboardingContextType extends OnboardingState, OnboardingActions {
  currentStep: OnboardingStep | null;
  totalSteps: number;
  steps: OnboardingStep[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'replystack-onboarding-seen';

// Essential steps (6 steps)
const essentialSteps: OnboardingStep[] = [
  {
    id: 'dashboard-link',
    targetSelector: '[data-onboarding="dashboard-link"]',
    targetPage: '/dashboard',
    titleKey: 'essential.dashboardLink.title',
    descriptionKey: 'essential.dashboardLink.description',
    position: 'right',
  },
  {
    id: 'reviews-link',
    targetSelector: '[data-onboarding="reviews-link"]',
    targetPage: '/dashboard',
    titleKey: 'essential.reviewsLink.title',
    descriptionKey: 'essential.reviewsLink.description',
    position: 'right',
  },
  {
    id: 'history-link',
    targetSelector: '[data-onboarding="history-link"]',
    targetPage: '/dashboard',
    titleKey: 'essential.historyLink.title',
    descriptionKey: 'essential.historyLink.description',
    position: 'right',
  },
  {
    id: 'dashboard-stats',
    targetSelector: '[data-onboarding="dashboard-stats"]',
    targetPage: '/dashboard',
    titleKey: 'essential.dashboardStats.title',
    descriptionKey: 'essential.dashboardStats.description',
    position: 'bottom',
  },
  {
    id: 'extension-cta',
    targetSelector: '[data-onboarding="extension-cta"]',
    targetPage: '/dashboard',
    titleKey: 'essential.extensionCta.title',
    descriptionKey: 'essential.extensionCta.description',
    position: 'bottom',
  },
  {
    id: 'response-style',
    targetSelector: '[data-onboarding="response-style"]',
    targetPage: '/dashboard',
    titleKey: 'essential.responseStyle.title',
    descriptionKey: 'essential.responseStyle.description',
    position: 'top',
  },
];

// Complementary steps (4 steps - history moved to essential)
const complementarySteps: OnboardingStep[] = [
  {
    id: 'settings-link',
    targetSelector: '[data-onboarding="settings-link"]',
    targetPage: '/dashboard',
    titleKey: 'complementary.settingsLink.title',
    descriptionKey: 'complementary.settingsLink.description',
    position: 'right',
  },
  {
    id: 'theme-toggle',
    targetSelector: '[data-onboarding="theme-toggle"]',
    targetPage: '/dashboard',
    titleKey: 'complementary.themeToggle.title',
    descriptionKey: 'complementary.themeToggle.description',
    position: 'right',
  },
  {
    id: 'quota-bar',
    targetSelector: '[data-onboarding="quota-bar"]',
    targetPage: '/dashboard',
    titleKey: 'complementary.quotaBar.title',
    descriptionKey: 'complementary.quotaBar.description',
    position: 'right',
  },
  {
    id: 'user-profile',
    targetSelector: '[data-onboarding="user-profile"]',
    targetPage: '/dashboard',
    titleKey: 'complementary.userProfile.title',
    descriptionKey: 'complementary.userProfile.description',
    position: 'right',
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<OnboardingState>(() => {
    const hasSeenOnboarding = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY) === 'true'
      : false;

    return {
      isActive: false,
      currentPart: null,
      currentStepIndex: 0,
      hasSeenOnboarding,
      showTransitionModal: false,
      showWelcomeModal: !hasSeenOnboarding, // Show welcome modal for first-time users
    };
  });

  const steps = state.currentPart === 'essential'
    ? essentialSteps
    : state.currentPart === 'complementary'
    ? complementarySteps
    : [];

  const currentStep = steps[state.currentStepIndex] || null;
  const totalSteps = steps.length;

  // Navigate to the target page if needed
  useEffect(() => {
    if (state.isActive && currentStep && location.pathname !== currentStep.targetPage) {
      navigate(currentStep.targetPage);
    }
  }, [state.isActive, currentStep, location.pathname, navigate]);

  const startOnboarding = useCallback((part: OnboardingPart = 'essential') => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentPart: part,
      currentStepIndex: 0,
      showTransitionModal: false,
    }));

    // Navigate to the first step's page
    const firstStep = part === 'essential' ? essentialSteps[0] : complementarySteps[0];
    if (firstStep && location.pathname !== firstStep.targetPage) {
      navigate(firstStep.targetPage);
    }
  }, [navigate, location.pathname]);

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentStepIndex + 1;
      const currentSteps = prev.currentPart === 'essential' ? essentialSteps : complementarySteps;

      if (nextIndex >= currentSteps.length) {
        // End of current part
        if (prev.currentPart === 'essential') {
          // Show transition modal to ask about complementary
          return {
            ...prev,
            showTransitionModal: true,
          };
        } else {
          // End of complementary, finish onboarding
          localStorage.setItem(STORAGE_KEY, 'true');
          return {
            ...prev,
            isActive: false,
            currentPart: null,
            currentStepIndex: 0,
            hasSeenOnboarding: true,
            showTransitionModal: false,
          };
        }
      }

      return {
        ...prev,
        currentStepIndex: nextIndex,
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => {
      if (prev.currentStepIndex > 0) {
        return {
          ...prev,
          currentStepIndex: prev.currentStepIndex - 1,
        };
      }
      return prev;
    });
  }, []);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const skipPart = useCallback(() => {
    setState(prev => {
      localStorage.setItem(STORAGE_KEY, 'true');
      return {
        ...prev,
        isActive: false,
        currentPart: null,
        currentStepIndex: 0,
        hasSeenOnboarding: true,
        showTransitionModal: false,
      };
    });
  }, []);

  const endOnboarding = useCallback(() => {
    setState(prev => {
      localStorage.setItem(STORAGE_KEY, 'true');
      return {
        ...prev,
        isActive: false,
        currentPart: null,
        currentStepIndex: 0,
        hasSeenOnboarding: true,
        showTransitionModal: false,
      };
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isActive: false,
      currentPart: null,
      currentStepIndex: 0,
      hasSeenOnboarding: false,
      showTransitionModal: false,
      showWelcomeModal: true,
    });
  }, []);

  const continueToComplementary = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentPart: 'complementary',
      currentStepIndex: 0,
      showTransitionModal: false,
    }));
  }, []);

  const dismissTransitionModal = useCallback(() => {
    setState(prev => {
      localStorage.setItem(STORAGE_KEY, 'true');
      return {
        ...prev,
        isActive: false,
        currentPart: null,
        currentStepIndex: 0,
        hasSeenOnboarding: true,
        showTransitionModal: false,
      };
    });
  }, []);

  const dismissWelcomeModal = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setState(prev => ({
      ...prev,
      showWelcomeModal: false,
      hasSeenOnboarding: true,
    }));
  }, []);

  const startTourFromWelcome = useCallback(() => {
    setState(prev => ({
      ...prev,
      showWelcomeModal: false,
      isActive: true,
      currentPart: 'essential',
      currentStepIndex: 0,
    }));

    // Navigate to dashboard if not already there
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  }, [navigate, location.pathname]);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        currentStep,
        totalSteps,
        steps,
        startOnboarding,
        nextStep,
        previousStep,
        skipStep,
        skipPart,
        endOnboarding,
        resetOnboarding,
        continueToComplementary,
        dismissTransitionModal,
        dismissWelcomeModal,
        startTourFromWelcome,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
