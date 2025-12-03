#!/bin/bash
set -euo pipefail

echo "=== Starting RealorAI Backend ==="
echo "PORT: ${PORT:-8000}"
echo "Working directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Find Python
PYTHON=""
if command -v python3.11 >/dev/null 2>&1; then
    PYTHON=$(command -v python3.11)
elif command -v python3 >/dev/null 2>&1; then
    PYTHON=$(command -v python3)
elif command -v python >/dev/null 2>&1; then
    PYTHON=$(command -v python)
else
    # Search in /nix/store
    PYTHON=$(find /nix/store -name python3.11 -type f -executable 2>/dev/null | head -1)
    if [ -z "$PYTHON" ]; then
        PYTHON=$(find /nix/store -name python3 -type f -executable 2>/dev/null | head -1)
    fi
fi

if [ -z "$PYTHON" ] || [ ! -x "$PYTHON" ]; then
    echo "ERROR: Python not found!"
    echo "PATH: $PATH"
    exit 1
fi

echo "Found Python: $PYTHON"
"$PYTHON" --version

# Check if main.py exists
if [ ! -f "main.py" ]; then
    echo "ERROR: main.py not found in $(pwd)"
    exit 1
fi

echo "Starting uvicorn on port ${PORT:-8000}..."
exec "$PYTHON" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
