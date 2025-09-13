# Onboarding Context

This context manages the onboarding state for the ClockKo Wellness App.

## Features

- **Persistent State**: Onboarding completion status is stored in localStorage
- **Context Management**: Provides global access to onboarding state across the app
- **Reset Functionality**: Allows resetting onboarding for testing purposes

## Usage

```tsx
import { useOnboarding } from './contexts/OnboardingContext';

function MyComponent() {
  const { isOnboardingComplete, completeOnboarding, resetOnboarding } = useOnboarding();
  
  // Use the onboarding state
  if (isOnboardingComplete) {
    // Show dashboard
  } else {
    // Show onboarding flow
  }
}
```

## API

### `isOnboardingComplete: boolean`
Indicates whether the user has completed the onboarding process.

### `completeOnboarding(): void`
Marks onboarding as complete and persists the state to localStorage.

### `resetOnboarding(): void`
Resets onboarding state and removes it from localStorage. Useful for testing.

## Implementation Details

- The context is provided at the App level in `App.tsx`
- Onboarding completion is automatically loaded from localStorage on app startup
- The dashboard layout conditionally renders based on onboarding completion status
- A reset button is available in the dashboard header for testing (should be removed in production)
