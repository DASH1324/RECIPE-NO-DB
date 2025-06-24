import re
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
import os
import requests
import json
from pydantic import BaseModel
from typing import List

# --- Pydantic model for the incoming request body ---
class RecommendRequest(BaseModel):
    ingredients: List[str]
    allergies: List[str] = []

class RecipeDetailsRequest(BaseModel):
    recipe_name: str
    cook_time: str
    difficulty: str
    image_url: str

load_dotenv()

router = APIRouter()

# Default image URL if no images
DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"

# -------------------- RECOMMEND RECIPES --------------------
@router.post("/recommend")
async def recommend_recipe(request: RecommendRequest):
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    pixabay_api_key = os.getenv("PIXABAY_API_KEY")
    pexels_api_key = os.getenv("PEXELS_API_KEY")
    unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY")

    if not all([gemini_api_key, pixabay_api_key, pexels_api_key, unsplash_access_key]):
        raise HTTPException(status_code=400, detail="API keys are not set properly in the .env file")

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"

    ingredient_list = ", ".join(request.ingredients)
    
    allergy_prompt_part = ""
    if request.allergies:
        allergy_list = ", ".join(request.allergies)
        allergy_prompt_part = f"The recipes MUST NOT contain any of the following allergens: {allergy_list}.\n"

    prompt = (
        f"List common and popular recipes that use all or most of the following ingredients: {ingredient_list}. "
        f"{allergy_prompt_part}"
        f"For each recipe, provide the following details in this exact format:\n\n"
        f"Recipe# (Number)\n"
        f"Recipe Name: (Name)\n"
        f"Time to Cook: (Approximate cooking time in minutes)\n"
        f"Difficulty: (Easy, Medium, or Hard)\n"
        f"Ensure a balanced variety of difficulties.\n"
        f"Image Keyword: (A specific and descriptive keyword for image search)\n\n"
        f"Try to match as many ingredients from the list as possible.\n"
        f"Do not include anything in Recipe Name Just the Recipe Name."
    )

    data = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}

    try:
        gemini_response = requests.post(gemini_url, headers=headers, json=data)
        gemini_response.raise_for_status()
        gemini_result = gemini_response.json()

        recipe_text = (
            gemini_result.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        
        recipes = recipe_text.strip().split("\n\n")
        results = []

        for recipe in recipes:
            recipe_lines = recipe.strip().split("\n")
            if len(recipe_lines) >= 5:
                recipe_number = recipe_lines[0].replace("Recipe# ", "").strip()
                recipe_name = recipe_lines[1].replace("Recipe Name: ", "").strip()
                cook_time = recipe_lines[2].replace("Time to Cook: ", "").strip()
                difficulty = recipe_lines[3].replace("Difficulty: ", "").strip()
                image_keyword = recipe_lines[4].replace("Image Keyword: ", "").strip()

                image_url = DEFAULT_IMAGE_URL


                # --- Pixabay Search (Primary Choice) ---
                pixabay_url = "https://pixabay.com/api/"
                pixabay_params = {
                    "key": pixabay_api_key,
                    "q": image_keyword,
                    "image_type": "photo",
                    "safesearch": "true",
                    "order": "popular",
                    "per_page": 1
                }
                pixabay_response = requests.get(pixabay_url, params=pixabay_params)
                if pixabay_response.status_code == 200:
                    pixabay_data = pixabay_response.json()
                    hits = pixabay_data.get("hits", [])
                    if hits:
                        image_url = hits[0].get("webformatURL", DEFAULT_IMAGE_URL)

                # --- Pexels Search (Fallback) ---
                if image_url == DEFAULT_IMAGE_URL:
                    pexels_url = "https://api.pexels.com/v1/search"
                    pexels_headers = {"Authorization": pexels_api_key}
                    pexels_params = {"query": image_keyword, "per_page": 1}
                    pexels_response = requests.get(pexels_url, headers=pexels_headers, params=pexels_params)
                    if pexels_response.status_code == 200:
                        pexels_data = pexels_response.json()
                        photos = pexels_data.get("photos", [])
                        if photos:
                            image_url = photos[0].get("src", {}).get("medium", DEFAULT_IMAGE_URL)

                # --- Unsplash Search (Final Fallback) ---
                if image_url == DEFAULT_IMAGE_URL:
                    unsplash_url = "https://api.unsplash.com/search/photos"
                    unsplash_params = { "query": image_keyword, "per_page": 1 }
                    unsplash_headers = { "Authorization": f"Client-ID {unsplash_access_key}" }
                    unsplash_response = requests.get(unsplash_url, headers=unsplash_headers, params=unsplash_params)
                    if unsplash_response.status_code == 200:
                        results_unsplash = unsplash_response.json().get("results", [])
                        if results_unsplash:
                            image_url = results_unsplash[0].get("urls", {}).get("regular", DEFAULT_IMAGE_URL)

                results.append({
                    "recipe_number": recipe_number,
                    "recipe_name": recipe_name,
                    "cook_time": cook_time,
                    "difficulty": difficulty,
                    "image_url": image_url
                })
        
        return {"results": results}

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request Error: {e}")

    except Exception as general_error:
        raise HTTPException(status_code=500, detail=f"General Error: {general_error}")


# -------------------- GET DETAILED RECIPE INFO --------------------
# This endpoint remains unchanged.
@router.post("/recipe-details")
async def get_recipe_details(details: RecipeDetailsRequest):
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if not gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API key is not set properly in the .env file")

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"

    prompt = (
        f"Provide detailed information for the recipe '{details.recipe_name}'. Respond strictly in the following JSON format:\n\n"
        "{\n"
        "  \"description\": \"A brief and enticing description of the recipe.\",\n"
        "  \"ingredients\": [\"ingredient \", \"ingredient \", \"ingredient \"],\n"
        "  \"instructions\": [\"Step 1 instruction.\", \"Step 2 instruction.\"],\n"
        "  \"servings\": \"4 servings\"\n"
        "}\n"
    )

    data = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}

    try:
        gemini_response = requests.post(gemini_url, headers=headers, json=data)
        gemini_response.raise_for_status()
        gemini_result = gemini_response.json()

        recipe_details_text = gemini_result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        json_match = re.search(r"\{.*\}", recipe_details_text, re.DOTALL)

        if not json_match:
            raise HTTPException(status_code=500, detail="Failed to locate JSON in Gemini response.")

        details_json = json.loads(json_match.group())

        return {
            **details.dict(),
            "description": details_json.get("description", "No description available."),
            "ingredients": details_json.get("ingredients", ["No ingredients listed."]),
            "instructions": details_json.get("instructions", ["No instructions provided."]),
            "servings": details_json.get("servings", "No servings information provided.")
        }

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request Error: {e}")

    except Exception as general_error:
        raise HTTPException(status_code=500, detail=f"General Error: {general_error}")