import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, BoxContent } from "@/components/buttons/Box"; 
import AuthTabs from "../buttons/AuthTabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import SocialAuth from "./SocialAuth";
import ForgotPasswordForm from "./ForgotPasswordForm";
import "./AuthContainer.css";

const AuthContainer = ({
  initialTab = "login",
  onLogin = () => {},
  onSignup = () => {},
  onSocialAuth = () => {},
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowForgotPassword(false);
  };

  const handleForgotPassword = () => setShowForgotPassword(true);
  const handleBackToLogin = () => setShowForgotPassword(false);

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Box className="auth-card">
        <BoxContent className="auth-card-content">
          <div className="auth-logo-container">
            <div className="auth-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="auth-logo-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ForgotPasswordForm onCancel={handleBackToLogin} isOpen={true} />
              </motion.div>
            ) : (
              <motion.div
                key="auth-forms"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />

                <div className="auth-form">
                  <AnimatePresence mode="wait">
                    {activeTab === "login" ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LoginForm
                          onSubmit={onLogin}
                          onForgotPassword={handleForgotPassword}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SignupForm onSubmit={onSignup} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="auth-social">
                  <SocialAuth
                    onSocialAuth={onSocialAuth}
                    isSignUp={activeTab === "signup"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </BoxContent>
      </Box>
    </motion.div>
  );
};

export default AuthContainer;
