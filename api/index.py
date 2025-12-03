# Vercel Serverless Function Entry Point
# This file allows Vercel to automatically serve the FastAPI app
# Vercel will route /api/* requests to this file

from backend.main import app
from mangum import Mangum

# Wrap FastAPI app with Mangum to make it compatible with Vercel's serverless functions
# When Vercel routes /api/analyze to this file, the path received is /analyze (prefix is stripped)
handler = Mangum(app, lifespan="off")

