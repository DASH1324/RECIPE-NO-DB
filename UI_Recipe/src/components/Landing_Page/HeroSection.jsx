import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../buttons/button";
import "./HeroSection.css";

const HeroSection = ({
  title = "Recipe Generator",
  tagline = "Create personalized recipes tailored to your taste and dietary needs in seconds",
  backgroundImage = "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1400&q=80",
}) => {
  const navigate = useNavigate();

  return (
    <div className="hero-container">
      {/* Background Image with Overlay */}
      <div
        className="hero-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="hero-overlay"></div>
      </div>

      {/* Content Container */}
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-tagline">{tagline}</p>

        {/* Authentication Buttons */}
        <div className="hero-buttons">
          <Button
            className="hero-button login"
            onClick={() => navigate("/auth")} 
          >
            Login
          </Button>
          <Button className="hero-button signup">Sign Up</Button>
          <Button
            className="hero-button guest"
            onClick={() => navigate("/dashboard")}
          >
            Continue as Guest
          </Button>
        </div>

        {/* Scroll Down Indicator */}
        <div className="hero-scroll">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="scroll-icon"
          >
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
