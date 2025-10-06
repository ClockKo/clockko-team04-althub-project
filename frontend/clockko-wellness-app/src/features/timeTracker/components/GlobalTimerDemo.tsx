/**
 * GlobalTimerDemo - Demo component to show persistent timer functionality
 * 
 * This component demonstrates how the global timer continues running
 * even when you navigate away from the TimeTracker feature.
 */

import { useGlobalTimer } from '../hooks/useGlobalTimer'
import { formatTime } from '../utils/timeutils'

export function GlobalTimerDemo() {
  const {
    mode,
    timeLeft,
    isRunning,
    startFocusSession,
    startBreakSession,
    pause,
    resume,
    stop,
  } = useGlobalTimer()

  const handleStartFocus = () => {
    startFocusSession(25) // 25 minutes
  }

  const handleStartBreak = () => {
    startBreakSession(5, true) // 5 minutes, pause current focus if any
  }

  const getModeDisplay = () => {
    switch (mode) {
      case 'initial':
        return '🌙 Ready to start'
      case 'focus':
        return '🎯 Focus Session'
      case 'break':
        return '☕ Break Time'
      case 'completed':
        return '✅ Session Complete'
      default:
        return mode
    }
  }

  const getStatusColor = () => {
    if (!isRunning) return '#6b7280'
    return mode === 'focus' ? '#3b82f6' : '#10b981'
  }

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: '#f9fafb',
      maxWidth: '400px',
      margin: '20px auto',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
        Global Timer Demo
      </h3>
      
      <div style={{ 
        fontSize: '14px', 
        color: '#6b7280', 
        marginBottom: '16px',
        fontStyle: 'italic' 
      }}>
        This timer persists across navigation!
      </div>
      
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: getStatusColor(),
        marginBottom: '8px'
      }}>
        {formatTime(timeLeft)}
      </div>
      
      <div style={{
        fontSize: '16px',
        color: '#4b5563',
        marginBottom: '20px'
      }}>
        {getModeDisplay()}
        {isRunning && (
          <span style={{ marginLeft: '8px', color: '#10b981' }}>
            ⏰ Running
          </span>
        )}
      </div>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {mode === 'initial' && (
          <>
            <button
              onClick={handleStartFocus}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Start Focus (25min)
            </button>
            <button
              onClick={handleStartBreak}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Start Break (5min)
            </button>
          </>
        )}
        
        {isRunning && (
          <button
            onClick={pause}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Pause
          </button>
        )}
        
        {!isRunning && mode !== 'initial' && (
          <button
            onClick={resume}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Resume
          </button>
        )}
        
        {mode !== 'initial' && (
          <button
            onClick={stop}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Stop
          </button>
        )}
      </div>
      
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#e0f2fe',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#0369a1'
      }}>
        💡 Try starting a timer, then navigate to another page. 
        The timer keeps running and you'll get notifications when it completes!
      </div>
    </div>
  )
}

export default GlobalTimerDemo