/* BreakTracker.tsx             # UI for tracking breaks*/ 

import React from 'react';
import './breakTracker.css'; // Dedicated CSS for break tracker
import dropdownArrowIcon from "../../../../assets/images/Search Icon Right (4).png"; // Custom dropdown arrow icon (Adjust path if necessary)

interface BreakTrackerProps {
  isBreakDropdownOpen: boolean;
  setIsBreakDropdownOpen: (isOpen: boolean) => void;
  startBreak: (minutes: number) => void;
}

const BreakTracker: React.FC<BreakTrackerProps> = ({
  isBreakDropdownOpen,
  setIsBreakDropdownOpen,
  startBreak,
}) => {
  return (
    <div className="take-break-dropdown-wrapper">
      <button
        className="timer-button take-break-button"
        onClick={() => setIsBreakDropdownOpen(!isBreakDropdownOpen)}
      >
        Take a Break <img src={dropdownArrowIcon} alt="Dropdown arrow" className="button-icon dropdown-arrow-icon" />
      </button>
      {isBreakDropdownOpen && (
        <div className="dropdown-menu break-dropdown-menu">
          <button onClick={() => startBreak(15)}>15 min</button>
          <button onClick={() => startBreak(25)}>25 min</button>
          <button onClick={() => startBreak(30)}>30 min</button>
        </div>
      )}
    </div>
  );
};

export default BreakTracker;