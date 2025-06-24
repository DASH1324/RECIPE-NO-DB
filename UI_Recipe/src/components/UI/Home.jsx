
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import HeroSection from "../Landing_Page/HeroSection";
import FeaturesSection from "../Landing_Page/FeaturesSection";
import RecipePreview from "../Landing_Page/RecipePreview";
import { Button } from "../buttons/button";
import "./Home.css"; 

const Home = () => {
  const navigate = useNavigate(); 
  const featuresSectionRef = useRef(null);
  const recipePreviewRef = useRef(null);

  const handleScrollToFeatures = (event) => {
    event.preventDefault(); 
    featuresSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleScrollToRecipePreview = (event) => {
    event.preventDefault();
    recipePreviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSignUpClick = () => {
    navigate("/auth"); 
  };

  return (
    <div className="home-container">
      <HeroSection
        title="Recipe Generator"
        tagline="Create personalized recipes tailored to your taste and dietary needs in seconds"
        backgroundImage="https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1400&q=80"
      />

      <section ref={featuresSectionRef}>
        <FeaturesSection
          title="Why Choose Our Recipe Generator"
          subtitle="Discover the benefits of our smart recipe platform"
        />
      </section>

      <section ref={recipePreviewRef}>
        <RecipePreview />
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Create Your Perfect Meal?</h2>
          <p>
            Join thousands of home cooks who have discovered the joy of
            personalized recipes.
          </p>
          <div className="cta-buttons">
            <Button className="sign-up-btn" onClick={handleSignUpClick}>
              Sign Up Now
            </Button>
            <Button className="learn-more-btn">Learn More</Button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Recipe Generator</h3>
            <p>
              Your personal AI chef for creating delicious, personalized recipes
              tailored to your preferences.
            </p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#recipe-preview" onClick={handleScrollToRecipePreview}>Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#features" onClick={handleScrollToFeatures}>About Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Connect With Us</h3>
            <ul>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;