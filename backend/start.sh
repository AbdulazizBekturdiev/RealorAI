#!/bin/bash
set -euo pipefail

echo "=== Starting RealorAI Backend ==="
echo "PORT: ${PORT:-8000}"

# Attempt to source Nix environment
if [ -e /etc/profile.d/nix.sh ]; then
  . /etc/profile.d/nix.sh
fi

# Candidates to check for a python executable
declare -a candidates
candidates+=("$(command -v python3.11 2>/dev/null || true)")
candidates+=("$(command -v python3 2>/dev/null || true)")
candidates+=("$(command -v python 2>/dev/null || true)")
candidates+=("$(find /nix/store -name python3.11 -type f -executable 2>/dev/null | head -n 1 || true)")

PYTHON=""
for candidate in "${candidates[@]}"; do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    PYTHON="$candidate"
    break
  fi
done

if [ -z "$PYTHON" ]; then
  echo "ERROR: Python not found"
  echo "PATH: $PATH"
  echo "Listing /nix/store (partial):"
  ls -d /nix/store/*python* 2>/dev/null | head -n 5 || echo "No python in /nix/store"
  exit 1
fi

echo "Using Python: $PYTHON"
"$PYTHON" --version

exec "$PYTHON" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
