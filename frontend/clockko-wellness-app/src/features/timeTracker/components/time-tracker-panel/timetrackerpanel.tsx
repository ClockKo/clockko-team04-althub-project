/*
TimeTrackerPanel.tsx
  # Main panel integratin    // --- Koala State ---
    const [currentKoalaImage, setCurrentKoalaImage] = useState(koalaInitial);
    const [currentSpeechBubbleText, setCurrentS    // Effect for updating Koala Image and Speech Bubble text based on mode and running status
    useEffect(() => {
        if (mode === 'initial') {
            setCurrentKoalaImage(koalaInitial);
            setCurrentSpeechBubbleText("Wake me up when it's time to get serious");
        } else if (isRunning && mode === 'focus') {
            // Timer is running and it's a FOCUS session
            setCurrentKoalaImage(koalaFocus);
            setCurrentSpeechBubbleText(`You're locked in, ${name}. Let's do this!`);
        } else if (isRunning && mode === 'break') {
            // Timer is running and it's a BREAK session
            setCurrentKoalaImage(koalaHappy);
            if (pausedFocusSession) {
                setCurrentSpeechBubbleText(`Enjoy your break, ${name}! Your focus session will resume after.`);
            } else {
                setCurrentSpeechBubbleText(`Take a breather, ${name}! You've earned it.`);
            }
        } else {
            // All other states:
            // - Paused (focus or break)
            // - Completed Focus (transitioning to break)
            setCurrentKoalaImage(koalaHappy);
            if (pausedFocusSession && mode === 'break') {
                setCurrentSpeechBubbleText(`Focus session paused. Enjoying your break, ${name}?`);
            } else {
                setCurrentSpeechBubbleText(`Hey ${name}. Great Job! Need a break?`);
            }
        }
    }, [mode, isRunning, name, pausedFocusSession]); // Rerun when mode, isRunning, name, or pausedFocusSession changes useState("Wake me up when it's time to get serious");

    // Load daily summary and handle session recovery on component mount
    useEffect(() => {
        console.log("🔄 TimeTrackerPanel mounting, checking for sessions...");
        
        // Check for stuck active sessions (only if they're actually problematic)
        const currentSession = timeTrackerService.getCurrentSession();
        if (currentSession) {
            console.log("🔄 Found existing session on mount:", currentSession);
            
            // Only clean up if it's truly stuck (running for more than reasonable time)
            const startTime = new Date(currentSession.startTime);
            const now = new Date();
            const runningTime = (now.getTime() - startTime.getTime()) / 1000 / 60; // minutes
            
            // Only clean up sessions that have been running for more than 3 hours (clearly stuck)
            if (runningTime > 180) { 
                console.log(`🧹 Session running for ${runningTime.toFixed(1)} minutes (>3hrs), clearing stuck session`);
                localStorage.removeItem('timetracker_current_session');
            } else if (currentSession.status === 'active') {
                // If session is marked as active but timer isn't running in UI, user might have navigated away
                console.log("ℹ️ Active session found, but timer is not running in UI. User may have navigated away.");
                // Don't auto-clear, let user decide what to do
                setCurrentSession(currentSession); // Restore session state
            } else {
                console.log("ℹ️ Session exists but not problematic, leaving it alone");
            }
        }
        
        // Load daily summary immediately (no delay needed)
        console.log("🔄 About to load daily summary on mount...");
        timeTrackerService.getDailySummary().then(summary => {
            console.log("📊 Got daily summary on mount:", summary);
            console.log("🔄 Setting state - Focus Sessions:", summary.totalFocusSessions, "Focus Time:", summary.totalFocusTime, "Break Time:", summary.totalBreakTime);
            
            setTotalFocusSessions(summary.totalFocusSessions);
            setTotalFocusTime(summary.totalFocusTime);
            setTotalBreakTime(summary.totalBreakTime);
            setIsDataLoaded(true);
            
            console.log("✅ State updated on mount - Data loaded flag set to true");
        }).catch(error => {
            console.error("❌ Failed to load daily summary on mount:", error);
        });
    }, []);

    // Secondary effect to ensure data is loaded after a brief delay (fallback mechanism)
    useEffect(() => {
        if (!isDataLoaded) {
            const fallbackTimer = setTimeout(() => {
                console.log("🔄 Fallback: Data not loaded yet, trying again...");
                timeTrackerService.getDailySummary().then(summary => {
                    if (!isDataLoaded) {
                        console.log("🔄 Fallback: Loading data that wasn't loaded in primary effect");
                        setTotalFocusSessions(summary.totalFocusSessions);
                        setTotalFocusTime(summary.totalFocusTime);
                        setTotalBreakTime(summary.totalBreakTime);
                        setIsDataLoaded(true);
                    }
                });
            }, 500); // Try again after 500ms if data wasn't loaded

            return () => clearTimeout(fallbackTimer);
        }
    }, [isDataLoaded]);

    // Add cleanup effect to log what happens when component unmounts
    useEffect(() => {
        return () => {
            console.log("⚠️ TimeTrackerPanel unmounting...");
            const currentSession = localStorage.getItem('timetracker_current_session');
            const dailySummary = localStorage.getItem('timetracker_daily_summary');
            console.log("📱 Session on unmount:", currentSession ? JSON.parse(currentSession) : null);
            console.log("📊 Summary on unmount:", dailySummary ? JSON.parse(dailySummary) : null);
        };
    }, []);ll time tracker components
  # Includes localStorage service integration for immediate functionality
  # Ready for backend API integration when available
*/

import { useState, useEffect, useRef } from "react";
import "./timeTrackerPanel.css"; // Main CSS for this panel 

// Koala images for different states
import koalaInitial from "../../../../assets/images/Poses.png"; // Koala on tree, sleeping (Initial)
import koalaSpeechBubble from "../../../../assets/images/Koala Speech Bubble.png"; // The speech bubble image
import koalaFocus from "../../../../assets/images/Poses2.png"; // Koala focused (Running Focus ONLY)
import koalaHappy from "../../../../assets/images/Poses3.png";   // Koala happy (Paused, Running Break, Completed)

// Imported Components 
import ClockInOutButton from "../clock-in-out-button/clockInOutButton";
import BreakTracker from "../break-tracker/breaktracker";
import DailySummary from "../daily-summary/dailysummary";

// --- Time Utilities ---
import { FOCUS_DEFAULT_DURATION, BREAK_DEFAULT_DURATION, formatTime} from "../../utils/timeutils"; // **UPDATED IMPORT**

// --- Time Tracker Service ---
import { timeTrackerService, type FocusSession } from "../../services/timetrackerservice";

function TimeTrackerPanel() {
    // TODO: Add user context integration when backend APIs are ready
    // const { user } = useAuth(); // Get user info for personalized messages
    const name = "Focus Champion"; // Placeholder name, replace with user.name when auth is ready
    
    // Utility function to refresh UI with latest data
    const refreshDailySummary = async () => {
        try {
            const summary = await timeTrackerService.getDailySummary();
            setTotalFocusSessions(summary.totalFocusSessions);
            setTotalFocusTime(summary.totalFocusTime);
            setTotalBreakTime(summary.totalBreakTime);
            console.log("🔄 UI refreshed with latest data:", summary);
            return summary;
        } catch (error) {
            console.error("Failed to refresh daily summary:", error);
            throw error;
        }
    };

    // Debug function to manually clear stuck sessions and refresh data
    const clearStuckSession = () => {
        const currentSession = timeTrackerService.getCurrentSession();
        const pausedSession = timeTrackerService.getPausedSession();
        
        if (currentSession || pausedSession || pausedFocusSession) {
            console.log("🧹 Manually clearing sessions:", { currentSession, pausedSession, pausedFocusSession });
            localStorage.removeItem('timetracker_current_session');
            localStorage.removeItem('timetracker_paused_session');
            setCurrentSession(null);
            setPausedFocusSession(null);
            setPausedFocusTimeLeft(null);
            
            // Force reload daily summary with recalculation
            refreshDailySummary();
        } else {
            console.log("ℹ️ No sessions to clear");
        }
    };

    // Debug function to manually refresh daily summary 
    const forceRefreshSummary = () => {
        console.log("🔄 Force refreshing daily summary...");
        
        // Log current localStorage state
        const currentSession = localStorage.getItem('timetracker_current_session');
        const dailySummary = localStorage.getItem('timetracker_daily_summary');
        
        console.log("📱 Current session in localStorage:", currentSession ? JSON.parse(currentSession) : null);
        console.log("📊 Daily summary in localStorage:", dailySummary ? JSON.parse(dailySummary) : null);
        
        refreshDailySummary();
    };
    
    // --- Timer State ---
    const [timeLeft, setTimeLeft] = useState(FOCUS_DEFAULT_DURATION); // Current time left on the timer
    const [isRunning, setIsRunning] = useState(false); // Whether the timer is actively counting down
    const [mode, setMode] = useState<'initial' | 'focus' | 'break' | 'completed'>('initial'); // Current mode of the timer
    const [focusDuration, setFocusDuration] = useState(FOCUS_DEFAULT_DURATION); // Stores the currently selected focus duration
    const [breakDuration, setBreakDuration] = useState(BREAK_DEFAULT_DURATION); // Default break duration (can be updated by dropdown)
    const timerRef = useRef<number | null>(null); // To store the interval ID for cleanup
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For "Start" button's focus duration dropdown
    const [isBreakDropdownOpen, setIsBreakDropdownOpen] = useState(false); // For "Take a Break" button's break duration dropdown

    // --- Session Tracking State ---
    const [totalFocusSessions, setTotalFocusSessions] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0); // in seconds
    const [totalBreakTime, setTotalBreakTime] = useState(0); // in seconds
    const [currentSession, setCurrentSession] = useState<FocusSession | null>(null); // Current active session
    const [pausedFocusSession, setPausedFocusSession] = useState<FocusSession | null>(null); // Paused focus session during break
    const [pausedFocusTimeLeft, setPausedFocusTimeLeft] = useState<number | null>(null); // Time left on paused focus session
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Track if data has been loaded


    // --- Koala State ---
    const [currentKoalaImage, setCurrentKoalaImage] = useState(koalaInitial);
    const [currentSpeechBubbleText, setCurrentSpeechBubbleText] = useState("Wake me up when it’s time to get serious");

    // Effect for the timer countdown logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => { // Using window.setInterval for browser context
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (timerRef.current) {
                window.clearInterval(timerRef.current); // Using window.clearInterval
            }
            handleTimerCompletion(); // Handle what happens after completion
        }

        // Cleanup function: Clear the interval when the component unmounts or dependencies change
        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current); // Using window.clearInterval
            }
        };
    }, [isRunning, timeLeft]); // Rerun effect when isRunning or timeLeft changes

    // Effect for updating Koala Image and Speech Bubble text based on mode and running status
    useEffect(() => {
        if (mode === 'initial') {
            setCurrentKoalaImage(koalaInitial);
            setCurrentSpeechBubbleText("Wake me up when it’s time to get serious");
        } else if (isRunning && mode === 'focus') {
            // Timer is running and it's a FOCUS session
            setCurrentKoalaImage(koalaFocus);
            setCurrentSpeechBubbleText(`You're locked in, ${name}. Let's do this!`);
        } else {
            // All other states:
            // - Paused (focus or break)
            // - Completed Focus (transitioning to break)
            // - Running Break Session
            setCurrentKoalaImage(koalaHappy);
            setCurrentSpeechBubbleText(`Hey ${name}. Great Job! Need a break?`);
        }
    }, [mode, isRunning, name]); // Rerun when mode, isRunning, or name changes

    // --- Timer Control Functions ---

    // Resumes a paused timer
    const resumeCurrentTimer = () => {
        setIsRunning(true);
        setIsDropdownOpen(false); // Ensure start dropdown is closed
        setIsBreakDropdownOpen(false); // Ensure break dropdown is closed
    };

    // Pauses the current timer
    const pauseTimer = () => {
        setIsRunning(false);
        if (timerRef.current) {
            window.clearInterval(timerRef.current); // Using window.clearInterval
        }
    };

    // Stops the timer and resets it to the initial state with default focus duration
    const stopTimer = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current); // Using window.clearInterval
        }
        
        // Stop active session if it exists
        if (currentSession) {
            timeTrackerService.stopFocusSession(currentSession.id).then(stoppedSession => {
                console.log("🛑 Session stopped:", stoppedSession);
                setCurrentSession(null);
                
                // Refresh daily summary to show updated stats
                return refreshDailySummary();
            }).catch(error => {
                console.error("Failed to stop session:", error);
            });
        }
        
        // If there's a paused focus session, stop it using the service
        const servicePausedSession = timeTrackerService.getPausedSession();
        if (servicePausedSession || pausedFocusSession) {
            const sessionToStop = servicePausedSession || pausedFocusSession;
            timeTrackerService.stopSessionManually(sessionToStop!).then(stoppedSession => {
                console.log("🛑 Paused focus session stopped:", stoppedSession);
                
                // Clear paused session storage
                localStorage.removeItem('timetracker_paused_session');
                
                // Refresh daily summary to show updated stats
                return refreshDailySummary();
            }).catch(error => {
                console.error("Failed to stop paused session:", error);
            });
        }
        
        // Clear all session state
        setIsRunning(false);
        setMode('initial');
        setTimeLeft(FOCUS_DEFAULT_DURATION); // Always reset to default focus duration
        setFocusDuration(FOCUS_DEFAULT_DURATION); // Also reset focus duration state
        setPausedFocusSession(null); // Clear paused session
        setPausedFocusTimeLeft(null); // Clear paused time
        setIsDropdownOpen(false); // Close start dropdown
        setIsBreakDropdownOpen(false); // Close break dropdown
    };

    // Handler for when the timer reaches 0
    const handleTimerCompletion = () => {
        if (mode === 'focus') {
            setMode('completed'); // Set to completed after focus, to prompt for break
            console.log("Focus session completed!");
            
            // Complete the session in localStorage service
            if (currentSession) {
                timeTrackerService.completeFocusSession(currentSession.id).then(completedSession => {
                    console.log("✅ Focus session completed and saved:", completedSession);
                    setCurrentSession(null);
                    
                    // Update UI with fresh data
                    return refreshDailySummary();
                }).catch(error => {
                    console.error("Failed to complete focus session:", error);
                });
            }
            
            // Legacy state updates (still needed for UI)
            setTotalFocusSessions(prev => prev + 1); // Increment session count
            setTotalFocusTime(prev => prev + focusDuration); // Add completed focus duration
        } else if (mode === 'break') {
            console.log("Break session completed!");
            
            // Complete the break session in localStorage service
            if (currentSession) {
                timeTrackerService.completeFocusSession(currentSession.id).then(completedSession => {
                    console.log("🌴✅ Break session completed and saved:", completedSession);
                    setCurrentSession(null);
                    
                    // Update UI with fresh data
                    return refreshDailySummary();
                }).catch(error => {
                    console.error("Failed to complete break session:", error);
                });
            }
            
            setTotalBreakTime(prev => prev + breakDuration); // Add completed break duration (legacy)
            
            // Check if there's a paused focus session to resume
            if (pausedFocusSession && pausedFocusTimeLeft !== null) {
                console.log("🔄 Resuming paused focus session after break:", pausedFocusSession);
                
                // Resume the focus session using the service
                timeTrackerService.resumeFocusSession(pausedFocusSession.id).then(resumedSession => {
                    setCurrentSession(resumedSession);
                    
                    // Restore focus mode and remaining time
                    setMode('focus');
                    setTimeLeft(pausedFocusTimeLeft);
                    setFocusDuration(pausedFocusSession.plannedDuration * 60); // Convert back to seconds
                    
                    // Clear the paused session state
                    setPausedFocusSession(null);
                    setPausedFocusTimeLeft(null);
                    
                    console.log("✅ Focus session resumed with", pausedFocusTimeLeft, "seconds remaining");
                }).catch(error => {
                    console.error("Failed to resume focus session:", error);
                    // Fallback: go to initial state
                    setMode('initial');
                    setTimeLeft(focusDuration);
                    setPausedFocusSession(null);
                    setPausedFocusTimeLeft(null);
                });
            } else {
                // No paused focus session, go back to initial state
                setMode('initial');
                setTimeLeft(focusDuration); // Set time back to the last selected focus duration
            }
        }
        setIsRunning(false); // Ensure timer is not running
        setIsBreakDropdownOpen(false); // Close break dropdown if open
    };

    // Starts a break timer with a specified duration
    const startBreak = (minutes: number) => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current); // Using window.clearInterval
        }
        
        // Preserve the paused focus session if it exists and is a focus session
        if (currentSession && currentSession.sessionType === 'focus' && mode === 'focus') {
            console.log("💾 Pausing focus session for break:", currentSession);
            
            // Pause the focus session using the service (it will handle storage)
            timeTrackerService.pauseFocusSession(currentSession.id).then(pausedSession => {
                setPausedFocusSession(pausedSession);
                setPausedFocusTimeLeft(timeLeft); // Save the remaining time for UI
                setCurrentSession(null); // Clear from UI state
                console.log("⏸️ Focus session paused in service:", pausedSession);
            }).catch(error => {
                console.error("Failed to pause focus session:", error);
                // Fallback to old method if service fails
                setPausedFocusSession(currentSession);
                setPausedFocusTimeLeft(timeLeft);
                setCurrentSession(null);
            });
        }
        
        const duration = minutes * 60; // Convert minutes to seconds
        setIsRunning(true);
        setMode('break');
        setTimeLeft(duration);
        setBreakDuration(duration); // Update current break duration state
        setIsDropdownOpen(false); // Close any open dropdowns
        setIsBreakDropdownOpen(false);
        
        // Start break session tracking with localStorage service
        timeTrackerService.startFocusSession(minutes, 'break').then(session => {
            setCurrentSession(session);
            console.log("🌴 Break session started:", session);
        }).catch(error => {
            console.error("Failed to start break session:", error);
            
            // If there's a stuck session, clear it and retry
            if (error.message.includes("Active") && error.message.includes("session already exists")) {
                console.log("🔄 Clearing stuck session for break...");
                localStorage.removeItem('timetracker_current_session');
                
                // Retry starting break session
                timeTrackerService.startFocusSession(minutes, 'break').then(session => {
                    setCurrentSession(session);
                    console.log("✅ Break session started after cleanup:", session);
                }).catch(retryError => {
                    console.error("❌ Still failed to start break after cleanup:", retryError);
                });
            }
        });
    };

    // Selects a focus preset duration and starts the timer
    const selectFocusPresetAndStart = (minutes: number) => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current); // Using window.clearInterval
        }
        const duration = minutes * 60; // Convert minutes to seconds
        setFocusDuration(duration); // Set the selected duration as the new focus duration
        setTimeLeft(duration);
        setMode('focus'); // Always starts a focus session
        setIsRunning(true);
        setIsDropdownOpen(false); // Close dropdown after selection
        setIsBreakDropdownOpen(false); // Close break dropdown if open
        
        // Start session tracking with localStorage service
        timeTrackerService.startFocusSession(minutes, 'focus').then(session => {
            setCurrentSession(session);
            console.log("🚀 Focus session started:", session);
        }).catch(error => {
            console.error("Failed to start session:", error);
            
            // If there's a stuck active session, try to clean it up and retry
            if (error.message.includes("Active") && error.message.includes("session already exists")) {
                console.log("🔄 Attempting to clean up stuck session and retry...");
                const stuckSession = timeTrackerService.getCurrentSession();
                if (stuckSession) {
                    // Force clear the stuck session
                    localStorage.removeItem('timetracker_current_session');
                    console.log("🧹 Cleared stuck session, retrying...");
                    
                    // Retry starting the session
                    timeTrackerService.startFocusSession(minutes, 'focus').then(session => {
                        setCurrentSession(session);
                        console.log("✅ Focus session started after cleanup:", session);
                    }).catch(retryError => {
                        console.error("❌ Still failed after cleanup:", retryError);
                    });
                }
            }
        });
    };

    return (
        <>
            <div className="panel">

                <div className="main-panel">
                    {/* body ui */}
                    <div className="panel-body">
                        <div className="panel-header">
                            <h1>Focus Timer</h1>
                            <p>Ready to get into deep work?</p>
                            {/* Temporary debug buttons - remove in production */}
                            <div style={{ marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={clearStuckSession} 
                                    style={{
                                        background: '#ff6b6b', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '5px 10px', 
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🧹 Clear Stuck Session
                                </button>
                                <button 
                                    onClick={forceRefreshSummary} 
                                    style={{
                                        background: '#4ecdc4', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '5px 10px', 
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔄 Refresh Summary
                                </button>
                                <span style={{ 
                                    fontSize: '12px', 
                                    color: isDataLoaded ? '#4caf50' : '#ff9800',
                                    alignSelf: 'center',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: isDataLoaded ? '#e8f5e8' : '#fff3e0'
                                }}>
                                    {isDataLoaded ? '✅ Data Loaded' : '⏳ Loading...'}
                                </span>
                                {(pausedFocusSession || timeTrackerService.hasPausedSession()) && (
                                    <span style={{ 
                                        fontSize: '12px', 
                                        color: '#ff9800',
                                        alignSelf: 'center',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: '#fff3e0'
                                    }}>
                                        ⏸️ Focus Paused ({Math.floor((pausedFocusTimeLeft || 0) / 60)}:{String((pausedFocusTimeLeft || 0) % 60).padStart(2, '0')})
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="panel-main">
                            <div className="panel-timer">
                                <h1 className="timer-display">{formatTime(timeLeft)}</h1>
                                <div className="timer-controls-group">
                                    {/* ClockInOutButton handles rendering based on mode and isRunning */}
                                    <ClockInOutButton
                                        mode={mode}
                                        isRunning={isRunning}
                                        isDropdownOpen={isDropdownOpen}
                                        setIsDropdownOpen={setIsDropdownOpen}
                                        selectFocusPresetAndStart={selectFocusPresetAndStart}
                                        resumeCurrentTimer={resumeCurrentTimer}
                                        pauseTimer={pauseTimer}
                                        stopTimer={stopTimer}
                                        startBreak={startBreak} // Passed for 'Start Break' button in completed mode
                                        BREAK_DEFAULT_DURATION={BREAK_DEFAULT_DURATION} // Passed constant
                                    />

                                    {/* BreakTracker only shows when paused during a focus/break session */}
                                    {(!isRunning && mode !== 'initial' && mode !== 'completed') && (
                                        <BreakTracker
                                            isBreakDropdownOpen={isBreakDropdownOpen}
                                            setIsBreakDropdownOpen={setIsBreakDropdownOpen}
                                            startBreak={startBreak}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="panel-timer-images">
                                <img src={currentKoalaImage} alt="Koala" className="koala-image"  />
                                <div className={`koola-box ${mode === 'initial' ? 'koola-box-initial-position' : ''}`}> {/* Dynamic class for koola-box */}
                                    <img src={koalaSpeechBubble} alt="koola speech bubble" />
                                    <p>{currentSpeechBubbleText}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Daily Summary Component */}
                    <DailySummary
                        totalFocusSessions={totalFocusSessions}
                        totalFocusTime={totalFocusTime}
                        totalBreakTime={totalBreakTime}
                    />
                </div>
            </div>
        </>
    );
}

export default TimeTrackerPanel;