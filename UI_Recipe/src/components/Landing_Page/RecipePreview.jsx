import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../buttons/Card";
import { Button } from "../buttons/button";
import { Clock, Users, Utensils } from "lucide-react";
import "./RecipePreview.css";

const RecipePreview = ({
  title = "Creamy Garlic Parmesan Pasta",
  description = "A delicious and easy pasta dish that's perfect for weeknight dinners. Creamy, garlicky, and full of flavor!",
  ingredients = [
    "8 oz fettuccine pasta",
    "2 tbsp butter",
    "4 cloves garlic, minced",
    "1 cup heavy cream",
    "1 cup grated parmesan cheese",
    "Salt and pepper to taste",
    "Fresh parsley for garnish",
  ],
  steps = [
    "Cook pasta according to package directions until al dente.",
    "In a large skillet, melt butter over medium heat. Add garlic and sauté for 1-2 minutes until fragrant.",
    "Pour in heavy cream and bring to a simmer. Cook for 3-4 minutes until slightly thickened.",
    "Stir in parmesan cheese until melted and smooth. Season with salt and pepper.",
    "Add cooked pasta to the sauce and toss to coat evenly.",
    "Garnish with fresh parsley and additional parmesan if desired.",
  ],
  prepTime = "25 minutes",
  servings = 4,
  imageUrl = "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80",
}) => {
  return (
    <section className="recipe-preview-section">
      <div className="recipe-preview-container">
        <div className="recipe-preview-header">
          <h2 className="recipe-preview-title">See What You Can Create</h2>
          <p className="recipe-preview-description">
            Our recipe generator creates personalized, detailed recipes like this
            one. Try it yourself!
          </p>
        </div>

        <div className="recipe-preview-content">
          <div className="recipe-card">
            <div className="recipe-image">
              <img src={imageUrl} alt={title} />
            </div>

            <CardHeader>
              <CardTitle className="recipe-card-title">{title}</CardTitle>
              <CardDescription className="recipe-card-description">
                {description}
              </CardDescription>

              <div className="recipe-info">
                <div className="recipe-info-item">
                  <Clock size={18} />
                  <span>{prepTime}</span>
               
                  <Users size={18} />
                  <span>{servings} servings</span>
                
                  <Utensils size={18} />
                  <span>Easy</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <h3 className="ingredients-title">Ingredients</h3>
                <ul className="ingredients-list">
                  {ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="instructions-title">Instructions</h3>
                <ol className="instructions-list">
                  {steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </CardContent>

            <CardFooter className="recipe-card-footer">
              <Button className="generate-recipe-button">
                Generate Your Own Recipe
              </Button>
            </CardFooter>
          </div>

          <div className="recipe-features">
            <h3 className="features-title">
              Personalized Recipes in Seconds
            </h3>
            <p className="features-description">
              Our AI-powered recipe generator creates custom recipes based on
              your preferences, dietary restrictions, and available ingredients.
              No more searching through endless recipe sites or cookbooks!
            </p>

            <div className="space-y-4">
              <div className="feature-item">
                <div className="feature-icon">
                  <Utensils size={20} />
                </div>
                <div className="feature-text">
                  <h4 className="feature-title">Ingredient Flexibility</h4>
                  <p className="feature-description">
                    Use what you have on hand - our app adapts recipes to your
                    available ingredients.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Users size={20} />
                </div>
                <div className="feature-text">
                  <h4 className="feature-title">Dietary Accommodations</h4>
                  <p className="feature-description">
                    Easily filter for allergies, preferences, or special diets
                    like vegan, keto, or gluten-free.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Clock size={20} />
                </div>
                <div className="feature-text">
                  <h4 className="feature-title">Time-Saving</h4>
                  <p className="feature-description">
                    Specify your available prep time and get recipes that fit
                    your schedule.
                  </p>
                </div>
              </div>
            </div>

            <Button className="try-button">Try Recipe Generator Now</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipePreview;