import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/UI/Home";
import Dashboard from "./components/UI/Dashboard";
import RecipeDetail from "./components/Generator/RecipeDetail";
import SignINandSignUP from "./components/LogIn/SignINandSignUP";
import SavedRecipes from "./components/Generator/SaveRecipe";
import ProfilePage from "./components/UI/ProfilePage";
import Header from "./components/Generator/Header";
import ForgotPasswordForm from "./components/LogIn/ForgotPasswordForm"; 
import ResetPasswordForm from "./components/LogIn/ResetPasswordForm";
import DailyHomePage from "./components/Daily/DailyHomePage";
import AllergySelector from "./components/Daily/AllergySelector";
import MealTypeSelector from "./components/Daily/MealTypeSelector";
import RecipeDisplay from "./components/Daily/RecipeDisplay";
import RecipeGenerator from "./components/Daily/RecipeGenerator";
import MealPlan from "./components/MealPlanner/MealPlan"; 
import MealCard from "./components/MealPlanner/MealCard"; 


import "./App.css";

function App() {
  const [userName, setUserName] = useState("Guest User");

  useEffect(() => {
    const storedUser = localStorage.getItem("full_name");
    if (storedUser) {
      setUserName(storedUser);
    }
  }, []);

  return (
    <Router>
      <AppContent userName={userName} setUserName={setUserName} />
    </Router>
  );
}

function AppContent({ userName, setUserName }) {
  const location = useLocation();
  
  const authPaths = ["/", "/auth", "/forgot-password", "/reset-password"];
  const hideHeader = authPaths.includes(location.pathname);

  return (
    <div className="App">
      {!hideHeader && <Header userName={userName} setUserName={setUserName} />}

      <Routes>
        <Route path="/" element={<Home userName={userName} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recipe/:recipeNumber" element={<RecipeDetail fullName={userName} />} />
        <Route path="/auth" element={<SignINandSignUP setUserName={setUserName} />} />
        <Route path="/saved-recipes" element={<SavedRecipes userName={userName} />} />
        <Route path="/profile" element={<ProfilePage userName={userName} />} />
        <Route path="/daily" element={<DailyHomePage />} />
        <Route path="/meal-plan" element={<MealPlan />} />

                <Route 
          path="/forgot-password" 
          element={<ForgotPasswordForm />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPasswordForm />} 
        />
      </Routes>
    </div>
  );
}

export default App;