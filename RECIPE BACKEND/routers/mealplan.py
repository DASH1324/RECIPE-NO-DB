import re
import os
import json
import requests
import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Create a new router instance
router = APIRouter()

# Default image URL if no image can be found
DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"

# --- Pydantic Models ---
class GenerateMealPlanRequest(BaseModel):
    """Defines the structure of the incoming request for generating a full meal plan."""
    allergies: List[str] = Field(default=[], description="A list of allergies to avoid.")
    # You can add more preferences here in the future, e.g.,
    # diet: Optional[str] = Field(None, example="Vegetarian")
    # cuisine_preference: Optional[str] = Field(None, example="Mediterranean")

class ApiKeys(BaseModel):
    """A model to hold all required API keys, injected as a dependency."""
    gemini_api_key: str
    pixabay_api_key: str
    pexels_api_key: str
    unsplash_access_key: str

# --- Dependency to get API Keys ---
def get_api_keys():
    """
    Loads API keys from environment variables and raises an error if any are missing.
    This function is used as a dependency to ensure keys are available before processing a request.
    """
    keys = ApiKeys(
        gemini_api_key=os.getenv("GEMINI_API_KEY"),
        pixabay_api_key=os.getenv("PIXABAY_API_KEY"),
        pexels_api_key=os.getenv("PEXELS_API_KEY"),
        unsplash_access_key=os.getenv("UNSPLASH_ACCESS_KEY"),
    )
    if not all(vars(keys).values()):
        raise HTTPException(status_code=500, detail="One or more API keys (GEMINI, PIXABAY, PEXELS, UNPLASH) are not set in the .env file.")
    return keys

# --- Helper Function for Image Searching ---
def _get_image_for_recipe(keyword: str, keys: ApiKeys) -> str:
    """
    Searches for an image across multiple services (Pixabay, Pexels, Unsplash)
    using a given keyword and returns the first URL found.
    """
    # 1. Try Pixabay
    try:
        pixabay_params = {"key": keys.pixabay_api_key, "q": keyword, "image_type": "photo", "safesearch": "true", "per_page": 3}
        pixabay_res = requests.get("https://pixabay.com/api/", params=pixabay_params, timeout=5)
        if pixabay_res.status_code == 200:
            hits = pixabay_res.json().get("hits", [])
            if hits:
                return hits[0].get("webformatURL", DEFAULT_IMAGE_URL)
    except requests.RequestException:
        pass # Ignore error and try next service

    # 2. Try Pexels
    try:
        pexels_headers = {"Authorization": keys.pexels_api_key}
        pexels_params = {"query": keyword, "per_page": 1}
        pexels_res = requests.get("https://api.pexels.com/v1/search", headers=pexels_headers, params=pexels_params, timeout=5)
        if pexels_res.status_code == 200:
            photos = pexels_res.json().get("photos", [])
            if photos:
                return photos[0].get("src", {}).get("large", DEFAULT_IMAGE_URL)
    except requests.RequestException:
        pass # Ignore error and try next service

    # 3. Try Unsplash
    try:
        unsplash_headers = {"Authorization": f"Client-ID {keys.unsplash_access_key}"}
        unsplash_params = {"query": keyword, "per_page": 1}
        unsplash_res = requests.get("https://api.unsplash.com/search/photos", headers=unsplash_headers, params=unsplash_params, timeout=5)
        if unsplash_res.status_code == 200:
            results = unsplash_res.json().get("results", [])
            if results:
                return results[0].get("urls", {}).get("regular", DEFAULT_IMAGE_URL)
    except requests.RequestException:
        pass # Ignore error

    # 4. Fallback to default
    return DEFAULT_IMAGE_URL


# --- API Endpoint to Generate a Full Weekly Plan ---
@router.post("/generate-plan")
async def generate_full_meal_plan(
    request: GenerateMealPlanRequest,
    api_keys: ApiKeys = Depends(get_api_keys)
):
    """
    Generates a complete 7-day meal plan (Breakfast, Lunch, Dinner) based on user preferences.
    It calls the Gemini API to get structured recipe data, then fetches images for each meal.
    """
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_keys.gemini_api_key}"
    headers = {"Content-Type": "application/json"}

    allergy_info = ", ".join(request.allergies) if request.allergies else "None"

    # A detailed prompt asking for a structured JSON array
    prompt = (
        f"Generate a complete 7-day meal plan, including Breakfast, Lunch, and Dinner for each day from Monday to Sunday. "
        f"Ensure the plan is varied, creative, and balanced, with no repeated meals. "
        f"The recipes should be suitable for a home cook.\n"
        f"CRITICAL: The meal plan MUST NOT contain any of the following allergens: {allergy_info}.\n\n"
        "Provide the response STRICTLY in the following JSON format. The output MUST be a valid JSON array containing exactly 21 meal objects. "
        "Do not include any text, comments, or markdown formatting like ```json before or after the JSON array.\n"
        "[\n"
        "  {\n"
        '    "day": "Monday",\n'
        '    "mealType": "Breakfast",\n'
        '    "recipe": {\n'
        '      "title": "Creative and appealing name of the recipe",\n'
        '      "prepTime": 20, // as an integer in minutes\n'
        '      "difficulty": "Easy", // "Easy", "Medium", or "Hard"\n'
        '      "cuisineType": "e.g., American",\n'
        '      "ingredients": ["Quantity Unit Ingredient Name", "e.g., 2 large Eggs", "e.g., 1 cup Flour"],\n'
        '      "instructions": ["Step-by-step instruction 1.", "Step-by-step instruction 2."],\n'
        '      "imageKeyword": "a short, descriptive phrase for an image search, e.g., fluffy blueberry pancakes"\n'
        '    }\n'
        '  },\n'
        "  // ... continue this structure for all 21 meals (Monday Lunch, Monday Dinner, Tuesday Breakfast, etc.) ...\n"
        "  {\n"
        '    "day": "Sunday",\n'
        '    "mealType": "Dinner",\n'
        '    "recipe": { ... }\n'
        '  }\n'
        "]"
    )

    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.8, # Slightly lower temp for more predictable structure
            "topP": 1,
            "topK": 1,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json", # Ask Gemini to output raw JSON
        }
    }

    try:
        # 1. Generate Meal Plan content from Gemini
        gemini_response = requests.post(gemini_url, headers=headers, json=data, timeout=60)
        gemini_response.raise_for_status()
        gemini_result = gemini_response.json()

        response_text = gemini_result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        # The response should be a clean JSON string because we set responseMimeType
        generated_plan = json.loads(response_text)

        if not isinstance(generated_plan, list):
             raise HTTPException(status_code=500, detail="Gemini response was not a valid list.")

        # 2. Process the generated plan: Fetch images and format for frontend
        final_meal_plan = []
        for meal in generated_plan:
            recipe_data = meal.get("recipe", {})
            if not recipe_data:
                continue

            # Fetch an image using the helper function
            image_keyword = recipe_data.get("imageKeyword", recipe_data.get("title", "delicious food"))
            image_url = _get_image_for_recipe(image_keyword, api_keys)

            # Format the recipe object to match the frontend state
            formatted_recipe = {
                "id": f"recipe-{uuid.uuid4()}",
                "title": recipe_data.get("title", "Unnamed Recipe"),
                "image": image_url,
                "prepTime": recipe_data.get("prepTime", 30),
                "difficulty": recipe_data.get("difficulty", "Medium"),
                "cuisineType": recipe_data.get("cuisineType", "Various"),
                "ingredients": recipe_data.get("ingredients", []),
                "instructions": recipe_data.get("instructions", []),
            }

            # Format the final meal object
            final_meal_plan.append({
                "id": f"meal-{uuid.uuid4()}",
                "day": meal.get("day"),
                "mealType": meal.get("mealType"),
                "recipe": formatted_recipe
            })

        return final_meal_plan

    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"An error occurred with an external API: {e}")
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        # This will catch errors if Gemini doesn't return the expected structure
        print(f"Error parsing Gemini response: {e}")
        print(f"Received text: {response_text if 'response_text' in locals() else 'N/A'}")
        raise HTTPException(status_code=500, detail="Could not parse the response from the recipe generation service.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")