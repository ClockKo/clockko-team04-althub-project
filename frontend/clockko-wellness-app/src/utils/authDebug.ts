// Debug utility to check authentication status
export function debugAuth() {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('user')
  
  console.log('🔐 Auth Debug Info:')
  console.log('Token exists:', !!token)
  console.log('Token length:', token?.length || 0)
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null')
  console.log('User data:', user ? JSON.parse(user) : 'null')
  
  // Try to decode JWT token (basic check)
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('Token payload:', payload)
      console.log('Token expires:', new Date(payload.exp * 1000))
      console.log('Token expired:', Date.now() > payload.exp * 1000)
    } catch (e) {
      console.log('Token decode error:', e)
    }
  }
  
  return { token, user }
}

// Check if user is properly authenticated
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('authToken')
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const isExpired = Date.now() >= payload.exp * 1000
    
    if (isExpired) {
      console.warn('🚨 Token has expired, please log in again')
      // Optionally clear expired token
      localStorage.removeItem('authToken')
      return false
    }
    
    return true
  } catch {
    return false
  }
}

// New function to check token expiration and warn user
export function checkTokenExpiration(): boolean {
  const token = localStorage.getItem('authToken')
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = new Date(payload.exp * 1000)
    const now = new Date()
    const timeUntilExpiry = expirationTime.getTime() - now.getTime()
    
    console.log('⏰ Token expires at:', expirationTime.toLocaleString())
    console.log('⏰ Time until expiry:', Math.round(timeUntilExpiry / 1000 / 60), 'minutes')
    
    if (timeUntilExpiry < 0) {
      console.error('🚨 Token has expired!')
      return false
    } else if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
      console.warn('⚠️ Token expires in less than 5 minutes')
    }
    
    return true
  } catch {
    return false
  }
}