from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Tuple
import os
import json
import io
import csv
import logging

# Logic Imports
from backend.forensics import analyze_image
from dotenv import load_dotenv

load_dotenv()

# Configure FastAPI for Railway deployment
# Using ORJSONResponse for faster JSON serialization (2-3x faster than standard json)
app = FastAPI(
    title="RealorAI Backend",
    description="AI Image Detector API",
    version="1.0.0",
    default_response_class=ORJSONResponse
)

# 1. CORS Setup (Critical for frontend connection)
# Allow all origins for Railway deployment (frontend and backend are separate services)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (frontend can be on different domain)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Supabase Setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except ImportError:
        logging.warning("Supabase library not installed")
    except Exception as e:
        logging.warning(f"Failed to initialize Supabase: {e}")

# 3. Data Models
class FeedbackSchema(BaseModel):
    filename: str
    ai_score: int
    user_verdict: str
    actual_category: Optional[str] = None
    comments: Optional[str] = None
    contribute_data: bool
    timestamp: str


def classify_trust_score(score: int) -> str:
    """
    Classify trust score into categories.
    Returns the classification string.
    """
    if 0 <= score <= 20:
        return "ai_generated"
    elif 21 <= score <= 40:
        return "likely_artificial"
    elif 41 <= score <= 49:
        return "mixed_signals"
    elif 50 <= score <= 65:
        return "low_quality_compressed"
    elif 66 <= score <= 85:
        return "digital_processed"
    elif 86 <= score <= 100:
        return "authentic_capture"
    else:
        # Fallback for edge cases
        if score < 0:
            return "ai_generated"
        else:
            return "authentic_capture"


# 4. The Critical Analysis Endpoint (RESTORED)
# NOTE: Using async def but running CPU-heavy analyze_image() in thread pool
# This prevents blocking the event loop while still allowing async file I/O
@app.post("/analyze")
async def upload_analyze(file: UploadFile = File(...)):
    try:
        # Read file into memory (async I/O - fast, non-blocking)
        contents = await file.read()
        
        # Run CPU-heavy analysis in thread pool to avoid blocking event loop
        import asyncio
        import concurrent.futures
        
        # Use asyncio.to_thread (Python 3.9+) or run_in_executor for older versions
        try:
            result = await asyncio.to_thread(analyze_image, contents)
        except AttributeError:
            # Fallback for Python < 3.9
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(executor, analyze_image, contents)
        
        # Get trust_score from analysis
        trust_score = result.get("trust_score", 0)
        
        # Classify the score
        classification = classify_trust_score(trust_score)
        
        # Return JSON to frontend (ORJSONResponse handles serialization)
        return {
            "filename": file.filename or "image.jpg",
            "trust_score": trust_score,
            "classification": classification,
            "gradient_image": result.get("gradient_image", ""),
            "meta": result.get("meta", {})
        }
    except Exception as e:
        logging.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 5. Feedback Endpoint
@app.post("/feedback")
async def submit_feedback(feedback: FeedbackSchema):
    if not supabase:
        # Fallback to local JSON file
        feedback_data = {
            "filename": feedback.filename,
            "ai_score": feedback.ai_score,
            "user_verdict": feedback.user_verdict,
            "actual_category": feedback.actual_category,
            "comments": feedback.comments,
            "contribute_data": feedback.contribute_data,
            "timestamp": feedback.timestamp,
        }
        
        feedback_file = "feedback_local.json"
        if os.path.exists(feedback_file):
            with open(feedback_file, "r") as f:
                feedbacks = json.load(f)
        else:
            feedbacks = []
        
        feedbacks.append(feedback_data)
        
        with open(feedback_file, "w") as f:
            json.dump(feedbacks, f, indent=2)
        
        return {"status": "success", "mode": "local"}
    
    try:
        # Insert into Supabase (without timestamp - Supabase auto-generates it)
        data = {
            "filename": feedback.filename,
            "ai_score": feedback.ai_score,
            "user_verdict": feedback.user_verdict,
            "actual_category": feedback.actual_category,
            "comments": feedback.comments,
            "contribute_data": feedback.contribute_data,
        }
        supabase.table("feedback").insert(data).execute()
        return {"status": "success", "mode": "database"}
    except Exception as e:
        logging.error(f"Feedback submission failed: {str(e)}")
        return {"status": "error", "detail": str(e)}


# 6. Admin View Endpoint
@app.get("/admin/view")
async def view_admin_data(key: str = ""):
    # Basic protection
    admin_pass = os.environ.get("ADMIN_PASSWORD", "admin123")
    if key != admin_pass:
        return {"error": "Unauthorized"}
    
    if supabase:
        try:
            response = supabase.table("feedback").select("*").order("created_at", desc=True).execute()
            return {"count": len(response.data) if response.data else 0, "data": response.data or []}
        except Exception as e:
            logging.error(f"Supabase error: {e}, falling back to local file")
    
    # Fallback to local JSON file
    feedback_file = "feedback_local.json"
    if not os.path.exists(feedback_file):
        return {"count": 0, "data": [], "message": "No data yet"}
    
    try:
        with open(feedback_file, "r") as f:
            feedbacks = json.load(f)
        
        if isinstance(feedbacks, list):
            return {"count": len(feedbacks), "data": feedbacks}
        else:
            return {"count": 1, "data": [feedbacks]}
    except json.JSONDecodeError:
        return {"error": "Could not parse database file"}
    except Exception as e:
        return {"error": str(e)}


# 7. Admin Download Endpoint
@app.get("/admin/download")
async def download_admin_data(key: str = ""):
    # Basic protection
    admin_pass = os.environ.get("ADMIN_PASSWORD", "admin123")
    if key != admin_pass:
        return {"error": "Unauthorized. Use ?key=admin123"}
    
    feedbacks = []
    
    if supabase:
        try:
            response = supabase.table("feedback").select("*").execute()
            feedbacks = response.data if response.data else []
        except Exception as e:
            logging.error(f"Supabase error: {e}, falling back to local file")
    
    # Fallback to local JSON file
    if not feedbacks:
        feedback_file = "feedback_local.json"
        if not os.path.exists(feedback_file):
            return {"error": "No data to download"}
        
        try:
            with open(feedback_file, "r") as f:
                feedbacks = json.load(f)
            
            if not isinstance(feedbacks, list):
                feedbacks = [feedbacks]
        except Exception as e:
            return {"error": f"Failed to read local file: {str(e)}"}
    
    if not feedbacks:
        return {"error": "No data to download"}
    
    try:
        # Convert to CSV using built-in csv library (no pandas needed)
        output = io.StringIO()
        if len(feedbacks) > 0:
            # Get headers from first row
            headers = list(feedbacks[0].keys())
            writer = csv.DictWriter(output, fieldnames=headers)
            writer.writeheader()
            writer.writerows(feedbacks)
        
        output.seek(0)
        
        # Return as file download
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=feedback_data.csv"}
        )
    except Exception as e:
        logging.error(f"CSV generation failed: {str(e)}")
        return {"error": f"Failed to generate CSV: {str(e)}"}


# Health check endpoints
@app.get("/")
def home():
    return {"status": "Backend is running", "port": os.environ.get("PORT", "not set")}

@app.get("/health")
def health():
    """Health check endpoint for Railway"""
    return {"status": "healthy", "service": "RealorAI Backend"}
