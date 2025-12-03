#!/bin/bash
set -e

# Find Python executable
if command -v python3.11 &> /dev/null; then
    PYTHON=python3.11
elif command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "ERROR: Python not found!"
    which python3.11 || echo "python3.11 not found"
    which python3 || echo "python3 not found"
    which python || echo "python not found"
    exit 1
fi

echo "Using Python: $PYTHON"
$PYTHON --version

# Start uvicorn
exec $PYTHON -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
