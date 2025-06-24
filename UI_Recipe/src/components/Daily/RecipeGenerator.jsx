import React, { useState } from "react";
import MealTypeSelector from "./MealTypeSelector";
import RecipeDisplay from "./RecipeDisplay";
import AllergySelector from "./AllergySelector";
import "./RecipeGenerator.css";

// The backend API endpoint
const API_URL = "http://127.0.0.1:8000/api/generator/generate";

const RecipeGenerator = () => {
  // State for user selections
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [userAllergies, setUserAllergies] = useState([]);

  // State for the received recipe and API status
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMealTypeChange = (mealType) => {
    setSelectedMealType(mealType);
    setCurrentRecipe(null); // Reset recipe when meal type changes
    setError(null); // Clear any previous errors
  };

  /**
   * Fetches a recipe from the backend API based on user selections.
   */
  const generateRecipe = async () => {
    // --- MODIFICATION: Prepare the request body before setting loading state ---
    // 1. Construct the base request payload
    const requestBody = {
      meal_type: selectedMealType,
      allergies: userAllergies,
    };

    // 2. If a recipe is already displayed, add its name to the payload
    //    This tells the backend to generate a *different* recipe.
    if (currentRecipe && currentRecipe.name) {
      requestBody.previous_recipe_name = currentRecipe.name;
    }

    // 3. Set loading state and clear previous results/errors for the UI
    setIsLoading(true);
    setError(null);
    setCurrentRecipe(null);

    try {
      // 4. Make the POST request to the backend with the prepared body
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // <-- Use the new requestBody
      });

      // 5. Handle non-successful responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.detail || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // 6. If successful, parse the JSON data and update the state
      const data = await response.json();
      setCurrentRecipe(data);
    } catch (err) {
      // 7. Handle any errors
      console.error("Failed to generate recipe:", err);
      setError(err.message);
    } finally {
      // 8. Always stop the loading indicator
      setIsLoading(false);
    }
  };

  return (
    <div className="recipe-generator">
      <div className="section">
        <MealTypeSelector
          selectedMealType={selectedMealType}
          onMealTypeChange={handleMealTypeChange}
        />
      </div>

      <div className="section">
        <AllergySelector
          selectedAllergies={userAllergies}
          onAllergyChange={setUserAllergies}
        />
      </div>

      <button
        onClick={generateRecipe}
        className="generate-button"
        disabled={isLoading}
      >
        {isLoading
          ? "Generating..."
          : currentRecipe
          ? "Regenerate Recipe"
          : "Generate Recipe"}
      </button>

      <div className="recipe-display-area">
        {isLoading && (
          <div className="placeholder-card">
            <p>Finding a delicious recipe for you...</p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}

        {currentRecipe && !isLoading && (
          <RecipeDisplay
            recipeName={currentRecipe.name}
            ingredients={currentRecipe.ingredients.map((ing) => {
              const parts = ing.split(" ");
              const amount = parts.slice(0, 2).join(" ");
              const name = parts.slice(2).join(" ");
              return { name: name || ing, amount };
            })}
            instructions={currentRecipe.instructions}
            cookingTime={parseInt(currentRecipe.cookingTime) || 0}
            mealType={selectedMealType}
            image={currentRecipe.image}
          />
        )}
        
        {!currentRecipe && !isLoading && !error && (
            <div className="placeholder-card">
                <p className="placeholder-text">
                    Select your preferences and click "Generate Recipe" to get a recommendation.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;