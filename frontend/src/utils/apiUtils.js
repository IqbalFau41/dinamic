/**
 * Utility functions for API URL management
 */

/**
 * Constructs a full API URL based on environment variables and current location
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @returns {string} The complete API URL
 */

export const getApiUrl = (endpoint) => {
  const protocol = window.location.protocol
  const host = window.location.hostname // Use the current hostname dynamically
  const port = import.meta.env.VITE_BACKEND_PORT
  const apiPrefix = import.meta.env.VITE_API_PREFIX
  // Ensure endpoint doesn't start with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
  return `${protocol}//${host}:${port}${apiPrefix}/${cleanEndpoint}`
}

/**
 * Gets the base API URL without endpoints
 * @returns {string} The base API URL
 */
export const getApiBaseUrl = () => {
  const protocol = window.location.protocol
  // Use the same hostname that the user used to access the frontend
  const host = window.location.hostname
  const port = import.meta.env.VITE_BACKEND_PORT
  return `${protocol}//${host}:${port}`
}

/**
 * Gets the WebSocket URL for realtime connections
 * @param {string} endpoint - The WebSocket endpoint
 * @returns {string} The WebSocket URL
 */
export const getWebSocketUrl = (endpoint) => {
  // Convert http/https to ws/wss
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // Use the same hostname that the user used to access the frontend
  const host = window.location.hostname
  const port = import.meta.env.VITE_BACKEND_PORT
  // Clean the endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${protocol}//${host}:${port}${cleanEndpoint}`
}
