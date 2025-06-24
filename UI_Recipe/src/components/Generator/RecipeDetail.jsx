import React, { useState, useEffect } from "react";
import { Clock, ChefHat, Utensils, X, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../buttons/Card";
import { Badge } from "../buttons/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../buttons/tabs";
import Swal from "sweetalert2";
import "./RecipeDetail.css"; // The updated CSS file

const RecipeDetail = ({ data, onClose }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Get username from localStorage for API calls, default to "Guest"
  const storedUsername = localStorage.getItem("username") || "Guest";

  const {
    recipe_name = "Unnamed Recipe",
    image_url = "",
    cook_time = "Unknown",
    difficulty = "Unknown",
    description = "No description provided",
    ingredients = [],
    instructions = [],
    servings = "N/A"
  } = data || {};

  const difficultyVariant = {
    Easy: "default",
    Medium: "secondary",
    Hard: "destructive",
  }[difficulty] || "default";

  useEffect(() => {
    // This effect provides a simple client-side check for the "Saved" status.
    const localSavedRecipes = JSON.parse(localStorage.getItem("saved_recipes")) || [];
    if (localSavedRecipes.some(r => r.recipe_name === recipe_name)) {
      setIsSaved(true);
    }
  }, [recipe_name]);

  const handleSaveRecipe = () => {
    if (storedUsername === "Guest") {
        Swal.fire({
            icon: 'error',
            title: 'Not Logged In',
            text: 'You must be logged in to save a recipe.',
        });
        return;
    }
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setShowConfirm(false);

    // Use 'username' for consistency with the no-DB backend
    const recipeToSave = {
      username: storedUsername,
      recipe_name,
      description,
      ingredients,
      instructions,
      servings,
      difficulty,
      cook_time,
      image_url,
    };

    try {
      const response = await fetch("https://recipe-no-db.onrender.com/save/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeToSave),
      });

      const resultData = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: `"${recipe_name}" has been saved successfully.`,
        });

        setIsSaved(true);
        // A simple way to keep client-side state in sync.
        const localSavedRecipes = JSON.parse(localStorage.getItem("saved_recipes")) || [];
        if (!localSavedRecipes.some(r => r.recipe_name === recipe_name)) {
          localSavedRecipes.push(recipeToSave);
          localStorage.setItem("saved_recipes", JSON.stringify(localSavedRecipes));
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: resultData.detail || "Something went wrong!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not connect to the server. Please try again.",
      });
    }
  };

  if (!data) return null;

  return (
    <div className="recipe-detail__overlay" onClick={onClose}>
      <div className="recipe-detail__content" onClick={(e) => e.stopPropagation()}>
        <button className="recipe-detail__close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="recipe-detail__header-grid">
          <div className="recipe-detail__image-container">
            <img className="recipe-detail__image" src={image_url} alt={recipe_name} />
          </div>

          <div className="recipe-detail__info">
            <h1 className="recipe-detail__title">{recipe_name}</h1>
            <div className="recipe-detail__meta">
              <div className="recipe-detail__meta-item">
                <Clock size={18} />
                <span>{cook_time}</span>
              </div>
              <div className="recipe-detail__meta-item">
                <Utensils size={18} />
                <span>{servings}</span>
              </div>
              <Badge variant={difficultyVariant}>
                <ChefHat size={14} />
                <span>{difficulty}</span>
              </Badge>
            </div>
            
            {!isSaved ? (
              <button className="recipe-detail__save-btn" onClick={handleSaveRecipe}>
                <Bookmark size={16} /> Save Recipe
              </button>
            ) : (
              <p className="recipe-detail__saved-text">✓ Saved to Favorites</p>
            )}
          </div>
        </div>

        <Tabs defaultValue="ingredients" className="recipe-detail__tabs">
          <TabsList> {/* This component will get its own classes from the library */}
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="recipe-detail__tab-content">
            <Card>
              <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
              <CardContent>
                <ul>
                  {ingredients.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="instructions" className="recipe-detail__tab-content">
            <Card>
              <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
              <CardContent>
                <ol>
                  {instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showConfirm && (
        <div className="recipe-detail__confirm-modal">
          <div className="recipe-detail__confirm-box">
            <p>Save "{recipe_name}" to your favorites?</p>
            <div className="recipe-detail__confirm-buttons">
              <button onClick={confirmSave} className="recipe-detail__confirm-btn--yes">Yes, Save</button>
              <button onClick={() => setShowConfirm(false)} className="recipe-detail__confirm-btn--no">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;