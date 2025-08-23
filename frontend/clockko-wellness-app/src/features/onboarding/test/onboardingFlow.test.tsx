import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import {OnboardingFlow} from "../onboardingFlow";

describe("Onboarding Modal Flow", () => {
  it("renders WelcomeModal as first step", () => {
    render(<OnboardingFlow />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("transitions to WorkDaysModal after clicking Next on WelcomeModal", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/choose your work days/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
  });

  it("allows selecting workdays and moves to ClockOutModal", () => {
    render(<OnboardingFlow />);
    // Next to WorkDaysModal
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // Select days
    fireEvent.click(screen.getByText(/monday/i));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/set your clock-out time/i)).toBeInTheDocument();
  });

  it("allows editing clock-out time and moves to FocusTimerModal", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // Welcome -> WorkDays
    fireEvent.click(screen.getByText(/monday/i));
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // WorkDays -> ClockOut
    fireEvent.change(screen.getByLabelText(/hour/i), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/minute/i), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/set your focus timer/i)).toBeInTheDocument();
  });

  it("allows editing focus timer and moves to AvatarModal", () => {
    render(<OnboardingFlow />);
    // Progress through previous steps
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // Welcome -> WorkDays
    fireEvent.click(screen.getByText(/monday/i));
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // WorkDays -> ClockOut
    fireEvent.change(screen.getByLabelText(/hour/i), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/minute/i), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // ClockOut -> FocusTimer
    fireEvent.change(screen.getByLabelText(/hour/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/minute/i), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/choose an avatar/i)).toBeInTheDocument();
  });

  it("allows avatar selection and moves to RemindersModal", () => {
    render(<OnboardingFlow />);
    // Progress through previous steps
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // Welcome -> WorkDays
    fireEvent.click(screen.getByText(/monday/i));
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // WorkDays -> ClockOut
    fireEvent.change(screen.getByLabelText(/hour/i), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/minute/i), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // ClockOut -> FocusTimer
    fireEvent.change(screen.getByLabelText(/hour/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/minute/i), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i })); // FocusTimer -> Avatar
    fireEvent.click(screen.getAllByRole("button", { name: /avatar/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/enable reminders/i)).toBeInTheDocument();
  });

  it("allows toggling reminder switches and completes onboarding", () => {
    render(<OnboardingFlow />);
    // Welcome -> WorkDays
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // Select a workday
    fireEvent.click(screen.getByText(/monday/i));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // ClockOut
    fireEvent.change(screen.getByLabelText(/hour/i), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/minute/i), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // FocusTimer
    fireEvent.change(screen.getByLabelText(/hour/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/minute/i), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // Avatar
    fireEvent.click(screen.getAllByRole("button", { name: /avatar/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // Reminders
    fireEvent.click(screen.getByRole("switch", { name: /guided shutdown reminders/i }));
    fireEvent.click(screen.getByRole("switch", { name: /work break reminders/i }));
    fireEvent.click(screen.getByRole("switch", { name: /due tasks reminders/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // Expect a completion message or dashboard transition
    expect(
      screen.getByText(/onboarding complete|dashboard/i)
    ).toBeInTheDocument();
  });

  // Add more tests for edge cases, previous button, validation, etc.
});