import { OnboardingFlow } from "../onboarding/onboardingFlow";

export function DashboardLayout() {
    // This could be replaced with user context or onboarding state


  return (
       <div className="relative min-h-screen bg-gray-100">
      {/* Dashboard main content */}
      <main>
        {/* ...dashboard sidebar, nav, widgets, etc. */}
      </main>
        {/* Modal overlay for onboarding */}
      <OnboardingFlow />
    </div>
  );
}
