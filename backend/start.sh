#!/bin/bash
set -euo pipefail

echo "=== Starting RealorAI Backend ==="
echo "PORT: ${PORT:-8000}"

declare -a candidates
candidates+=("$(command -v python3.11 2>/dev/null || true)")
candidates+=("$(command -v python3 2>/dev/null || true)")
candidates+=("$(command -v python 2>/dev/null || true)")
candidates+=("$(find /nix/store -path '*/bin/python3.11' -print -quit 2>/dev/null || true)")

PYTHON=""
for candidate in "${candidates[@]}"; do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    PYTHON="$candidate"
    break
  fi
done

if [ -z "$PYTHON" ]; then
  echo "ERROR: Python not found"
  exit 1
fi

echo "Using Python: $PYTHON"
"$PYTHON" --version

exec "$PYTHON" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
