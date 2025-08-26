import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OnboardingRoutes from "./features/onboarding/routes/onboardingRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding/*" element={<OnboardingRoutes />} />
        {/* Add other routes like login, dashboard, etc. here */}
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;




