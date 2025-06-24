import React, { useState } from "react";
import { Clock, ChefHat } from "lucide-react";
import axios from "axios";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../buttons/Card";
import { Badge } from "../buttons/badge";
import RecipeDetail from "./RecipeDetail"; // Import the modal
import "./RecipeCard.css";

const RecipeCard = ({
  recipeNumber = "1",
  title = "Pasta Primavera",
  image = "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  cookingTime = 30,
  difficulty = "Medium",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [detailedData, setDetailedData] = useState(null);

  const difficultyVariant = {
    Easy: "default",
    Medium: "secondary",
    Hard: "destructive",
  }[difficulty];

  const handleClick = async () => {
    const requestData = {
      recipe_name: title,
      cook_time: cookingTime,
      difficulty,
      image_url: image,
    };

    try {
      const response = await axios.post("https://recipe-no-db.onrender.com/recipes/recipe-details", requestData);
      setDetailedData(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("❌ Error fetching detailed recipe:", error);
    }
  };

  return (
    <>
      <Card className="recipe-card" onClick={handleClick}>
        <div className="recipe-card-image">
          <img src={image} alt={title} />
        </div>

        <CardHeader>
          <CardTitle className="recipe-title">{title}</CardTitle>
        </CardHeader>

        <CardContent className="recipe-content">
          <div className="recipe-info">
            <Clock size={16} />
            <span>{cookingTime} mins</span>
          </div>
        </CardContent>

        <CardFooter className="recipe-footer">
          <Badge variant={difficultyVariant} className="recipe-badge">
            <ChefHat size={12} />
            <span>{difficulty}</span>
          </Badge>

          <span className="recipe-id">Recipe #{recipeNumber}</span>
        </CardFooter>
      </Card>

      {showModal && (
        <RecipeDetail
          data={detailedData}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default RecipeCard;
