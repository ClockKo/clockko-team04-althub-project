/*
Debug utility for Time Tracker localStorage
Run these commands in browser console to debug issues
*/

// Clear all time tracker data
function clearAllTimeTrackerData() {
    localStorage.removeItem('timetracker_daily_summary');
    localStorage.removeItem('timetracker_current_session');
    localStorage.removeItem('timetracker_user_sessions');
    console.log('🧹 All time tracker data cleared!');
}

// View current session
function viewCurrentSession() {
    const session = localStorage.getItem('timetracker_current_session');
    if (session) {
        console.log('📱 Current session:', JSON.parse(session));
    } else {
        console.log('📱 No current session found');
    }
}

// View daily summary
function viewDailySummary() {
    const summary = localStorage.getItem('timetracker_daily_summary');
    if (summary) {
        console.log('📊 Daily summary:', JSON.parse(summary));
    } else {
        console.log('📊 No daily summary found');
    }
}

// Clear only stuck session
function clearStuckSession() {
    localStorage.removeItem('timetracker_current_session');
    console.log('🔄 Stuck session cleared!');
}

// Export for console use
window.timeTrackerDebug = {
    clearAll: clearAllTimeTrackerData,
    viewSession: viewCurrentSession,
    viewSummary: viewDailySummary,
    clearStuckSession: clearStuckSession
};

console.log('🔧 Time Tracker Debug Utils loaded! Use:');
console.log('  timeTrackerDebug.clearAll() - Clear all data');
console.log('  timeTrackerDebug.viewSession() - View current session');
console.log('  timeTrackerDebug.viewSummary() - View daily summary');
console.log('  timeTrackerDebug.clearStuckSession() - Clear stuck session only');