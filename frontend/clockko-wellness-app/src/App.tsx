import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OnboardingRoutes from "./features/onboarding/routes/onboardingRoutes";
import { LandingPage } from "./pages/landingpage";
import CreateAccountPage from "./features/auth/CreateAccountPage";
import SignInPage from "./features/auth/SignInPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import ProtectedRoutes from "./features/auth/protectedroutes";
// import DashboardPage from "./pages/dashboard/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding/*" element={<OnboardingRoutes />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoutes />}>
          {/* <Route path="/dashboard" element={<DashboardPage />} />
          Add other protected routes here */}
        </Route>
        {/* Add other routes like login, dashboard, etc. */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;




