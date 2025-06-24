import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../buttons/card";
import { Progress } from "../buttons/Progress";
import { ChefHat, Sparkles } from "lucide-react";
import "./AIGenerationLoader.css"; // Import the CSS file

const AIGenerationLoader = ({
  title = "Creating your custom recipe",
  description = "Our AI chef is crafting a delicious recipe based on your ingredients",
  progress = 65,
  isGenerating = true,
}) => {
  return (
    <div className="loader-container">
      <Card className="loader-card">
        <CardHeader className="text-center">
          <CardTitle className="loader-title">{title}</CardTitle>
          <CardDescription className="loader-description">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="loader-content">
          <div className="loader-animation-container">
            <div className="relative">
              <motion.div
                animate={{ rotate: isGenerating ? 360 : 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="loader-chef"
              >
                <ChefHat size={64} className="text-primary" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="loader-sparkles"
              >
                <Sparkles size={80} className="text-amber-300 opacity-50" />
              </motion.div>
            </div>
          </div>

          <div className="loader-progress-container">
            <div className="loader-progress-labels">
              <span>Recipe generation</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="loader-quotes">
            <p>"Finding the perfect flavor combinations..."</p>
            <p>"Adjusting cooking times for optimal results..."</p>
            <p>"Adding a chef's special touch..."</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGenerationLoader;
