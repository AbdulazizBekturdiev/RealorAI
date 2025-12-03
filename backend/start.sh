#!/bin/bash
# Railway start script
set -e

echo "Starting RealorAI Backend..."
echo "PORT: ${PORT:-8000}"

# Ensure we're in the right directory
cd "$(dirname "$0")" || exit 1

# Start the application
exec python -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
