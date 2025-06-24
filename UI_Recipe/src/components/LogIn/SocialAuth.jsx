import React from "react";
import "./SocialAuth.css";

const SocialAuth = () => {
  return (
    <div className="social-auth-container">
      
      <p className="terms-text">
        By continuing, you agree to our{" "}
        <a href="/terms-of-service" className="terms-link"> 
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy-policy" className="terms-link"> 
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default SocialAuth;