import axios from 'axios'

// In Vite/browser builds `import.meta.env` is available. In Node/Jest it is
// undefined, so we fall back to process.env values (TEST_BASE_URL or
// VITE_API_URL) before using a hard-coded default.
let BASE_URL;
// Accessing import.meta may throw in some environments; use try/catch and
// optional chaining to safely fall back to process.env values when needed.
try {
  const env = import.meta?.env;
  BASE_URL = env?.VITE_API_URL || process.env.TEST_BASE_URL || process.env.VITE_API_URL || 'http://localhost:5001';
} catch (err) {
  BASE_URL = process.env.TEST_BASE_URL || process.env.VITE_API_URL || 'http://localhost:5001';
}

export const api = axios.create({
  baseURL: `${BASE_URL}/api`
})

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
