import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'clockko-onboarding-complete';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored === 'true') {
      setIsOnboardingComplete(true);
    }
  }, []);

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  };

  const resetOnboarding = () => {
    setIsOnboardingComplete(false);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        completeOnboarding,
        resetOnboarding,
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
