import React from "react";
import "./RecipeDisplay.css";

// --- CONVERTED TO JSX ---

/**
 * JSDoc for developers: Defines the structure of an ingredient object.
 * @typedef {object} Ingredient
 * @property {string} name - The name of the ingredient.
 * @property {string} amount - The quantity of the ingredient (e.g., "2 large", "1 cup").
 */

/**
 * JSDoc for developers: Defines the props for the RecipeDisplay component.
 * @param {object} props
 * @param {string} props.recipeName
 * @param {Ingredient[]} props.ingredients - An array of ingredient objects.
 * @param {string[]} props.instructions - An array of instruction steps.
 * @param {number} props.cookingTime - The cooking time in minutes.
 * @param {"breakfast" | "lunch" | "dinner"} props.mealType
 * @param {string} [props.image] - Optional URL for the recipe image.
 */
const RecipeDisplay = ({
  recipeName = "Scrambled Eggs with Avocado Toast",
  ingredients = [
    { name: "Eggs", amount: "2 large" },
    { name: "Bread", amount: "2 slices" },
    { name: "Avocado", amount: "1 ripe" },
    { name: "Salt", amount: "to taste" },
    { name: "Pepper", amount: "to taste" },
    { name: "Butter", amount: "1 tbsp" },
  ],
  instructions = [
    "Toast the bread until golden brown.",
    "Mash the avocado and spread it on the toast. Season with salt and pepper.",
    "Melt butter in a non-stick pan over medium heat.",
    "Whisk eggs in a bowl and pour into the pan.",
    "Stir gently until eggs are softly set.",
    "Serve eggs alongside avocado toast.",
  ],
  cookingTime = 15,
  mealType = "breakfast",
  image = "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
}) => {
  return (
    <div className="recipe-card">
      <div className="recipe-layout">
        <div className="recipe-image-container">
          <img src={image} alt={recipeName} className="recipe-image" />
          <div className="meal-type-badge">
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </div>
        </div>

        <div className="recipe-content">
          <div className="recipe-header">
            <div className="recipe-title-section">
              <h2 className="recipe-title">{recipeName}</h2>
              <div className="recipe-time">
                <span className="clock-icon">🕒</span>
                <span>{cookingTime} minutes</span>
              </div>
            </div>
            <div className="chef-icon">👨‍🍳</div>
          </div>

          <div className="recipe-details">
            <div className="ingredients-section">
              <h3 className="section-title">
                <span className="utensils-icon">🍴</span> Ingredients
              </h3>
              <div className="separator"></div>
              <ul className="ingredients-list">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className="ingredient-amount">
                      {ingredient.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="instructions-section">
              <h3 className="section-title">Instructions</h3>
              <div className="separator"></div>
              <ol className="instructions-list">
                {instructions.map((step, index) => (
                  <li key={index} className="instruction-step">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="recipe-footer">
            <div className="footer-text">
              Perfect for a delicious {mealType}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;