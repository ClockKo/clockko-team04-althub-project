import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000';

// Helper to get token
function getToken() {
  return localStorage.getItem('authToken') || '';
}


export async function fetchCurrentSession() {
  const token = getToken(); // Get token inside the function
  if (!token) return null; // Return null if no token

  try {
    const res = await axios.get(`${API_BASE_URL}/api/dashboard/current-session`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      // No active session - try to get last completed session
      return await fetchLastSession()
    }
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message)
    }
    throw new Error('Failed to fetch session')
  }
}

export async function fetchLastSession() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await axios.get(`${API_BASE_URL}/api/dashboard/last-session`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    return res.data
  } catch (e) {
    // If no last session exists, return null (first time user)
    console.log('No previous session found:', e)
    return null
  }
}

export async function clockIn() {
  const token = getToken(); // Get token inside the function
  if (!token) throw new Error('You must be logged in to clock in.');

  try {
    const res = await axios.post(`${API_BASE_URL}/api/dashboard/clock-in`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message)
    }
    throw new Error('Failed to clock in')
  }
}

export async function clockOut() {
  const token = getToken(); // Get token inside the function
  if (!token) throw new Error('You must be logged in to clock out.');

  try {
    const res = await axios.post(`${API_BASE_URL}/api/dashboard/clock-out`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message)
    }
    throw new Error('Failed to clock out')
  }
}

export async function fetchUserData() {
  const token = getToken(); // Get token inside the function
  if (!token) return null;

  try {
    const res = await axios.get(`${API_BASE_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    
    // Extract user data from the nested response
    console.log('📡 Raw API response:', res.data);
    const userData = res.data.user || res.data; // Support both nested and flat response formats
    console.log('👤 Extracted user data:', userData);
    
    return userData
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message)
    }
    throw new Error('Failed to fetch user data')
  }
}

export async function fetchDashboardData() {
  const token = getToken(); // Get token inside the function
  if (!token) return null;

  try {
    const res = await axios.get(`${API_BASE_URL}/api/dashboard/data`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message)
    }
    throw new Error('Failed to fetch dashboard data')
  }
}
