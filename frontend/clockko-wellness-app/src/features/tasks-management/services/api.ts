import axios from 'axios'

// Create an axios instance with base URL and authorization header
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
