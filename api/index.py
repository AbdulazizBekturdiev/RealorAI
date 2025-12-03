# Vercel Serverless Function Entry Point
# This file allows Vercel to automatically serve the FastAPI app
# Vercel will route /api/* requests to this file

from backend.main import app
from mangum import Mangum

# Wrap FastAPI app with Mangum to make it compatible with Vercel's serverless functions
handler = Mangum(app, lifespan="off")

