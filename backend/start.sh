#!/bin/bash
set -euo pipefail

echo "=== Starting RealorAI Backend ==="
echo "PORT: ${PORT:-8000}"

# First, try to find Python that was installed by Nixpacks
# Nixpacks should have installed Python, so it should be in PATH or /nix/store

# Try direct commands first
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
    echo "Current directory: $(pwd)"
    echo "PATH: $PATH"
    echo "Searching for Python..."
    find /nix/store -name python3* -type f 2>/dev/null | head -5 || echo "No Python found in /nix/store"
    ls -la /usr/bin/python* 2>/dev/null || echo "No Python in /usr/bin"
    which python3.11 || echo "python3.11 not in PATH"
    which python3 || echo "python3 not in PATH"
    which python || echo "python not in PATH"
    exit 1
fi

echo "Found Python: $PYTHON"
"$PYTHON" --version

echo "Starting uvicorn..."
exec "$PYTHON" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
