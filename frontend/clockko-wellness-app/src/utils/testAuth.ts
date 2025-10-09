// Quick test API function to verify authentication
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export async function testAuthenticatedRequest() {
  const token = localStorage.getItem('authToken')
  
  console.log('🧪 Testing Authentication:')
  console.log('Token exists:', !!token)
  console.log('Token preview:', token ? `${token.substring(0, 50)}...` : 'null')
  
  if (!token) {
    console.log('❌ No token found')
    return { success: false, error: 'No token found' }
  }

  try {
    console.log('📡 Making test request to /api/dashboard/current-session')
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/current-session`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    
    console.log('✅ Request successful:', response.data)
    return { success: true, data: response.data }
    
  } catch (error: any) {
    console.log('❌ Request failed:', error.response?.status, error.response?.data)
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message,
      status: error.response?.status
    }
  }
}

export async function testClockInRequest() {
  const token = localStorage.getItem('authToken')
  
  if (!token) {
    return { success: false, error: 'No token found' }
  }

  try {
    console.log('📡 Making test clock-in request')
    const response = await axios.post(`${API_BASE_URL}/api/dashboard/clock-in`, {}, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    
    console.log('✅ Clock-in successful:', response.data)
    return { success: true, data: response.data }
    
  } catch (error: any) {
    console.log('❌ Clock-in failed:', error.response?.status, error.response?.data)
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message,
      status: error.response?.status
    }
  }
}