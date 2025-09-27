// Global debug functions for browser console access
// Add this to make debug functions globally available

import { debugAuth, isAuthenticated, checkTokenExpiration } from './authDebug'
import { testAuthenticatedRequest, testClockInRequest } from './testAuth'

// Make functions globally available for console debugging
declare global {
  interface Window {
    debugAuth: typeof debugAuth
    isAuthenticated: typeof isAuthenticated
    checkTokenExpiration: typeof checkTokenExpiration
    testAuthenticatedRequest: typeof testAuthenticatedRequest
    testClockInRequest: typeof testClockInRequest
  }
}

// Only expose in development
if (import.meta.env.DEV) {
  window.debugAuth = debugAuth
  window.isAuthenticated = isAuthenticated
  window.checkTokenExpiration = checkTokenExpiration
  window.testAuthenticatedRequest = testAuthenticatedRequest
  window.testClockInRequest = testClockInRequest
  
  console.log('🔧 Debug functions available:')
  console.log('- window.debugAuth()')
  console.log('- window.isAuthenticated()')
  console.log('- window.checkTokenExpiration()')
  console.log('- window.testAuthenticatedRequest()')
  console.log('- window.testClockInRequest()')
}