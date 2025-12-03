// API Configuration
// In production, set VITE_API_URL in Vercel environment variables to your backend URL
// Example: https://your-backend.railway.app or https://your-backend.onrender.com
// If not set, defaults to /api (which won't work unless backend is deployed on Vercel)
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:8001');

console.log('API_URL:', API_URL); // Debug log

