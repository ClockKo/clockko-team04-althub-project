import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LandingPage } from './pages/landingpage'
import MainLayout from './features/layout/mainLayout'
import { DashboardLayout } from './pages/dashboard'
import ChallengesPage from "./features/challenges/challengePage";
import { OnboardingProvider } from './contexts/OnboardingContext';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './features/auth';
import TaskTrackerFeatures from './features/tasks-management/taskTrackerFeatures'
import TimeTrackerFeatures from './features/timeTracker/timetrackerfeatures';
import CreateAccountPage from './features/auth/CreateAccountPage';
import SignInPage from './features/auth/SignInPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import ProtectedRoutes from './features/auth/protectedroutes'
import { OnboardingFlow } from './features/onboarding'

const queryClient = new QueryClient()



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <OnboardingProvider>

              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/create-account" element={<CreateAccountPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/onboarding" element={<OnboardingFlow />} />
                <Route element={<ProtectedRoutes />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<DashboardLayout />} />
                    <Route path="/tasks" element={<TaskTrackerFeatures />} />
                    <Route path="/time-tracker" element={<TimeTrackerFeatures />} />
                    <Route path="/co-working" element={<div className="p-6"><h1 className="text-2xl font-bold">Co-working Rooms</h1><p>Coming soon...</p></div>} />
                    <Route path="/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Coming soon...</p></div>} />
                    <Route path="/challenges" element={<ChallengesPage />} />
                    <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Coming soon...</p></div>} />
                    {/* add more protected routes here */}
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>

            </OnboardingProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider >
  )
}

export default App
