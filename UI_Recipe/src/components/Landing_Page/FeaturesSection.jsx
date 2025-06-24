import React from "react";
import { Utensils, Clock, Heart, Sparkles } from "lucide-react";


import "./FeaturesSection.css"; 

const Feature = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Utensils size={24} />,
      title: "Personalized Recipes",
      description:
        "Get recipe recommendations tailored to your dietary preferences and available ingredients.",
    },
    {
      icon: <Clock size={24} />,
      title: "Quick & Easy",
      description:
        "Find recipes that match your time constraints, from 15-minute meals to slow-cooked dishes.",
    },
    {
      icon: <Heart size={24} />,
      title: "Health-Focused",
      description:
        "Discover nutritionally balanced meals that support your wellness goals and dietary needs.",
    },
    {
      icon: <Sparkles size={24} />,
      title: "Endless Inspiration",
      description:
        "Never run out of cooking ideas with our vast database of recipes from around the world.",
    },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2>Why Choose Our Recipe Generator</h2>
          <p>Discover the benefits of our smart recipe platform</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
