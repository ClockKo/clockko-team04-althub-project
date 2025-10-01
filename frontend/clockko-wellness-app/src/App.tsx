import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import PasswordResetConfirmPage from './features/auth/PasswordResetConfirmPage';
import EmailVerificationPage from './features/auth/EmailVerificationPage';
import ProtectedRoutes from './features/auth/protectedroutes'
import { OnboardingFlow } from './features/onboarding'
import NotFoundPage from './components/NotFoundPage'
import { Toaster } from 'react-hot-toast'
import CoWorkingRoomsPage from './features/coworking/coworkingRoomPage'
import { SettingsPage, ProfileSettings, GeneralSettings, SecuritySettings } from './features/settings';



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <OnboardingProvider>
            {/* Toast notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />

            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/reset-password-confirm" element={<PasswordResetConfirmPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route element={<ProtectedRoutes />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<DashboardLayout />} />
                  <Route path="/tasks" element={<TaskTrackerFeatures />} />
                  <Route path="/time-tracker" element={<TimeTrackerFeatures />} />
                  <Route path="/co-working" element={<CoWorkingRoomsPage/>} />
                  <Route path="/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Coming soon...</p></div>} />
                  <Route path="/challenges" element={<ChallengesPage/>} />
                  <Route path="/settings" element={<SettingsPage />}>
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="general" element={<GeneralSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                    {/* Add more settings sections here */}
                  </Route>
                  {/* add more protected routes here */}
                </Route>
              </Route>

              {/* 404 Not Found route - should be last */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

          </OnboardingProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
