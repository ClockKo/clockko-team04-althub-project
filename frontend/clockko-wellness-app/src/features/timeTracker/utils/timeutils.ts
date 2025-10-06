/*
 * timeUtils.ts
 * Time calculations, formatting, helpers
 */

// Define timer durations in seconds
export const FOCUS_DEFAULT_DURATION: number = 30 * 60; // 30 minutes
export const BREAK_DEFAULT_DURATION: number = 5 * 60;  // 5 minutes

/**
 * Helper function to format time (MM:SS) for display.
 * @param time The time in seconds.
 * @returns A string in "MM:SS" format.
 */
export const formatTime = (time: number): string => {
    const minutes: number = Math.floor(time / 60);
    const seconds: number = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Helper function to format total time (e.g., "1hr 30min") for display in summary.
 * @param totalSeconds The total time in seconds.
 * @returns A formatted string like "1hr 30min" or "0min".
 */
export const formatTotalTime = (totalSeconds: number): string => {
    if (totalSeconds === 0) return "0min";

    const hours: number = Math.floor(totalSeconds / 3600);
    const minutes: number = Math.floor((totalSeconds % 3600) / 60);

    let formattedString: string = "";
    if (hours > 0) {
        formattedString += `${hours}hr `;
    }
    if (minutes > 0) {
         formattedString += `${minutes}min`;
    } else if (hours === 0 && minutes === 0 && totalSeconds > 0) {
        // If less than a minute but more than 0 seconds, show <1min
        formattedString += "<1min";
    }

    // console.log('🕰️ formatTotalTime result:', formattedString)
    return formattedString;
    // return formattedString.trim(); // Remove trailing space if only minutes were added
};