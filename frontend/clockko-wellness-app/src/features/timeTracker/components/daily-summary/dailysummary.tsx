
/* DailySummary.tsx             # Displays daily hours summary */
import React from 'react';
import './dailySummary.css'; // Dedicated CSS for daily summary
import { formatTotalTime } from '../../utils/timeUtils'; // **UPDATED IMPORT**

// Import session summary images 
import thunderBolt from "../../../../assets/images/frame3.png";
import clock from "../../../../assets/images/frame2.png";
import teaCup from "../../../../assets/images/Frame 1984079211.png";

interface DailySummaryProps {
  totalFocusSessions: number;
  totalFocusTime: number; // in seconds
  totalBreakTime: number; // in seconds
}

const DailySummary: React.FC<DailySummaryProps> = ({
  totalFocusSessions,
  totalFocusTime,
  totalBreakTime,
}) => {
  return (
    <div className="summary-panel">
      {/* first summary panel */}
      <div className="first-panel">
        <div className="first-panel-image">
          <img src={thunderBolt} alt="thunderbolt" />
        </div>
        <div className="first-panel-text">
          <p>{totalFocusSessions} sessions</p>
          <p>Total Focus Sessions</p>
        </div>
      </div>
      {/* second summary panel */}
      <div className="second-panel">
        <div className="second-panel-image">
          <img src={clock} alt="clock" />
        </div>
        <div className="second-panel-text">
          <p>{formatTotalTime(totalFocusTime)}</p>
          <p>Total Focus Time</p>
        </div>
      </div>
      {/* third summary panel */}
      <div className="third-panel">
        <div className="third-panel-image">
          <img src={teaCup} alt="teaCup" />
        </div>
        <div className="third-panel-text">
          <p>{formatTotalTime(totalBreakTime)}</p>
          <p>Total Break Time</p>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;