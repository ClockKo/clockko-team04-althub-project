import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  checkBackendOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'clockko-onboarding-complete';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Check backend onboarding status
  const checkBackendOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('🔍 No auth token found, skipping backend onboarding check');
        return;
      }

      console.log('🔍 Checking backend onboarding status...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('🔍 Backend user data:', userData);
        console.log('🔍 Backend onboarding status:', userData.onboarding_completed);
        
        if (userData.onboarding_completed === true) {
          console.log('✅ Onboarding completed according to backend, updating local state');
          setIsOnboardingComplete(true);
          localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        } else {
          console.log('❌ Onboarding not completed according to backend, updating local state');
          // User hasn't completed onboarding according to backend
          setIsOnboardingComplete(false);
          localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        }
      } else {
        console.error('Failed to fetch user data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to check backend onboarding status:', error);
      // Fall back to localStorage for offline scenarios
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored === 'true') {
        console.log('📱 Using localStorage fallback: onboarding complete');
        setIsOnboardingComplete(true);
      }
    }
  };

  // Load onboarding state from localStorage on mount, then sync with backend
  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored === 'true') {
      setIsOnboardingComplete(true);
    }
    
    // Check backend status if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      checkBackendOnboardingStatus();
    }
  }, []);

  // Watch for auth token changes and sync onboarding status
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('🔄 Auth token detected, checking onboarding status...');
        checkBackendOnboardingStatus();
      } else {
        console.log('🔄 No auth token, clearing onboarding status...');
        setIsOnboardingComplete(false);
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
    };

    // Listen for localStorage changes (when auth token is set/removed)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check immediately if token exists
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
        checkBackendOnboardingStatus,
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
