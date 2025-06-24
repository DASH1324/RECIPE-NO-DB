import React, { useState } from "react";
import IngredientInput from "./IngredientInput";
import RecipeResults from "./RecipeResults";

const RecipePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // This function will be triggered after the API responds
  const handleRecipeSubmit = (data) => {
    setRecipes(data.results); // Ensure this matches your API response structure
    setIsLoading(false);
  };

  return (
    <div>
      {/* Ingredient Input */}
      <IngredientInput
        onSubmit={(data) => {
          setIsLoading(true); // Show loader while waiting for the response
          handleRecipeSubmit(data);
        }}
        onImageUpload={(file) => {
          console.log("Image uploaded:", file);
        }}
      />

      {/* Display Recipe Results After Loading */}
      {isLoading ? (
        <p>Loading recipes...</p>
      ) : recipes.length > 0 ? (
        <RecipeResults recipes={recipes} />
      ) : (
        <p>No recipes found. Please add ingredients and search.</p>
      )}
    </div>
  );
};

export default RecipePage;
