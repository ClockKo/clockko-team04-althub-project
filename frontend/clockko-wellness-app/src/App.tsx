import { BrowserRouter } from "react-router-dom"
import OnboardingRoutes from "./features/onboarding/routes/onboardingRoutes"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <OnboardingRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App;

