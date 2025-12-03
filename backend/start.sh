#!/bin/bash
# Railway start script
set -e

echo "Starting RealorAI Backend..."
echo "PORT: ${PORT:-8000}"

# Ensure we're in the right directory
cd "$(dirname "$0")" || exit 1

# Find Python (try python3.11, python3, then python)
if command -v python3.11 &> /dev/null; then
    PYTHON_CMD=python3.11
elif command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "ERROR: Python not found!"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"
$PYTHON_CMD --version

# Start the application
exec $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
