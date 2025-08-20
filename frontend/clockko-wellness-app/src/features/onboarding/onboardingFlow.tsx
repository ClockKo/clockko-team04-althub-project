// onboarding overview and modal dialog overlay

import { useState } from "react";
import {WelcomeModal} from "./modals/welcomeModal";
import {WorkDaysModal} from "./modals/workdaysModal";

export function OnboardingFlow() {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Work days...
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  return (
    <>
      {step === 1 && <WelcomeModal onNext={() => setStep(2)} />}
      {step === 2 && (
        <WorkDaysModal
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
          onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          step={1}
          totalStep={5}
        />
      )}
      {/* Add more modals for subsequent steps as onboarding progresses */}
    </>
  );
}