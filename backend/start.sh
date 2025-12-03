#!/bin/bash
set -e

echo "=== Starting RealorAI Backend ==="
echo "PORT: ${PORT:-8000}"

# Source Nix profile if it exists
if [ -f "/nix/var/nix/profiles/default/etc/profile.d/nix.sh" ]; then
    source /nix/var/nix/profiles/default/etc/profile.d/nix.sh
fi

# Add Nix store to PATH
export PATH="/nix/store"*"/bin:$PATH"

# Find Python
PYTHON=""
if command -v python3.11 &> /dev/null; then
    PYTHON=$(command -v python3.11)
elif [ -d "/nix/store" ]; then
    PYTHON=$(find /nix/store -name python3.11 -type f -executable 2>/dev/null | head -1)
fi

if [ -z "$PYTHON" ]; then
    if command -v python3 &> /dev/null; then
        PYTHON=$(command -v python3)
    elif command -v python &> /dev/null; then
        PYTHON=$(command -v python)
    fi
fi

if [ -z "$PYTHON" ] || [ ! -f "$PYTHON" ]; then
    echo "ERROR: Python not found!"
    echo "PATH: $PATH"
    echo "Searching for Python..."
    find /nix/store -name python3.11 -type f 2>/dev/null | head -3
    which python3.11 || echo "python3.11 not in PATH"
    which python3 || echo "python3 not in PATH"
    exit 1
fi

echo "Found Python: $PYTHON"
$PYTHON --version

# Start uvicorn
echo "Starting uvicorn..."
exec "$PYTHON" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
