from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Dict, Tuple, Optional
from datetime import datetime
import json
import os
import io
import pandas as pd
from forensics import analyze_image

app = FastAPI()


class FeedbackSchema(BaseModel):
    filename: str
    ai_score: int
    user_verdict: str  # "correct" or "incorrect"
    actual_category: Optional[str] = None
    comments: Optional[str] = None
    contribute_data: bool
    timestamp: str


def classify_trust_score(score: int) -> Tuple[str, str, str]:
    """
    Classify trust score into categories.
    
    Returns:
        Tuple of (classification, group, status)
    """
    if 0 <= score <= 20:
        return ("ai_generated", "ai", "AI Generated")
    elif 21 <= score <= 40:
        return ("likely_artificial", "ai", "Likely AI")
    elif 41 <= score <= 49:
        return ("mixed_signals", "ai", "Ambiguous Signal")
    elif 50 <= score <= 65:
        return ("low_quality_compressed", "real", "Low Quality Source")
    elif 66 <= score <= 85:
        return ("digital_processed", "real", "Retouched Photo")
    elif 86 <= score <= 100:
        return ("authentic_capture", "real", "Real Photo")
    else:
        # Fallback for edge cases
        if score < 0:
            return ("ai_generated", "ai", "AI Generated")
        else:
            return ("authentic_capture", "real", "Real Photo")

# CORS settings (adjust origins as necessary for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = analyze_image(image_bytes)
        if 'error' in result:
            return JSONResponse(status_code=400, content=result)
        
        # Get trust_score from analysis
        trust_score = result.get('trust_score', 0)
        
        # Classify the score
        classification, group, status = classify_trust_score(trust_score)
        
        # Build response with new structure
        response: Dict = {
            "filename": file.filename or "image.jpg",
            "trust_score": trust_score,
            "classification": classification,
            "group": group,
            "gradient_image": result.get('gradient_image', '')
        }
        
        return response
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/feedback")
async def submit_feedback(feedback: FeedbackSchema):
    """
    Submit user feedback about analysis results.
    Tries Supabase first, falls back to local JSON file.
    """
    try:
        # Try Supabase first (if credentials exist)
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if supabase_url and supabase_key:
            try:
                # Import supabase client (install: pip install supabase)
                from supabase import create_client, Client
                supabase: Client = create_client(supabase_url, supabase_key)
                
                # Insert into Supabase
                supabase.table("feedback").insert({
                    "filename": feedback.filename,
                    "ai_score": feedback.ai_score,
                    "user_verdict": feedback.user_verdict,
                    "actual_category": feedback.actual_category,
                    "comments": feedback.comments,
                    "contribute_data": feedback.contribute_data,
                    "timestamp": feedback.timestamp,
                }).execute()
                
                return {"status": "success", "mode": "database"}
            except ImportError:
                # Supabase library not installed, fall through to local
                pass
            except Exception as e:
                # Supabase error, fall through to local
                print(f"Supabase error: {e}, falling back to local storage")
        
        # Fallback: Save to local JSON file
        feedback_data = {
            "filename": feedback.filename,
            "ai_score": feedback.ai_score,
            "user_verdict": feedback.user_verdict,
            "actual_category": feedback.actual_category,
            "comments": feedback.comments,
            "contribute_data": feedback.contribute_data,
            "timestamp": feedback.timestamp,
        }
        
        # Read existing feedback or create new list
        feedback_file = "feedback_local.json"
        if os.path.exists(feedback_file):
            with open(feedback_file, "r") as f:
                feedbacks = json.load(f)
        else:
            feedbacks = []
        
        # Append new feedback
        feedbacks.append(feedback_data)
        
        # Write back to file
        with open(feedback_file, "w") as f:
            json.dump(feedbacks, f, indent=2)
        
        return {"status": "success", "mode": "local"}
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/admin/view")
async def view_feedback():
    """
    View all collected feedback data.
    Returns JSON list of all feedback entries.
    """
    feedback_file = "feedback_dataset.json"
    
    if not os.path.exists(feedback_file):
        return {"count": 0, "data": [], "message": "No data yet"}
    
    try:
        with open(feedback_file, "r") as f:
            feedbacks = json.load(f)
        
        # Return as list (if it's already a list) or wrap in list
        if isinstance(feedbacks, list):
            return {"count": len(feedbacks), "data": feedbacks}
        else:
            return {"count": 1, "data": [feedbacks]}
    except json.JSONDecodeError:
        return {"error": "Could not parse database file"}
    except Exception as e:
        return {"error": str(e)}


@app.get("/admin/download")
async def download_feedback(key: str = ""):
    """
    Download feedback data as CSV file.
    Requires ?key=admin123 query parameter for security.
    """
    if key != "admin123":
        return {"error": "Unauthorized. Use ?key=admin123"}
    
    feedback_file = "feedback_dataset.json"
    
    if not os.path.exists(feedback_file):
        return {"error": "No data to download"}
    
    try:
        # Read JSON file
        with open(feedback_file, "r") as f:
            feedbacks = json.load(f)
        
        # Ensure it's a list
        if not isinstance(feedbacks, list):
            feedbacks = [feedbacks]
        
        # Convert to DataFrame
        df = pd.DataFrame(feedbacks)
        
        # Convert to CSV string
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        
        # Return as file download
        response = StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=feedback_data.csv"
        
        return response
        
    except Exception as e:
        return {"error": f"Failed to generate CSV: {str(e)}"}

