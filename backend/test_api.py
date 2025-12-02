#!/usr/bin/env python3
"""
Simple test script for the /analyze endpoint.
Usage: python test_api.py <path_to_image>
"""
import sys
import requests

def test_analyze(image_path: str):
    """Test the /analyze endpoint with an image file."""
    url = "http://localhost:8001/analyze"
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (image_path, f, 'image/jpeg')}
            response = requests.post(url, files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response JSON:")
        print(response.json())
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Success!")
            print(f"  Filename: {data.get('filename')}")
            print(f"  Trust Score: {data.get('trust_score')}")
            print(f"  Classification: {data.get('classification')}")
            print(f"  Group: {data.get('group')}")
            print(f"  Has gradient_image: {bool(data.get('gradient_image'))}")
        else:
            print(f"\n❌ Error: {response.json()}")
            
    except FileNotFoundError:
        print(f"❌ Error: Image file not found: {image_path}")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend. Make sure the server is running on http://localhost:8001")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_api.py <path_to_image>")
        sys.exit(1)
    
    test_analyze(sys.argv[1])

