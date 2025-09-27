// Quick localStorage inspection script
// Run this in browser console to check your time tracker data

console.log('🔍 TIME TRACKER DATA INSPECTION');
console.log('================================');

// Check current session
const currentSession = localStorage.getItem('timetracker_current_session');
console.log('📱 Current Session:');
if (currentSession) {
  const session = JSON.parse(currentSession);
  console.log('  ID:', session.id);
  console.log('  Type:', session.sessionType);
  console.log('  Status:', session.status);
  console.log('  Start:', new Date(session.startTime).toLocaleTimeString());
  console.log('  Planned Duration:', session.plannedDuration, 'minutes');
  if (session.actualDuration) {
    console.log('  Actual Duration:', session.actualDuration, 'minutes');
  }
} else {
  console.log('  ❌ No current session');
}

// Check daily summary
const dailySummary = localStorage.getItem('timetracker_daily_summary');
console.log('\n📊 Daily Summary:');
if (dailySummary) {
  const summaries = JSON.parse(dailySummary);
  const today = new Date().toISOString().split('T')[0];
  const todaysSummary = summaries[today];
  
  if (todaysSummary) {
    console.log('  Date:', todaysSummary.date);
    console.log('  Total Focus Sessions:', todaysSummary.totalFocusSessions);
    console.log('  Total Focus Time:', todaysSummary.totalFocusTime, 'seconds');
    console.log('  Total Break Time:', todaysSummary.totalBreakTime, 'seconds');
    console.log('  Sessions in Array:', todaysSummary.sessions.length);
    
    console.log('\n📋 Session Details:');
    todaysSummary.sessions.forEach((session, index) => {
      console.log(`  Session ${index + 1}:`);
      console.log(`    Type: ${session.sessionType}`);
      console.log(`    Status: ${session.status}`);
      console.log(`    Duration: ${session.actualDuration || 'N/A'} minutes`);
      console.log(`    Start: ${new Date(session.startTime).toLocaleTimeString()}`);
    });
  } else {
    console.log('  ❌ No summary for today');
  }
} else {
  console.log('  ❌ No daily summary data');
}

console.log('\n🛠️ QUICK FIXES:');
console.log('Clear stuck session: localStorage.removeItem("timetracker_current_session")');
console.log('Clear all data: localStorage.clear()');
console.log('Clear just time tracker: ["timetracker_current_session", "timetracker_daily_summary"].forEach(k => localStorage.removeItem(k))');