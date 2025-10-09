import { OnboardingFlow } from "../../features/onboarding/onboardingFlow";
import DashboardPage from "./dashboardPage";
import { useOnboarding } from "../../contexts/OnboardingContext";

export function DashboardLayout() {
  const { isOnboardingComplete } = useOnboarding();

  return (
    <div className="relative min-h-screen bg-gray-100">
      {isOnboardingComplete ? (
        <main>
          <DashboardPage />
        </main>
      ) : (
        <OnboardingFlow />
      )}
    </div>
  );
}
