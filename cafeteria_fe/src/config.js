const appEnv = (import.meta.env.APP_ENV || 'development').toLowerCase()

const defaultApiBaseUrl =
  appEnv === 'production'
    ? 'https://cafeteria-backend-aicu.onrender.com'
    : 'http://localhost:8000'

const rawApiBaseUrl =
  import.meta.env.APP_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  defaultApiBaseUrl

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

export const buildApiUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export const ADMIN_URL = buildApiUrl('/admin/')
