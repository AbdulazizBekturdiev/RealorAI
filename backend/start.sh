#!/bin/bash
set -e

echo "Starting RealorAI Backend..."
echo "PORT: ${PORT:-8000}"

# Find Python - try multiple methods
PYTHON=""

# Method 1: Try to find python3.11 in common locations
if [ -f "/nix/store"*"/bin/python3.11" ]; then
    PYTHON=$(find /nix/store -name python3.11 -type f 2>/dev/null | head -1)
elif command -v python3.11 &> /dev/null; then
    PYTHON=python3.11
elif command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
fi

if [ -z "$PYTHON" ]; then
    echo "ERROR: Python not found!"
    echo "Searching for Python..."
    find /usr -name python3* 2>/dev/null | head -5
    find /nix -name python3.11 2>/dev/null | head -5
    which python3.11 || echo "python3.11 not in PATH"
    which python3 || echo "python3 not in PATH"
    which python || echo "python not in PATH"
    echo "PATH: $PATH"
    exit 1
fi

echo "Using Python: $PYTHON"
$PYTHON --version

# Start uvicorn
exec $PYTHON -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
