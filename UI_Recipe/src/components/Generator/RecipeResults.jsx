import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import RecipeCard from "./RecipeCard";
import AIGenerationLoader from "./AIGenerationLoader";
import { Input } from "../buttons/input"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../buttons/tabs";
import "./RecipeResults.css";

const RecipeResults = ({
  recipes = [],
  isLoading = false,
  isGenerating = false,
  searchQuery = "",
  onSearchChange = () => {},
  onRecipeSelect = () => {},
  onGenerateRecipe = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Filter recipes based on difficulty and search query
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesDifficulty = activeTab === "all" || recipe.difficulty?.toLowerCase() === activeTab;
    const matchesSearch = recipe.recipe_name?.toLowerCase().includes(localSearchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const handleSearchChange = (e) => {
    setLocalSearchQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <div className="recipe-container">
      <div className="search-filter">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <Input
            type="text"
            placeholder="Search recipes..."
            className="search-input"
            value={localSearchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

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

      {filteredRecipes.length === 0 && !isLoading && !isGenerating && (
        <div className="no-recipes">
          <h3>No matching recipes found</h3>
          <p>We couldn't find any recipes that match your ingredients.</p>
          <input type="button" value="Generate Custom Recipe" onClick={onGenerateRecipe} />
        </div>
      )}
    </div>
  );

  // Function to render recipes or loader
  function renderRecipeContent(recipes) {
    if (isLoading) {
      return (
        <div className="loading">
          <Loader2 className="spinner" />
          <span>Loading recipes...</span>
        </div>
      );
    }

    if (isGenerating) {
      return <AIGenerationLoader />;
    }

    if (recipes.length === 0) {
      return <p className="no-results">No recipes found in this category</p>;
    }

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
            onClick={() => onRecipeSelect(recipe.id)}
          />
        ))}
      </div>
    );
  }
};

export default RecipeResults;
