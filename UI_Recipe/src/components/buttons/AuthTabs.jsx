import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarList, BarTrigger } from "./Bar"; // Updated import names
import "./AuthTabs.css";

const AuthTabs = ({ activeTab = "login", onTabChange = () => {} }) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabChange = (value) => {
    setCurrentTab(value);
    onTabChange(value);
  };

  return (
    <div className="auth-tabs-container">
      <Bar value={currentTab} onValueChange={handleTabChange} className="tabs">
        <BarList className="auth-tabs-list">
          <BarTrigger
            value="login"
            className={`auth-tabs-trigger ${
              currentTab === "login" ? "active" : ""
            }`}
          >
            Login
            {currentTab === "login" && (
              <motion.div
                className="auth-tabs-indicator"
                layoutId="tabIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </BarTrigger>
          <BarTrigger
            value="signup"
            className={`auth-tabs-trigger ${
              currentTab === "signup" ? "active" : ""
            }`}
          >
            Sign Up
            {currentTab === "signup" && (
              <motion.div
                className="auth-tabs-indicator"
                layoutId="tabIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </BarTrigger>
        </BarList>
      </Bar>
    </div>
  );
};

export default AuthTabs;
