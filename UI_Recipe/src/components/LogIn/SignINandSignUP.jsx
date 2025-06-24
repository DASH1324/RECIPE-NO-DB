import React, { useState } from "react";
import { motion } from "framer-motion";
import AuthContainer from "./AuthContainer";
import "./SignINandSignUp.css";

const HomePage = () => {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    user: null,
  });

  const handleLogin = (values) => {
    console.log("Login submitted:", values);
    setTimeout(() => {
      setAuthStatus({
        isAuthenticated: true,
        user: { email: values.email, name: "User" },
      });
    }, 1500);
  };

  const handleSignup = (values) => {
    console.log("Signup submitted:", values);
    setTimeout(() => {
      setAuthStatus({
        isAuthenticated: true,
        user: { email: values.email, name: values.name },
      });
    }, 1500);
  };

  const handleSocialAuth = (provider) => {
    console.log(`Social auth with ${provider}`);
    setTimeout(() => {
      setAuthStatus({
        isAuthenticated: true,
        user: { email: "user@example.com", name: "Social User", provider },
      });
    }, 1500);
  };

  const handleLogout = () => {
    setAuthStatus({ isAuthenticated: false, user: null });
  };

  return (
    <div className="homepage-container">
      {authStatus.isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-success-box"
        >
          <div className="success-content">
            <div className="success-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2>Welcome, {authStatus.user?.name}!</h2>
            <p>{authStatus.user?.email}</p>
            {authStatus.user?.provider && (
              <p className="provider-info">
                Logged in with {authStatus.user.provider}
              </p>
            )}
            <button onClick={handleLogout} className="signout-btn">
              Sign Out
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="intro-text">
            <h1>Welcome to Our App</h1>
            <p>Sign in to your account or create a new one</p>
          </div>
          <AuthContainer
            onLogin={handleLogin}
            onSignup={handleSignup}
            onSocialAuth={handleSocialAuth}
          />
        </>
      )}
    </div>
  );
};

export default HomePage;
