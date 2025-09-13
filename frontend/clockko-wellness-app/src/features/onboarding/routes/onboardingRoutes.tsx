import { Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../../../pages/dashboard/dashboard'
import { Navigate } from 'react-router-dom'


export default function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardLayout />} />
      <Route path="/" element={<Navigate to="dashboard" />} />
    </Routes>
  )
}
