// src/components/Daily/DailyHomePage.jsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../buttons/Cards";
import RecipeGenerator from "./RecipeGenerator";
import "./DailyHomePage.css";

const DailyHomePage = () => {
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [recipe, setRecipe] = useState(null);

  return (
    <div className="daily-home-page-container">
      {/* 
        NO .center-wrapper HERE! 
        The Card and Footer are now direct children.
      */}
      <Card className="daily-home-card">
        <CardHeader className="daily-home-card-header">
          <CardTitle className="daily-home-card-title">
            Daily Recipe Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="daily-home-card-content">
          <div className="content-wrapper">
            <p className="description-text">
              Get a personalized recipe recommendation for your next meal. Select
              a meal type and click generate to discover a delicious recipe to try
              today!
            </p>

            <RecipeGenerator
              selectedMealType={selectedMealType}
              setSelectedMealType={setSelectedMealType}
              recipe={recipe}
              setRecipe={setRecipe}
            />
          </div>
        </CardContent>
      </Card>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} Recipe Recommendation System</p>
      </footer>
    </div>
  );
};

export default DailyHomePage;