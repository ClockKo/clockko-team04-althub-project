import axios from 'axios'

// Create an axios instance with base URL and authorization header
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}`,
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')  // Fixed: Use 'authToken' instead of 'token'
  if (token) {
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const isExpired = Date.now() >= payload.exp * 1000
      
      if (isExpired) {
        console.error('🚨 Tasks API: Token has expired, redirecting to login...')
        localStorage.removeItem('authToken')
        window.location.href = '/signin'
        return Promise.reject(new Error('Token expired'))
      }
      
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Tasks API: Valid token attached to request')
    } catch (e) {
      console.error('🚨 Tasks API: Invalid token format', e)
      localStorage.removeItem('authToken')
      window.location.href = '/signin'
      return Promise.reject(new Error('Invalid token'))
    }
  } else {
    console.warn('⚠️ Tasks API: No auth token found')
  }
  return config
})

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('🚫 Tasks API: 403 Forbidden - Token might be invalid or expired')
    }
    return Promise.reject(error)
  }
)

export default api
