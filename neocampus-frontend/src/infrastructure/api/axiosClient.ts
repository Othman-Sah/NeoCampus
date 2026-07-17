import axios from 'axios'
import { useAuthStore } from '@/application/stores/authStore'
import { useBranchStore } from '@/application/stores/branchStore'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach Sanctum Bearer Token & Branch Context
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const activeBranchId = useBranchStore.getState().activeBranchId
    if (activeBranchId && config.headers) {
      config.headers['X-Branch-ID'] = activeBranchId
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle Global Errors (401, 422, etc.)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null

    if (status === 401) {
      // Token expired or user unauthenticated: logout and redirect to login page
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }

    // Format validation errors to be easily accessible
    if (status === 422 && error.response.data.errors) {
      error.validationErrors = error.response.data.errors
    }

    return Promise.reject(error)
  }
)
