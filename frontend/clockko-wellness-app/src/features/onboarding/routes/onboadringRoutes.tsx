import { Route, Routes } from "react-router-dom";
import { OnboardingLoginPage } from "../onboadingLoginPage";
// import {WelcomeModal} from "../modals/welcomeModal";
// import WorkDaysModal from "../components/WorkDaysModal";
import { DashboardLayout } from "../../dashboard/dashboardLayout";
import { Navigate } from "react-router-dom";

export default function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="/onboarding/login" element={<OnboardingLoginPage />} />
      <Route path="/dashboard" element={<DashboardLayout />} />
      {/* <Route path="/onboarding/workdays" element={<WorkDaysModal />} /> */}
       <Route path="/" element={<Navigate to="/onboarding/login" />} />
    </Routes>
  );
}