from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

router = APIRouter()

# --- Pydantic Models ---
class SaveRecipeRequest(BaseModel):
    # Changed from full_name to username for consistency
    username: str 
    recipe_name: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    servings: str
    difficulty: str
    cook_time: str
    image_url: str

# --- In-Memory "Database" ---
# This dictionary will store saved recipes.
# The key is the lowercase username, and the value is a list of their saved recipes.
IN_MEMORY_SAVED_RECIPES = {
    "estanislao": [] 
}

# --- Hardcoded User Check ---
# For simplicity, we only allow the known hardcoded user to save recipes.
VALID_USERS = ["estanislao"]

# --- API Endpoints ---

@router.post("/save-recipe", status_code=status.HTTP_201_CREATED)
async def save_recipe(request: SaveRecipeRequest):
    """Saves a recipe to the in-memory dictionary for the user."""
    
    user_key = request.username.lower()

    # 1. Check if the user is valid
    if user_key not in VALID_USERS:
        raise HTTPException(status_code=404, detail=f"User '{request.username}' not found or is not allowed to save recipes.")

    # 2. Ensure the user has an entry in our in-memory DB
    if user_key not in IN_MEMORY_SAVED_RECIPES:
        IN_MEMORY_SAVED_RECIPES[user_key] = []

    # 3. Check if the recipe is already saved to prevent duplicates
    saved_recipes = IN_MEMORY_SAVED_RECIPES[user_key]
    if any(recipe.recipe_name.lower() == request.recipe_name.lower() for recipe in saved_recipes):
        # --- THIS IS THE CORRECTED LINE ---
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Recipe '{request.recipe_name}' is already in your favorites.")

    # 4. Save the new recipe
    # We store the request model directly. No need for json.dumps.
    IN_MEMORY_SAVED_RECIPES[user_key].append(request)

    return {"message": f"Recipe '{request.recipe_name}' saved successfully!"}


@router.get("/saved-recipes/{username}")
async def get_saved_recipes(username: str):
    """Retrieves all saved recipes for a given user from the in-memory dictionary."""
    
    user_key = username.lower()

    # 1. Check if the user is valid
    if user_key not in VALID_USERS:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")

    # 2. Return the user's saved recipes, or an empty list if none exist
    recipes = IN_MEMORY_SAVED_RECIPES.get(user_key, [])
    
    # We can return the list of Pydantic models directly, FastAPI handles serialization.
    return {"recipes": recipes}


@router.delete("/delete-recipe/{username}/{recipe_name}", status_code=status.HTTP_200_OK)
async def delete_saved_recipe(username: str, recipe_name: str):
    """Deletes a specific saved recipe for a user."""

    user_key = username.lower()

    # 1. Check if the user is valid
    if user_key not in VALID_USERS:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")

    # 2. Check if the user has any saved recipes
    if user_key not in IN_MEMORY_SAVED_RECIPES:
        raise HTTPException(status_code=404, detail="User has no saved recipes.")

    # 3. Find the recipe to delete
    recipes = IN_MEMORY_SAVED_RECIPES[user_key]
    recipe_to_delete = None
    for recipe in recipes:
        if recipe.recipe_name.lower() == recipe_name.lower():
            recipe_to_delete = recipe
            break
    
    # 4. If found, remove it. Otherwise, raise an error.
    if recipe_to_delete:
        recipes.remove(recipe_to_delete)
        return {"message": f"Recipe '{recipe_name}' was removed from your favorites."}
    else:
        raise HTTPException(status_code=404, detail=f"Recipe '{recipe_name}' not found in your favorites.")