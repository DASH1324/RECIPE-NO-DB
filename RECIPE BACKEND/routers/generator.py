import re
import os
import json
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional  # <-- Import Optional
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Create a new router instance
router = APIRouter()

# Default image URL if no image can be found
DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"

# --- Pydantic Models for Request and Response ---
class GenerateRecipeRequest(BaseModel):
    """Defines the structure of the incoming request from the frontend."""
    meal_type: str = Field(..., example="breakfast", description="The type of meal.")
    allergies: List[str] = Field(default=[], description="A list of allergies to avoid.")
    # --- NEW FIELD ---
    previous_recipe_name: Optional[str] = Field(
        None, 
        description="The name of the last recipe generated to avoid duplicates."
    )

# --- API Endpoint ---
@router.post("/generate")
async def generate_recipe(request: GenerateRecipeRequest):
    """
    Generates a single, creative recipe based on meal type and allergies.
    It uses the Gemini API with a high temperature for variety and then searches for a suitable image.
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    pixabay_api_key = os.getenv("PIXABAY_API_KEY")
    pexels_api_key = os.getenv("PEXELS_API_KEY")
    unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY")

    if not all([gemini_api_key, pixabay_api_key, pexels_api_key, unsplash_access_key]):
        raise HTTPException(status_code=500, detail="One or more API keys are not set in the .env file.")

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"

    allergy_list = ", ".join(request.allergies) if request.allergies else "None"
    
    # --- NEW: Conditionally add instruction to avoid the previous recipe ---
    avoid_recipe_instruction = ""
    if request.previous_recipe_name:
        avoid_recipe_instruction = (
            f"\nCrucially, do NOT generate the recipe named '{request.previous_recipe_name}' again. "
            "Please provide a different one."
        )

    prompt = (
        f"Generate a creative and unique single recipe suitable for '{request.meal_type}'. "
        f"If breakfast give like eg. simple like fried, if dinner give eg. dinner food eg food with sauce or soup\n"
        f"The recipe MUST NOT contain any of the following allergens: {allergy_list}."
        f"{avoid_recipe_instruction}\n\n"  # <-- Injected the new instruction here
        "Provide the response strictly in the following JSON format. Do not include any text or markdown formatting before or after the JSON block:\n"
        "{\n"
        '  "name": "The creative and appealing name of the recipe",\n'
        '  "ingredients": ["Quantity Unit Ingredient Name", "e.g., 2 large Eggs", "e.g., 1 cup Flour"],\n'
        '  "instructions": ["Step-by-step instruction 1.", "Step-by-step instruction 2.", "And so on..."],\n'
        '  "cookingTime": "A string representing the total cooking time, e.g., 25 minutes",\n'
        '  "imageKeyword": "A single, descriptive keyword phrase for an image search, e.g., spicy shakshuka with feta"\n'
        "}\n"
    )

    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.9,
            "topP": 1,
            "topK": 1,
            "maxOutputTokens": 2048,
        }
    }
    
    headers = {"Content-Type": "application/json"}

    try:
        # --- 1. Generate Recipe with Gemini ---
        gemini_response = requests.post(gemini_url, headers=headers, json=data, timeout=45)
        gemini_response.raise_for_status()
        gemini_result = gemini_response.json()

        response_text = gemini_result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if not json_match:
            raise HTTPException(status_code=500, detail="Failed to parse valid JSON from Gemini response.")

        recipe_data = json.loads(json_match.group())
        image_keyword = recipe_data.get("imageKeyword", recipe_data.get("name", "food"))

        # --- The rest of the function remains the same ---
        # (Image searching and final response construction)
        
        # --- 2. Find an Image for the Recipe ---
        image_url = DEFAULT_IMAGE_URL
        # (Pixabay Search...)
        pixabay_url = "https://pixabay.com/api/"
        pixabay_params = {"key": pixabay_api_key, "q": image_keyword, "image_type": "photo", "safesearch": "true", "per_page": 1}
        pixabay_res = requests.get(pixabay_url, params=pixabay_params)
        if pixabay_res.status_code == 200:
            hits = pixabay_res.json().get("hits", [])
            if hits:
                image_url = hits[0].get("webformatURL", DEFAULT_IMAGE_URL)

        # (Pexels Search...)
        if image_url == DEFAULT_IMAGE_URL:
            pexels_url = "https://api.pexels.com/v1/search"
            pexels_headers = {"Authorization": pexels_api_key}
            pexels_params = {"query": image_keyword, "per_page": 1}
            pexels_res = requests.get(pexels_url, headers=pexels_headers, params=pexels_params)
            if pexels_res.status_code == 200:
                photos = pexels_res.json().get("photos", [])
                if photos:
                    image_url = photos[0].get("src", {}).get("large", DEFAULT_IMAGE_URL)
        
        # (Unsplash Search...)
        if image_url == DEFAULT_IMAGE_URL:
            unsplash_url = "https://api.unsplash.com/search/photos"
            unsplash_headers = {"Authorization": f"Client-ID {unsplash_access_key}"}
            unsplash_params = {"query": image_keyword, "per_page": 1}
            unsplash_res = requests.get(unsplash_url, headers=unsplash_headers, params=unsplash_params)
            if unsplash_res.status_code == 200:
                results_unsplash = unsplash_res.json().get("results", [])
                if results_unsplash:
                    image_url = results_unsplash[0].get("urls", {}).get("regular", DEFAULT_IMAGE_URL)

        # --- 3. Construct the Final Response ---
        final_response = {
            "name": recipe_data.get("name"),
            "ingredients": recipe_data.get("ingredients"),
            "instructions": recipe_data.get("instructions"),
            "cookingTime": recipe_data.get("cookingTime"),
            "image": image_url
        }
        
        return final_response

    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"An error occurred with an external API: {e}")
    except (json.JSONDecodeError, KeyError, IndexError):
        raise HTTPException(status_code=500, detail="Could not parse the response from the recipe generation service.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")