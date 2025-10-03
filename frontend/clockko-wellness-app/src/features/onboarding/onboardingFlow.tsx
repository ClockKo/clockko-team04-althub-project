// onboarding overview and modal dialog overlay

import { useState } from "react";
import {WelcomeModal} from "./modals/welcomeModal";
import {WorkDaysModal} from "./modals/workdaysModal";
import { ClockOutModal } from "./modals/clockOutModal";
import { FocusModal } from "./modals/focusModal";
import { AvatarModal } from "./modals/avatarModal";
import { ReminderModal } from "./modals/reminderModal";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { useNavigate } from "react-router-dom";
import { completeOnboarding as saveOnboardingToBackend } from "./api";
import toast from 'react-hot-toast';

export function OnboardingFlow() {
  const { completeOnboarding: markOnboardingComplete } = useOnboarding();
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
  const navigate = useNavigate();

  const handleOnboardingComplete = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Saving your preferences...');
      
      // Save avatar to localStorage (until backend API is ready)
      if (avatar) {
        localStorage.setItem('userAvatar', avatar);
        console.log('💾 Avatar saved to localStorage:', avatar);
      }
      
      // Save onboarding data to backend
      await saveOnboardingToBackend({
        selectedDays,
        clockOut,
        ampm,
        focusTimer,
        reminders,
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success('Welcome to ClockKo! Your preferences have been saved.');
      
      // Mark onboarding as complete
      markOnboardingComplete();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      // Show error toast
      toast.error(error.message || 'Failed to save your preferences. Please try again.');
      
      // Still complete onboarding locally to avoid blocking user
      markOnboardingComplete();
      navigate('/dashboard');
    }
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