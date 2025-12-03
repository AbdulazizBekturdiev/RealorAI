// API Configuration
// Set VITE_API_URL environment variable in production to your backend URL
// If not set, uses /api for same-domain deployment or localhost for dev
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:8001');

console.log('API_URL:', API_URL); // Debug log

