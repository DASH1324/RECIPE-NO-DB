// src/components/Header/Header.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, User, ChefHat } from "lucide-react";
import { Input } from "../buttons/input";
import { Entry } from "../buttons/Entry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../buttons/dropdown-menu";
import "./Header.css";

const Header = ({ onSearch = () => {}, onProfileClick = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [userName, setUserName] = useState(localStorage.getItem("full_name") || "User");

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("access_token");
      setIsUserLoggedIn(!!token);
      if (token) {
        setUserName(localStorage.getItem("full_name") || "User");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!isUserLoggedIn) {
    return null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSavedRecipesClick = () => {
    navigate("/saved-recipes");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("full_name");
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleHomeClick = () => {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  const handleGeneratorClick = () => {
    navigate("/daily");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleMealPlanClick = () => {
    navigate("/meal-plan");
  };

  return (
    <header className="header">
      <div className="logo" onClick={handleHomeClick}>
        <ChefHat className="icon" />
        <span className="brand-name">Recipe Generator</span>
      </div>

      <form onSubmit={handleSearchSubmit} className="search-bar">
        <Input
          type="text"
          placeholder="Search recipes..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Entry type="submit" variant="ghost" size="icon" className="search-btn">
          <Search className="search-icon" />
        </Entry>
      </form>

      <div className="nav-profile">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="menu-btn">
            <Entry variant="ghost" size="icon">
              <Menu className="menu-icon" />
            </Entry>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleHomeClick}>Home</DropdownMenuItem>
            <DropdownMenuItem onClick={handleGeneratorClick}>Generator</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSavedRecipesClick}>Saved Recipes</DropdownMenuItem>
            <DropdownMenuItem onClick={handleMealPlanClick}>Meal Plan</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="nav-links">
          <Entry variant="ghost" onClick={handleHomeClick}>Home</Entry>
          <Entry variant="ghost" onClick={handleGeneratorClick}>Generator</Entry>
          <Entry variant="ghost" onClick={handleSavedRecipesClick}>Saved Recipes</Entry>
          <Entry variant="ghost" onClick={handleMealPlanClick}>Meal Plan</Entry>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Entry variant="ghost" size="icon" className="user-icon" onClick={onProfileClick}>
              <User className="user-icon-img" />
            </Entry>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
