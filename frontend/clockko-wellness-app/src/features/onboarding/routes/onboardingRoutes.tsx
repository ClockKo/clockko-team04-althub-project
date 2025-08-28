import { Route, Routes } from 'react-router-dom'
import { OnboardingLoginPage } from '../onboardingLoginPage'
import { DashboardLayout } from '../../dashboard/dashboardLayout'
import { Navigate } from 'react-router-dom'
import SignUpPage from '../../auth/SignUpPage'
import CheckInboxPage from '../../auth/CheckInboxPage'

export default function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="/onboarding/login" element={<OnboardingLoginPage />} />
      <Route path="/dashboard" element={<DashboardLayout />} />
      <Route path="/" element={<Navigate to="/onboarding/login" />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/check-inbox" element={<CheckInboxPage />} />
    </Routes>
  )
}
