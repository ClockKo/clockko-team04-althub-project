import { Route, Routes } from 'react-router-dom'
import { OnboardingLoginPage } from '../onboardingLoginPage'
import { DashboardLayout } from '../../../pages/dashboard/dashboard'
import { Navigate } from 'react-router-dom'

export default function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="login" element={<OnboardingLoginPage />} />
      <Route path="dashboard" element={<DashboardLayout />} />
      <Route path="/" element={<Navigate to="login" />} />
    </Routes>
  )
}
