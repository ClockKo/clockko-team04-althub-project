import { OnboardingFlow } from "../../features/onboarding/onboardingFlow";

export function DashboardLayout() {
    // This could be replaced with user context or onboarding state
    const isOnboardingComplete = false;

  return (
       <div className="relative min-h-screen bg-gray-100">
      {/* Dashboard main content */}
      <main>
        {/* ...dashboard sidebar, nav, widgets, etc. */}
      </main>
        {/* Modal overlay for onboarding */}
        {isOnboardingComplete ? null : <OnboardingFlow />}
    </div>
  );
}
