# Backend API Testing Guide

## Prerequisites

Make sure you have the required Python packages installed:

```bash
pip install fastapi uvicorn numpy opencv-python requests
```

## Starting the Backend Server

From the `backend` directory, run:

```bash
uvicorn main:app --reload --port 8001
```

Or if you're in the project root:

```bash
cd backend
uvicorn main:app --reload --port 8001
```

The server will start on `http://localhost:8001`

## Testing Methods

### Method 1: Using the Test Script

```bash
cd backend
python test_api.py /path/to/your/image.jpg
```

### Method 2: Using curl

```bash
curl -X POST "http://localhost:8001/analyze" \
  -F "file=@/path/to/your/image.jpg"
```

### Method 3: Using the Frontend

1. Start the backend: `uvicorn main:app --reload --port 8001`
2. Start the frontend: `cd frontend && npm run dev`
3. Upload an image through the web interface

**Note:** The frontend currently expects the old response format. You'll need to update `App.jsx` to use the new fields:
- `trust_score` (instead of `is_fake_probability`)
- `classification`
- `group`

### Method 4: Using Python requests

```python
import requests

with open('test_image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8001/analyze',
        files={'file': f}
    )
    print(response.json())
```

## Expected Response Format

```json
{
  "filename": "image.jpg",
  "trust_score": 12,
  "classification": "ai_generated",
  "group": "ai",
  "gradient_image": "base64..."
}
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

