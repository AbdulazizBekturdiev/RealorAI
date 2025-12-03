#!/bin/bash
set -euo pipefail

echo "=== Starting RealorAI Backend ==="
echo "PORT: ${PORT:-8000}"

# Source Nix environment if available
if [ -f "/nix/var/nix/profiles/default/etc/profile.d/nix.sh" ]; then
    source /nix/var/nix/profiles/default/etc/profile.d/nix.sh
fi

# Add all possible Nix store Python paths to PATH
export PATH="/nix/store"*"/bin:$PATH"
for dir in /nix/store/*/bin; do
    if [ -d "$dir" ]; then
        export PATH="$dir:$PATH"
    fi
done 2>/dev/null || true

# Find Python - search more thoroughly
PYTHON=""
# Try command first
if command -v python3.11 >/dev/null 2>&1; then
    PYTHON=$(command -v python3.11)
elif command -v python3 >/dev/null 2>&1; then
    PYTHON=$(command -v python3)
elif command -v python >/dev/null 2>&1; then
    PYTHON=$(command -v python)
fi

# If not found, search /nix/store
if [ -z "$PYTHON" ]; then
    PYTHON=$(find /nix/store -name python3.11 -type f -executable 2>/dev/null | head -1)
    if [ -z "$PYTHON" ]; then
        PYTHON=$(find /nix/store -name python3 -type f -executable 2>/dev/null | head -1)
    fi
fi

if [ -z "$PYTHON" ] || [ ! -x "$PYTHON" ]; then
    echo "ERROR: Python not found!"
    echo "PATH: $PATH"
    echo "Searching /nix/store..."
    find /nix/store -name python3* -type f 2>/dev/null | head -10 || echo "No Python in /nix/store"
    echo "This means Python was not installed during the build phase."
    echo "Please check the Build Logs to see if Python installation failed."
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
