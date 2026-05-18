import axios from 'axios'

// Base URL — all requests go to FastAPI
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth functions
export const registerUser = (data) =>
  api.post('/auth/register', data)

export const loginUser = (data) =>
  api.post('/auth/login', data)

// Chat function (we'll expand this in Phase 5)
export const sendMessage = (message) =>
  api.post('/chat', { message })

export default api