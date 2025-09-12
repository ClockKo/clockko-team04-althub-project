/*
TimeTrackerPanel.tsx
  # Main panel integrating all time tracking features
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
import { FOCUS_DEFAULT_DURATION, BREAK_DEFAULT_DURATION, formatTime, formatTotalTime } from "../../utils/timeutils"; // **UPDATED IMPORT**

function TimeTrackerPanel() {

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
        setIsRunning(false);
        setMode('initial');
        setTimeLeft(FOCUS_DEFAULT_DURATION); // Always reset to default focus duration
        setFocusDuration(FOCUS_DEFAULT_DURATION); // Also reset focus duration state
        setIsDropdownOpen(false); // Close start dropdown
        setIsBreakDropdownOpen(false); // Close break dropdown
    };

    // Handler for when the timer reaches 0
    const handleTimerCompletion = () => {
        if (mode === 'focus') {
            setMode('completed'); // Set to completed after focus, to prompt for break
            console.log("Focus session completed!");
            setTotalFocusSessions(prev => prev + 1); // Increment session count
            setTotalFocusTime(prev => prev + focusDuration); // Add completed focus duration
        } else if (mode === 'break') {
            setMode('initial'); // After break, go back to initial state, ready for next focus
            setTimeLeft(focusDuration); // Set time back to the last selected focus duration
            console.log("Break session completed!");
            setTotalBreakTime(prev => prev + breakDuration); // Add completed break duration
        }
        setIsRunning(false); // Ensure timer is not running
        setIsBreakDropdownOpen(false); // Close break dropdown if open
    };

    // Starts a break timer with a specified duration
    const startBreak = (minutes: number) => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current); // Using window.clearInterval
        }
        const duration = minutes * 60; // Convert minutes to seconds
        setIsRunning(true);
        setMode('break');
        setTimeLeft(duration);
        setBreakDuration(duration); // Update current break duration state
        setIsDropdownOpen(false); // Close any open dropdowns
        setIsBreakDropdownOpen(false);
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