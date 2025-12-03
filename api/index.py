# Vercel Serverless Function Entry Point
# This file allows Vercel to automatically serve the FastAPI app
# Vercel will route /api/* requests to this file

from backend.main import app

# Vercel expects the app instance to be available
# The FastAPI app will be automatically detected and served

