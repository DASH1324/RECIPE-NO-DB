import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "../folder/Card";
import { Badge } from "../folder/Badge";
import { Button } from "../folder/button";
import { Clock, ChefHat, Heart, Info } from "lucide-react";

const MealCard = ({
  id = "1",
  title = "Delicious Pasta Carbonara",
  image = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=80",
  prepTime = 30,
  difficulty = "Medium",
  cuisineType = "Italian",
  isFavorite = false,
  onFavoriteToggle = () => {},
  onViewDetails = () => {},
}) => {
  const getDifficultyClass = (level) => {
    switch (level) {
      case "Easy":
        return "badge-difficulty easy";
      case "Medium":
        return "badge-difficulty medium";
      case "Hard":
        return "badge-difficulty hard";
      default:
        return "badge-difficulty";
    }
  };

  return (
    <Card className="meal-card">
      <div className="meal-image-wrapper">
        <img src={image} alt={title} className="meal-image" />
        <Badge className="badge-top-right">{cuisineType}</Badge>
      </div>

      <CardHeader className="meal-title">
        <h3>{title}</h3>
      </CardHeader>

      <CardContent>
        <div className="meal-info">
          <div className="meal-info-item">
            <Clock className="icon" />
            <span>{prepTime} min</span>
          </div>
          <div className="meal-info-item">
            <ChefHat className="icon" />
            <span className={getDifficultyClass(difficulty)}>{difficulty}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="meal-footer">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFavoriteToggle(id)}
          className={isFavorite ? "favorite-active" : ""}
        >
          <Heart className={`icon ${isFavorite ? "fill" : ""}`} />
          {isFavorite ? "Saved" : "Save"}
        </Button>
        <Button variant="default" size="sm" onClick={() => onViewDetails(id)}>
          <Info className="icon" />
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MealCard;
