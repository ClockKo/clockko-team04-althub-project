// onboarding overview and modal dialog overlay

import { useState } from "react";
import {WelcomeModal} from "./modals/welcomeModal";
import {WorkDaysModal} from "./modals/workdaysModal";
import { ClockOutModal } from "./modals/clockOutModal";
import { FocusModal } from "./modals/focusModal";
import { AvatarModal } from "./modals/avatarModal";
import { ReminderModal } from "./modals/reminderModal";
import { useOnboarding } from "../../contexts/OnboardingContext";

export function OnboardingFlow() {
  const { completeOnboarding } = useOnboarding();
  const [step, setStep] = useState(0); // 0: Welcome, 1: Work days, 2: Clock out...
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [clockOut, setClockOut] = useState({ hour: '', minute: '' });
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');
  const [focusTimer, setFocusTimer] = useState({ hour: '', minute: '' });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [reminders, setReminders] = useState({
    shutdown: true,
    break: true,
    tasks: true,
  });

  const handleOnboardingComplete = () => {
    completeOnboarding();
  };

  return (
    <>
      {step === 0 && <WelcomeModal onNext={() => setStep(1)} />}
      {step === 1 && (
        <WorkDaysModal
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
          onNext={() => setStep(2)}
          onPrev={() => setStep(0)}
          step={1}
          totalStep={5}
        />
      )}
      {step === 2 && (
        <ClockOutModal
          clockOut={clockOut}
          setClockOut={setClockOut}
          ampm={ampm}
          setAmpm={setAmpm}
          onNext={() => setStep(3)}
          onPrev={() => setStep(1)}
          step={2}
          totalSteps={5}
        />
      )}

    {step === 3 && (
      <FocusModal
        focusTimer={focusTimer}
        setFocusTimer={setFocusTimer}
        onNext={() => setStep(4)}
        onPrev={() => setStep(2)}
      step={3}
        totalSteps={5}
      />
      )}

      {step === 4 && (
        <AvatarModal
         avatar={avatar}
          setAvatar={setAvatar}
          onNext={() => {setStep(5)}}
          onPrev={() => setStep(3)}
          step={4}
          totalSteps={5}
        />
      )}

      {step === 5 && (
        <ReminderModal
          reminders={reminders}
          setReminders={setReminders}
          onNext={handleOnboardingComplete}
          onPrev={() => setStep(4)}
          step={5}
          totalSteps={5}
        />
      )}
    </>
  );
}