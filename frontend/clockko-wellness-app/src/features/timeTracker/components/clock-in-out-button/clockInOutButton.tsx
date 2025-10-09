/*
ClockInOutButton.tsx         # Button for manual clock in/out
*/
import React from 'react';
import './clockInOutButton.css'; 
import dropdownArrowIcon from "../../../../assets/images/Search Icon Right (4).png"; // Custom dropdown arrow icon 
import pauseIcon from "../../../../assets/images/bluepauseicon.png"; // natively blue pause icon 
import resumeIcon from "../../../../assets/images/playIcon.png"; // resume/play icon
import { useGlobalTimer } from '../../hooks/useGlobalTimer'; 

interface ClockInOutButtonProps {
  mode: 'initial' | 'focus' | 'break' | 'completed';
  isRunning: boolean;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  BREAK_DEFAULT_DURATION: number; // Pass constant
}

const ClockInOutButton: React.FC<ClockInOutButtonProps> = ({
  mode,
  isRunning,
  isDropdownOpen,
  setIsDropdownOpen,
  BREAK_DEFAULT_DURATION,
}) => {
  // --- Global Timer Integration ---
  const globalTimer = useGlobalTimer()

  // Updated handlers that use global timer
  const handleStartFocus = async (minutes: number) => {
    setIsDropdownOpen(false) // Close dropdown
    await globalTimer.startFocusSession(minutes)
    // No need to call selectFocusPresetAndStart - global timer handles everything
  }

  const handlePause = () => {
    globalTimer.pause()
    // No need to call pauseTimer - global timer handles everything
  }

  const handleResume = () => {
    globalTimer.resume()
    // No need to call resumeCurrentTimer - global timer handles everything
  }

  const handleStop = async () => {
    console.log('🛑 Stop button clicked!')
    console.log('🛑 Current mode before stop:', mode)
    console.log('🛑 Current globalTimer state before stop:', globalTimer.mode, globalTimer.isRunning)
    
    await globalTimer.stop()
    
    console.log('🛑 Stop completed. New globalTimer state:', globalTimer.mode, globalTimer.isRunning)
    // No need to call stopTimer - global timer handles everything
  }

  const handleStartBreak = async (minutes: number) => {
    await globalTimer.startBreakSession(minutes, true) // true = pause any active focus session
    // No need to call startBreak - global timer handles everything
  }
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
              <button onClick={() => handleStartFocus(1)}>1 min</button>
              <button onClick={() => handleStartFocus(5)}>5 min</button>
              <button onClick={() => handleStartFocus(10)}>10 min</button>
              <button onClick={() => handleStartFocus(15)}>15 min</button>
              <button onClick={() => handleStartFocus(20)}>20 min</button>
              <button onClick={() => handleStartFocus(25)}>25 min</button>
              <button onClick={() => handleStartFocus(30)}>30 min</button>
              <button onClick={() => handleStartFocus(45)}>45 min</button>
              <button onClick={() => handleStartFocus(60)}>1 hr</button>
              <button onClick={() => handleStartFocus(75)}>1 hr 15 min</button>
              <button onClick={() => handleStartFocus(90)}>1 hr 30 min</button>
              <button onClick={() => handleStartFocus(105)}>1 hr 45 min</button>
              <button onClick={() => handleStartFocus(120)}>2 hr</button>
            </div>
          )}
        </div>
      );
    }
    // Case 2: Timer is RUNNING (either focus or break) - Show Pause and Stop
    else if (isRunning) {
      return (
        <div className="active-running-controls">
          <button className="timer-button pause-button" onClick={handlePause}>
            Pause <img src={pauseIcon} alt="Pause" className="button-icon pause-icon" />
          </button>
          <button className="timer-button stop-button" onClick={handleStop}>
            Stop
          </button>
        </div>
      );
    }
    // Case 3: Timer is PAUSED (either focus or break) - Show Resume (Take a Break is handled by BreakTracker)
    else if (!isRunning && mode !== 'initial' && mode !== 'completed') {
      return (
        <div className="active-paused-controls">
          <button className="timer-button start-resume-button" onClick={handleResume}>
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
          <button className="timer-button start-break-button" onClick={() => handleStartBreak(BREAK_DEFAULT_DURATION / 60)}>
            Start Break
          </button>
          <button className="timer-button stop-button" onClick={handleStop}>
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

