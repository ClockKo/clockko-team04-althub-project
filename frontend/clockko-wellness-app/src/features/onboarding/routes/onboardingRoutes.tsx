import { Route, Routes } from 'react-router-dom'
import { OnboardingLoginPage } from '../onboardingLoginPage'
import { DashboardLayout } from '../../../pages/dashboard/dashboard'
import { Navigate } from 'react-router-dom'
import CheckInboxPage from '../../auth/CheckInboxPage'
import CreateAccountPage from '../../auth/CreateAccountPage'
import SignInPage from '../../auth/SignInPage';
import ResetPasswordPage from '../../auth/ResetPasswordPage';

export default function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="login" element={<OnboardingLoginPage />} />
      <Route path="dashboard" element={<DashboardLayout />} />
      <Route path="/" element={<Navigate to="login" />} />
    </Routes>
  )
}
