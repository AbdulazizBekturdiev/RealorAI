#!/bin/bash
set -e

echo "Starting RealorAI Backend..."
echo "PORT: ${PORT:-8000}"
echo "PATH: $PATH"

# Add Nix store to PATH if it exists
if [ -d "/nix/store" ]; then
    export PATH="/nix/store"*"/bin:$PATH"
    # Find and add Python's bin directory to PATH
    PYTHON_BIN=$(find /nix/store -name python3.11 -type f 2>/dev/null | head -1)
    if [ -n "$PYTHON_BIN" ]; then
        PYTHON_DIR=$(dirname "$PYTHON_BIN")
        export PATH="$PYTHON_DIR:$PATH"
        echo "Added Python directory to PATH: $PYTHON_DIR"
    fi
fi

# Find Python - try multiple methods
PYTHON=""

# Try finding python3.11
if command -v python3.11 &> /dev/null; then
    PYTHON=python3.11
elif [ -n "$PYTHON_BIN" ] && [ -f "$PYTHON_BIN" ]; then
    PYTHON="$PYTHON_BIN"
elif command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    # Last resort: search for it
    PYTHON=$(find /nix/store -name python3.11 -type f 2>/dev/null | head -1)
fi

if [ -z "$PYTHON" ] || [ ! -f "$PYTHON" ]; then
    echo "ERROR: Python not found!"
    echo "Searching for Python..."
    find /nix/store -name python3.11 -type f 2>/dev/null | head -3
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
