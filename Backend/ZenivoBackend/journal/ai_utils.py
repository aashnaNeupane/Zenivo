import os
import json
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
api_key = os.environ.get("GOOGLE_API_KEY")

# Define the expected structure for the AI's response
class SentimentAnalysis(BaseModel):
    score: float
    label: str
    summary: str

def analyze_sentiment(text):
    """
    Analyzes sentiment using the Google Gen AI SDK and Gemini 1.5 Flash.
    Returns a dictionary with 'score', 'label', and 'summary'.
    """
    if not api_key:
        return {
            "score": 0.0,
            "label": "Unknown",
            "summary": "API Key missing. Analysis skipped."
        }

    # Initialize the client
    client = genai.Client(api_key=api_key)
    
    model_id = "gemini-2.0-flash"

    try:
        # Use response_mime_type and response_schema for guaranteed valid JSON
        response = client.models.generate_content(
            model=model_id,
            contents=f"Analyze the sentiment of this journal entry: {text}",
            config={
                'response_mime_type': 'application/json',
                'response_schema': SentimentAnalysis,
            }
        )
        
        # The SDK automatically parses the JSON into a dictionary or object
        return response.parsed.model_dump()

    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return {
            "score": 0.0,
            "label": "Error",
            "summary": "Failed to analyze sentiment."
        }

# Example usage:
# result = analyze_sentiment("Today was a wonderful day, I felt so productive!")
# print(result)