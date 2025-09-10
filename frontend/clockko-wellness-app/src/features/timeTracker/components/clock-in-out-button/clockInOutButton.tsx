/*
ClockInOutButton.tsx         # Button for manual clock in/out
*/
import React from 'react';
import './clockInOutButton.css'; 
import dropdownArrowIcon from "../../../../assets/images/Search Icon Right (4).png"; // Custom dropdown arrow icon 
import pauseIcon from "../../../../assets/images/bluepauseicon.png"; // natively blue pause icon 
import resumeIcon from "../../../../assets/images/playIcon.png"; // resume/play icon 

interface ClockInOutButtonProps {
  mode: 'initial' | 'focus' | 'break' | 'completed';
  isRunning: boolean;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  selectFocusPresetAndStart: (minutes: number) => void;
  resumeCurrentTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  startBreak: (minutes: number) => void; // For the 'Start Break' button in completed mode
  BREAK_DEFAULT_DURATION: number; // Pass constant
}

const ClockInOutButton: React.FC<ClockInOutButtonProps> = ({
  mode,
  isRunning,
  isDropdownOpen,
  setIsDropdownOpen,
  selectFocusPresetAndStart,
  resumeCurrentTimer,
  pauseTimer,
  stopTimer,
  startBreak,
  BREAK_DEFAULT_DURATION,
}) => {
  // Renders the appropriate buttons based on the current timer state
  const renderButton = () => {
    // Case 1: Initial state (before any timer starts, show Start with dropdown)
    if (mode === 'initial' && !isRunning) {
      return (
        <div className="combined-timer-button-wrapper">
          <button
            className="timer-button start-resume-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Start <img src={dropdownArrowIcon} alt="Dropdown arrow" className="button-icon dropdown-arrow-icon" />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => selectFocusPresetAndStart(30)}>30 min </button>
              <button onClick={() => selectFocusPresetAndStart(60)}>1 hr </button>
              <button onClick={() => selectFocusPresetAndStart(90)}>1 hr 30 min </button>
            </div>
          )}
        </div>
      );
    }
    // Case 2: Timer is RUNNING (either focus or break) - Show Pause and Stop
    else if (isRunning) {
      return (
        <div className="active-running-controls">
          <button className="timer-button pause-button" onClick={pauseTimer}>
            Pause <img src={pauseIcon} alt="Pause" className="button-icon pause-icon" />
          </button>
          <button className="timer-button stop-button" onClick={stopTimer}>
            Stop
          </button>
        </div>
      );
    }
    // Case 3: Timer is PAUSED (either focus or break) - Show Resume (Take a Break is handled by BreakTracker)
    else if (!isRunning && mode !== 'initial' && mode !== 'completed') {
      return (
        <div className="active-paused-controls">
          <button className="timer-button start-resume-button" onClick={resumeCurrentTimer}>
            Resume <img src={resumeIcon} alt="Resume" className="button-icon resume-icon" />
          </button>
          {/* Take a Break button (with its own dropdown) is a sibling in TimeTrackerPanel */}
          {/* The Stop button disappears when paused */}
        </div>
      );
    }
    // Case 4: Timer completed a focus session (prompting for break) - Show Start Break and Stop
    else if (mode === 'completed' && !isRunning) {
      return (
        <div className="completed-session-controls">
          <button className="timer-button start-break-button" onClick={() => startBreak(BREAK_DEFAULT_DURATION / 60)}>
            Start Break
          </button>
          <button className="timer-button stop-button" onClick={stopTimer}>
            Stop
          </button>
        </div>
      );
    }
    return null; // would ideally cover all states, but a fallback is good here...lol.
  };

  return <>{renderButton()}</>;
};

export default ClockInOutButton;

