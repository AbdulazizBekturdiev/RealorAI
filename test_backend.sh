#!/bin/bash
# Quick test script for backend

echo "🚀 Testing RealorAI Backend"
echo "============================"
echo ""

# Check if server is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:8001/ > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
    curl -s http://localhost:8001/ | python3 -m json.tool
else
    echo "   ❌ Backend is not running!"
    echo "   Start it with: cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8001"
    exit 1
fi

echo ""
echo "2. Testing /analyze endpoint..."
echo "   (You need to provide an image file path)"
echo ""
if [ -z "$1" ]; then
    echo "   Usage: ./test_backend.sh <path_to_image.jpg>"
    echo "   Example: ./test_backend.sh ~/Desktop/test.jpg"
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "   ❌ Image file not found: $1"
    exit 1
fi

echo "   Uploading: $1"
response=$(curl -s -X POST "http://localhost:8001/analyze" \
    -H "Content-Type: multipart/form-data" \
    -F "file=@$1")

echo "$response" | python3 -m json.tool

# Check if response contains trust_score
if echo "$response" | grep -q "trust_score"; then
    echo ""
    echo "   ✅ Analysis successful!"
    score=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['trust_score'])")
    classification=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['classification'])")
    echo "   Trust Score: ${score}%"
    echo "   Classification: ${classification}"
else
    echo ""
    echo "   ❌ Analysis failed!"
fi
