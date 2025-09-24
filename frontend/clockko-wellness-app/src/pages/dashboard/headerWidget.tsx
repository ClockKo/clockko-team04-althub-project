// DashboardHeader component displays a greeting message with the user's name and a koala mascot image.
// i need to fetch the user's name from the backend and display it here, if not available, display "Guest"
// also create a logic to know the time of the day and change the greeting message accordingly

// import { useOnboarding } from "../../contexts/OnboardingContext";
import { useUserData } from "./dashboardHooks";
import { getGreetingMessage } from "../../utils/greeting";
import koPose from "../../assets/images/KoPoses.png";

export function DashboardHeader() {
  // const { resetOnboarding } = useOnboarding(); // for testing purposes and rember to remove in production
  const { data: user, isLoading } = useUserData();
  
  const userName = user?.name || "Guest";
  console.log(userName);
  const greeting = getGreetingMessage(userName);

  return (
    <div className="bg-white rounded-2xl px-8 py-5 flex items-center justify-between shadow mb-6 md:h-40">
      <div className="flex items-center gap-4">
        <img src={koPose} alt="Koala mascot" className="w-18 h-20" />
        <div>
          <h1 className="text-xl xs:text-2xl font-bold">
            {isLoading ? "Loading..." : greeting}
          </h1>
          <p className="text-gray-600 xs:text-base">Let's start the day with intention and end with satisfaction.</p>
        </div>
      </div>
      {/* Reset onboarding button for testing - remove in production */}
      {/* <button
        onClick={resetOnboarding}
        className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
        title="Reset onboarding (for testing)"
      >
        Reset Onboarding
      </button> */}
    </div>
  );
}