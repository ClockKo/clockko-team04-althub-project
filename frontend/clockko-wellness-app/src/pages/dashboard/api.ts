import axios from 'axios'

export async function fetchCurrentSession() {
  try {
    const res = await axios.get('/api/dashboard/current-session', { withCredentials: true })
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
    const res = await axios.post('/api/dashboard/clock-in', {}, { withCredentials: true })
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
    const res = await axios.post('/api/dashboard/clock-out', {}, { withCredentials: true })
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
    const res = await axios.get('/api/user/profile', { withCredentials: true })
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
    const res = await axios.get('/api/dashboard/data', { withCredentials: true })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message)
    }
    throw new Error('Failed to fetch dashboard data')
  }
}
