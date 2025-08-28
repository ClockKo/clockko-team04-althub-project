import { Route, Routes } from 'react-router-dom'
import { OnboardingLoginPage } from '../onboardingLoginPage'
import { DashboardLayout } from '../../dashboard/dashboardLayout'
import { Navigate } from 'react-router-dom'
import CheckInboxPage from '../../auth/CheckInboxPage'
import CreateAccountPage from '../../auth/CreateAccountPage'
import SignInPage from '../../auth/SignInPage';
import ResetPasswordPage from '../../auth/ResetPasswordPage';

export default function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="/onboarding/login" element={<OnboardingLoginPage />} />
      <Route path="/dashboard" element={<DashboardLayout />} />
      <Route path="/" element={<Navigate to="/onboarding/login" />} />
      <Route path="/check-inbox" element={<CheckInboxPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/forgot-password" element={<ResetPasswordPage />} />
    </Routes>
  )
}
