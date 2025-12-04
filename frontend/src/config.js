// API Configuration
// Set VITE_API_URL environment variable to your backend URL
// Example: https://your-backend.railway.app or https://your-backend.onrender.com
// For Railway: Set VITE_API_URL=https://your-backend.railway.app in Railway environment variables
// For local development: Defaults to http://localhost:8001

function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Remove trailing slash if present to avoid double slashes
    return envUrl.replace(/\/$/, '');
  }
  // Default to localhost for development
  return 'http://localhost:8001';
}

export const API_URL = getApiUrl();

console.log('API_URL:', API_URL); // Debug log

