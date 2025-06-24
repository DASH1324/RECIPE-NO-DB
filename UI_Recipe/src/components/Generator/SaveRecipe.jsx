import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import RecipeCard from "./RecipeCard"; // Assuming this component exists
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../buttons/tabs"; // Assuming this component exists
import "./RecipeResults.css"; // Assuming this CSS file exists

// ================== APPLIED CHANGES START HERE ==================

// 1. Mock data to replace the backend API call.
// This array simulates the data that would have been fetched from the database.
const mockSavedRecipes = [
  {
    recipe_number: 101,
    recipe_name: "Classic Spaghetti Carbonara",
    image_url: "https://images.unsplash.com/photo-1623336043003-55a01a33a75a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8c3BhZ2hldHRpfHx8fHx8MTYyNjQ1MzE1OA&ixlib=rb-1.2.1&q=80&w=1080",
    cook_time: "30 minutes",
    difficulty: "Easy",
  },
  {
    recipe_number: 102,
    recipe_name: "Beef Wellington",
    image_url: "https://images.unsplash.com/photo-1580461876125-12171336a5a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YmVlZiB3ZWxsaW5ndG9ufHx8fHx8MTYyNjQ1MzIwNA&ixlib=rb-1.2.1&q=80&w=1080",
    cook_time: "2 hours",
    difficulty: "Hard",
  },
  {
    recipe_number: 103,
    recipe_name: "Chicken Tikka Masala",
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2hpY2tlbiB0aWtrYSBtYXNhbGF8fHx8fHwxNjI2NDUzMjI0&ixlib=rb-1.2.1&q=80&w=1080",
    cook_time: "50 minutes",
    difficulty: "Medium",
  },
  {
    recipe_number: 104,
    recipe_name: "Simple Garden Salad",
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8c2FsYWR8fHx8fHwxNjI2NDUzMjQ0&ixlib=rb-1.2.1&q=80&w=1080",
    cook_time: "15 minutes",
    difficulty: "Easy",
  },
];


const SavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fullName = localStorage.getItem("full_name");

  useEffect(() => {
    // 2. The API call has been replaced with a simulated fetch using mock data.
    // We use a timeout to mimic the delay of a real network request.
    const loadMockRecipes = () => {
      setIsLoading(true);

      setTimeout(() => {
        // If the user is "logged in" (has a name in localStorage), show the mock recipes.
        if (fullName) {
          console.log("Loading mock saved recipes for user:", fullName);
          setSavedRecipes(mockSavedRecipes);
        } else {
          // If not logged in, show an empty list.
          console.log("User is not logged in. No recipes to show.");
          setSavedRecipes([]);
        }
        // Stop the loading indicator after the "fetch" is complete.
        setIsLoading(false);
      }, 500); // 500ms delay to simulate loading
    };

    loadMockRecipes();
    
    // The effect still depends on `fullName` to re-run if the user logs in or out.
  }, [fullName]);

// =================== APPLIED CHANGES END HERE ===================

  // Filter recipes based on the active difficulty tab.
  const filteredRecipes = savedRecipes.filter((recipe) => {
    return (
      activeTab === "all" ||
      recipe.difficulty?.toLowerCase() === activeTab.toLowerCase()
    );
  });

  // A helper function to render the main content area.
  const renderRecipeContent = (recipes) => {
    // Show a loading spinner while "fetching" data.
    if (isLoading) {
      return (
        <div className="loading">
          <Loader2 className="spinner" />
          <span>Loading saved recipes...</span>
        </div>
      );
    }
    
    // If the user isn't logged in, show a specific message.
    if (!fullName) {
        return <p className="no-results">Please log in to view your saved recipes.</p>
    }

    // Show a message if there are no recipes in the current category.
    if (recipes.length === 0) {
      return <p className="no-results">No saved recipes in this category.</p>;
    }

    // Display the grid of recipes.
    return (
      <div className="recipe-grid">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={index}
            title={recipe.recipe_name}
            image={recipe.image_url}
            cookingTime={recipe.cook_time}
            difficulty={recipe.difficulty}
            recipeNumber={recipe.recipe_number}
            onClick={() => console.log("Clicked saved recipe:", recipe.recipe_name)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="recipe-container">
      <h2>Saved Recipes{fullName ? ` for ${fullName}` : ''}</h2>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderRecipeContent(filteredRecipes)}</TabsContent>
        <TabsContent value="easy">{renderRecipeContent(filteredRecipes)}</TabsContent>
        <TabsContent value="medium">{renderRecipeContent(filteredRecipes)}</TabsContent>
        <TabsContent value="hard">{renderRecipeContent(filteredRecipes)}</TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedRecipes;