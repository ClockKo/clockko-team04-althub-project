import axios from 'axios'

// Helper to get token
function getToken() {
  return localStorage.getItem('authToken') || '';
}


export async function fetchCurrentSession() {
  const token = getToken(); // Get token inside the function
  if (!token) return null; // Return null if no token

  try {
    const res = await axios.get('/api/dashboard/current-session', {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message)
    }
    throw new Error('No ongoing session')
  }
}

export async function clockIn() {
  const token = getToken(); // Get token inside the function
  if (!token) throw new Error('You must be logged in to clock in.');

  try {
    const res = await axios.post('/api/dashboard/clock-in', {}, {
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
    const res = await axios.post('/api/dashboard/clock-out', {}, {
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
    const res = await axios.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    return res.data
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
    const res = await axios.get('/api/dashboard/data', {
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
