/* TimeTrackerFeature.tsx           # Top-level feature entry point
*/ 

import { useHead } from '@unhead/react';
import TimeTrackerPanel from './components/time-tracker-panel/timetrackerpanel'; 


function TimeTrackerFeatures() {
  // Set meta tags for time tracker page
  useHead({
    title: 'Time Tracker - ClockKo | Advanced Time Tracking Tools',
    meta: [
      {
        name: 'description',
        content: 'Track your time with precision using ClockKo\'s advanced time tracking tools. Monitor work sessions, breaks, and productivity patterns.'
      },
      {
        name: 'robots',
        content: 'noindex, nofollow' // Protected pages should not be indexed
      }
    ]
  });

  return (
    <>
      <TimeTrackerPanel />
    </>
  );
}

export default TimeTrackerFeatures;