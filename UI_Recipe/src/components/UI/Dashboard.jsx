import React, { useState, useEffect } from "react";
import Header from "../Generator/Header";
import IngredientInput from "../Generator/IngredientInput";
import RecipeResults from "../Generator/RecipeResults";
import RecipeDetail from "../Generator/RecipeDetail";
import "./Dashboard.css"; 

const Dashboard = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [fullName, setFullName] = useState("");

  // Retrieve full name from localStorage on component mount
  useEffect(() => {
    const storedFullName = localStorage.getItem("full_name");
    setFullName(storedFullName || "Guest");
  }, []);

  const handleIngredientSubmit = (ingredients) => {
    setSelectedIngredients(ingredients);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleRecipeSelect = (recipeId) => {
    setSelectedRecipeId(recipeId);
  };

  const handleBackToResults = () => {
    setSelectedRecipeId(null);
  };

  const handleGenerateRecipe = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 5000);
  };

  return (
    <div className="dashboard-container">
      <Header
        onSearch={handleSearchChange}
        userName={fullName}
        isLoggedIn={true}
        className="dashboard-header"
      />
      <main className="dashboard-content">
        {!selectedRecipeId ? (
          <>
            <IngredientInput onSubmit={handleIngredientSubmit} />

            {selectedIngredients.length > 0 && (
              <RecipeResults
                isLoading={isLoading}
                isGenerating={isGenerating}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onRecipeSelect={handleRecipeSelect}
                onGenerateRecipe={handleGenerateRecipe}
              />
            )}
          </>
        ) : (
          <RecipeDetail
            id={selectedRecipeId}
            onBack={handleBackToResults}
            onSave={() => console.log("Recipe saved")}
            onStartCooking={() => console.log("Started cooking")}
          />
        )}
      </main>
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>© 2023 Recipe Generator App. All rights reserved.</p>
          <p className="powered-by">Powered by AI Chef Technology</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
