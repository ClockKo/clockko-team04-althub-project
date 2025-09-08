
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OnboardingRoutes from "./features/onboarding/routes/onboardingRoutes";
import { LandingPage } from "./pages/landingpage";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding/*" element={<OnboardingRoutes />} />
        {/* Add other routes like login, dashboard, etc. */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}



export default App;




