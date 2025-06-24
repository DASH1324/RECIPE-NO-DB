import React, { useState, useEffect } from "react";
import { Upload, Plus, X, Search, AlertTriangle } from "lucide-react";
import Tesseract from "tesseract.js";
import Modal from "react-modal"; // <-- NEW: Import the modal component

import AIGenerationLoader from "./AIGenerationLoader";
import RecipeResults from "./RecipeResults";
import AllergySelector from "../Daily/AllergySelector";
import "./IngredientInput.css";

// --- NEW: Set the app element for accessibility ---
// This line is important for screen readers. Place it outside your component.
Modal.setAppElement('#root'); // Assuming your root div has an id of 'root'

const IngredientInput = ({ onImageUpload }) => {
  // --- Existing State ---
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [attemptedSearch, setAttemptedSearch] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  // --- NEW: State for Modal and Allergies ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAllergies, setUserAllergies] = useState([]); // Permanent state
  const [modalAllergies, setModalAllergies] = useState([]); // Temporary state for the modal

  // Keep all your existing functions (handleAddIngredient, handleKeyDown, etc.)
  // ...
  const handleAddIngredient = () => { if (inputValue.trim()) { setIngredients([...ingredients, inputValue.trim()]); setInputValue(""); } };
  const handleKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); handleAddIngredient(); } };
  const handleRemoveIngredient = (index) => { const newIngredients = [...ingredients]; newIngredients.splice(index, 1); setIngredients(newIngredients); };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const { data: { text } } = await Tesseract.recognize(file, "eng");
        const extractedIngredients = text.split(/[\n,]+/).map((item) => item.trim().toLowerCase()).filter((item) => item.length > 0);
        setIngredients((prev) => [...prev, ...extractedIngredients]);
        if (onImageUpload) onImageUpload(file);
      } catch (err) {
        console.error("OCR error:", err);
        setError("Failed to extract text from the image.");
      } finally {
        setIsUploading(false);
      }
    }
  };
  useEffect(() => {
    let timer;
    if (isGenerating) {
      setCurrentProgress(0);
      timer = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 99) return 99;
          const increment = Math.floor(Math.random() * 5) + 2;
          return Math.min(prev + increment, 99);
        });
      }, 350);
    } else {
      clearInterval(timer);
      if (attemptedSearch && !error) setCurrentProgress(100);
      else setCurrentProgress(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating, attemptedSearch, recipes, error]);


  /**
   * NEW: This function now only opens the modal.
   */
  const handleOpenModal = () => {
    if (ingredients.length > 0) {
      // Pre-populate modal with previously selected allergies
      setModalAllergies(userAllergies);
      setIsModalOpen(true);
    }
  };

  /**
   * NEW: This function closes the modal.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * REVISED: This is the core API call logic, now separated.
   * It takes the final allergies as an argument.
   */
  const fetchRecipes = async (allergiesToSubmit) => {
    setIsGenerating(true);
    setError(null);
    setRecipes([]);
    setAttemptedSearch(true);

    try {
      const response = await fetch("https://recipe-no-db.onrender.com/recipes/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredients,
          allergies: allergiesToSubmit, // Use the submitted allergies
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch recipes.");
      }

      const data = await response.json();
      setRecipes(data.results || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError(error.message || "An unexpected error occurred.");
      setRecipes([]);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * NEW: This function is called when the user confirms their choices in the modal.
   */
  const handleConfirmAndSubmit = () => {
    // Persist the selection for the next time the modal is opened
    setUserAllergies(modalAllergies);
    // Close the modal
    handleCloseModal();
    // NOW, we call the API with the confirmed allergies
    fetchRecipes(modalAllergies);
  };

  const showNoResultsMessage = !isGenerating && attemptedSearch && recipes.length === 0 && !error;
  const showErrorMessage = !isGenerating && attemptedSearch && error;

  return (
    <>
      <div className="ingredient-container">
        {/* ... The top part of your component remains the same ... */}
        <div className="ingredient-header">
          <h2>What ingredients do you have?</h2>
          <p>
            Enter ingredients you have on hand or upload a photo of your list of
            ingredients
          </p>
        </div>
        <div className="ingredient-form">
          {/* ... input, upload, and tags list sections remain the same ... */}
          <div className="input-wrapper">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter ingredients (e.g., chicken, rice)" className="ingredient-input" />
            {inputValue && <button onClick={() => setInputValue("")} className="clear-btn"><X size={16} /></button>}
            <button onClick={handleAddIngredient} className="add-btn"><Plus size={16} /> Add</button>
          </div>
          <div className="upload-buttons">
            <input type="file" accept="image/*" onChange={handleFileChange} hidden id="fileInput" />
            <button className="upload-btn" disabled={isUploading} onClick={() => document.getElementById("fileInput").click()}><Upload size={16} /> {isUploading ? "Processing..." : "Upload Image"}</button>
          </div>
          {ingredients.length > 0 && (
            <div className="ingredient-list">
              <p>Your ingredients:</p>
              <div className="tags">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="tag">{ingredient}<button onClick={() => handleRemoveIngredient(index)} className="remove-btn"><X size={14} /></button></div>
                ))}
              </div>
            </div>
          )}

          {/* REVISED: This button now opens the modal */}
          <button
            onClick={handleOpenModal} // <-- CHANGED
            className="submit-btn"
            disabled={ingredients.length === 0 || isGenerating || isUploading}
          >
            <Search size={16} /> {isGenerating ? "Finding..." : "Find Recipes"}
          </button>
        </div>
      </div>

      {/* --- NEW: MODAL COMPONENT --- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Allergy Selection Modal"
        className="allergy-modal"
        overlayClassName="allergy-modal-overlay"
      >
        <div className="modal-header">
          <h2>Select Your Allergies</h2>
          <button onClick={handleCloseModal} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <p>We'll filter out recipes containing these ingredients.</p>
          <AllergySelector
            selectedAllergies={modalAllergies} // Controlled by modal's temporary state
            onAllergyChange={setModalAllergies} // Updates the temporary state
          />
        </div>
        <div className="modal-footer">
          <button onClick={handleCloseModal} className="modal-btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirmAndSubmit} className="modal-btn-primary">
            Confirm & Find Recipes
          </button>
        </div>
      </Modal>

      {/* ... The rest of your results display logic remains the same ... */}
      {isGenerating && ( <div className="loader-wrapper"><AIGenerationLoader isGenerating={isGenerating} progress={currentProgress} title="Searching for recipes..." description="Our AI is looking for the best matches for your ingredients."/></div>)}
      {showErrorMessage && (<div className="results-section no-results-message error-message"><AlertTriangle size={48} className="no-results-icon error-icon" /><h3>Oops! Something went wrong.</h3><p>{error}</p><p>Please try again later or adjust your ingredients.</p></div>)}
      {showNoResultsMessage && (<div className="results-section no-results-message"><Search size={48} className="no-results-icon" /><h3>No Recipes Found</h3><p>We couldn't find any recipes matching your current ingredients and allergy selections.</p></div>)}
      {!isGenerating && !error && recipes.length > 0 && (<div className="results-section"><h2>Recipe Suggestions</h2><RecipeResults recipes={recipes} /></div>)}
    </>
  );
};

export default IngredientInput;