import axios from 'axios'

// Helper to get token
function getToken() {
  return localStorage.getItem('authToken') || '';
}

const token = getToken();

if (!token) {
  throw new Error('No auth token found'); // Handle missing token appropriately
}

export async function fetchCurrentSession() {
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
