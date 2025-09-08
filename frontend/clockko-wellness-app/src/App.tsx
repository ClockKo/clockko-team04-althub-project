import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LandingPage } from './pages/landingpage'
import MainLayout from './features/layout/mainLayout'
import { DashboardLayout } from './pages/dashboard'
import  ChallengesPage  from "./features/challenges/challengePage";
import { OnboardingProvider } from './contexts/OnboardingContext';
import { UserProvider } from './contexts/UserContext';
import TaskTrackerFeatures from './features/tasks-management/taskTrackerFeatures'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardLayout />} />
                <Route path="/tasks" element={<TaskTrackerFeatures/>} />
                <Route path="/time-tracker" element={<div className="p-6"><h1 className="text-2xl font-bold">Time Tracker</h1><p>Coming soon...</p></div>} />
                <Route path="/co-working" element={<div className="p-6"><h1 className="text-2xl font-bold">Co-working Rooms</h1><p>Coming soon...</p></div>} />
                <Route path="/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Coming soon...</p></div>} />
                <Route path="/challenges" element={<ChallengesPage/>} />
                <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Coming soon...</p></div>} />
                {/* add more protected routes here */}
              </Route>
              {/* Add other routes like login, dashboard, etc. */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </UserProvider>
    </QueryClientProvider>
  )
}

export default App
