import { Route, Routes } from "react-router-dom";
import { OnboardingLoginPage } from "../onboadingLoginPage";
// import WelcomeModal from "../components/WelcomeModal";
// import WorkDaysModal from "../components/WorkDaysModal";

export default function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="/onboarding/login" element={<OnboardingLoginPage />} />
      {/* <Route path="/onboarding/welcome" element={<WelcomeModal />} /> */}
      {/* <Route path="/onboarding/workdays" element={<WorkDaysModal />} /> */}
    </Routes>
  );
}