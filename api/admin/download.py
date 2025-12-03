import json
import os

def handler(request):
    """
    Vercel serverless function to download feedback data as CSV.
    """
    # Get query parameters
    query_params = request.get("queryStringParameters") or {}
    key = query_params.get("key", "")
    
    if key != "admin123":
        return {
            "statusCode": 401,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": "Unauthorized. Use ?key=admin123"})
        }
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    try:
        feedbacks = []
        
        # Try Supabase first
        if supabase_url and supabase_key:
            from supabase import create_client
            supabase = create_client(supabase_url, supabase_key)
            response = supabase.table("feedback").select("*").execute()
            feedbacks = response.data if response.data else []
        
        if not feedbacks:
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "No data to download"})
            }
        
        # Convert to CSV manually (avoid pandas dependency)
        keys = list(feedbacks[0].keys()) if feedbacks else []
        
        # Build CSV
        csv_lines = [",".join(keys)]  # Header
        for item in feedbacks:
            values = [str(item.get(k, "")).replace(",", ";") for k in keys]
            csv_lines.append(",".join(values))
        
        csv_string = "\n".join(csv_lines)
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=feedback_data.csv",
                "Access-Control-Allow-Origin": "*",
            },
            "body": csv_string
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(e)})
        }

