from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uvicorn
from pathlib import Path  


env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)


from routers.Recipe import router as recipe_router
from routers.auth import router as auth_router
from routers.Save import router as save_router
from routers.generator import router as generator_router
from routers.mealplan import router as mealplan_router

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 8000))

app = FastAPI(
    title="Recipe App API",
    description="API for managing recipes, users, and authentication.",
    version="1.0.0",
)

# Configure CORS policy
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint to confirm the API is running.
    """
    return {"message": "Welcome to the Recipe App API!"}


@app.get("/health", tags=["Health Check"])
async def check_env_vars():
    """
    A safe endpoint to check if essential environment variables are loaded.
    Returns true if the variable is set, false otherwise.
    """
    return {
        "gemini_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "pixabay_key_set": bool(os.getenv("PIXABAY_API_KEY")),
        "mail_username_set": bool(os.getenv("MAIL_USERNAME")),
    }

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(recipe_router, prefix="/recipes", tags=["Recipes"])
app.include_router(save_router, prefix="/save", tags=["Save"])
app.include_router(generator_router, prefix="/api/generator", tags=["Recipe Generator"])
app.include_router(mealplan_router, prefix="/api/mealplan", tags=["Meal Plan Generator"])

if __name__ == "__main__":
  
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)