import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import OnboardingRoutes from './features/onboarding/routes/onboardingRoutes'
import { LandingPage } from './pages/landingpage'
import TaskTrackerFeatures from './features/tasks-management/taskTrackerFeatures'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding/*" element={<OnboardingRoutes />} />
        {/* Add other routes like login, dashboard, etc. */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/onboarding" />} />
        <Route path="/tasks" element={<TaskTrackerFeatures />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
