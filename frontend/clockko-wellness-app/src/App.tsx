import { Button } from "./components/ui/button"
import { BrowserRouter } from "react-router-dom"
import OnboardingRoutes from "./features/onboarding/routes/onboadringRoutes"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background p-8">
        {/* <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold">Hello World</h1>
          <p className="text-lg text-gray-700">Welcome to the Clockko Wellness App!</p>
          <Button className="mt-4">Click Me</Button>
          <p className="mt-2 text-sm text-gray-500">This is a simple example of a React component styled with Tailwind CSS.</p>
          <p className="mt-2 text-sm text-gray-500">You can customize this app further by adding more components and styles.</p>
          <p className="mt-2 text-sm text-gray-500">Enjoy building your wellness app!</p>
        </div> */}
        <OnboardingRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App;

