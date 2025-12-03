#!/bin/bash
set -euo pipefail

echo "=== Starting RealorAI Backend ==="
echo "PORT: ${PORT:-8000}"

# Try to find Python in /nix/store explicitly
# Railway Nixpacks installs Python in a path like:
# /nix/store/<hash>-python3-3.11.x/bin/python3.11
CANDIDATES=$(find /nix/store -name python3.11 -type f 2>/dev/null)

PYTHON=""
for c in $CANDIDATES; do
  if [[ "$c" == */bin/python3.11 ]]; then
    PYTHON="$c"
    break
  fi
done

# If still empty, try PATH based lookups
if [ -z "$PYTHON" ]; then
  if command -v python3.11 &> /dev/null; then
    PYTHON=$(command -v python3.11)
  elif command -v python3 &> /dev/null; then
    PYTHON=$(command -v python3)
  elif command -v python &> /dev/null; then
    PYTHON=$(command -v python)
  fi
fi

if [ -z "$PYTHON" ]; then
  echo "ERROR: Python not found in /nix/store or PATH."
  echo "PATH is: $PATH"
  echo "Listing /nix/store (limited):"
  ls -d /nix/store/*python* 2>/dev/null | head -n 10 || echo "/nix/store is empty or unreadable"
  exit 1
fi

echo "Using Python: $PYTHON"
"$PYTHON" --version

exec "$PYTHON" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
