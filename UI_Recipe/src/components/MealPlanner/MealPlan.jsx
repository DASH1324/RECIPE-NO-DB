import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/folder/Card";
import { Button } from "@/components/folder/button";
import { Badge } from "@/components/folder/Badge";
import {
  Calendar,
  ChefHat,
  Clock,
  Plus,
  RotateCcw,
  UtensilsCrossed,
  CookingPot,
  ListChecks,
  X,
  FileDown,
} from "lucide-react";
import "./MealPlan.css";

// Helper function to convert image URL to Base64 Data URI for jsPDF.
const getImageDataUri = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok for image: ${url}`);
      }
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (error) {
        console.error("CORS or network error fetching image:", error);
        reject(new Error("Could not load image for PDF."));
    }
  });
};

// -------------------------------------------------------------
// 1. Meal Detail Modal (No changes)
// -------------------------------------------------------------
const MealDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;
  const handleContentClick = (e) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <button className="modal-close-button" onClick={onClose}><X size={24} /></button>
        <img src={recipe.image} alt={recipe.title} className="modal-image" />
        <div className="modal-body">
          <h2 className="modal-title">{recipe.title}</h2>
          <div className="modal-details">
            <Badge variant="outline"><Clock className="icon-tiny" /> {recipe.prepTime} min</Badge>
            <Badge variant="outline"><ChefHat className="icon-tiny" /> {recipe.difficulty}</Badge>
            <Badge variant="outline"><UtensilsCrossed className="icon-tiny" /> {recipe.cuisineType}</Badge>
          </div>
          <div className="modal-section">
            <h3><ListChecks className="icon-small" /> Ingredients</h3>
            <ul>{recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}</ul>
          </div>
          <div className="modal-section">
            <h3><CookingPot className="icon-small" /> Instructions</h3>
            <ol>{recipe.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. Add Meal Modal (No changes)
// -------------------------------------------------------------
const AddMealModal = ({ mealInfo, onClose, onAddMeal }) => {
  const [formData, setFormData] = useState({
    title: "", prepTime: "", difficulty: "Easy", cuisineType: "", image: "", ingredients: "", instructions: "",
  });

  useEffect(() => {
    return () => { if (formData.image && formData.image.startsWith('blob:')) { URL.revokeObjectURL(formData.image); } };
  }, [formData.image]);

  if (!mealInfo) { return null; }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      if (formData.image && formData.image.startsWith('blob:')) { URL.revokeObjectURL(formData.image); }
      const newImageURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: newImageURL }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecipe = {
      id: `recipe-${Date.now()}`, title: formData.title, prepTime: parseInt(formData.prepTime, 10) || 0, difficulty: formData.difficulty, cuisineType: formData.cuisineType, image: formData.image, ingredients: formData.ingredients.split('\n').filter(line => line.trim() !== ''), instructions: formData.instructions.split('\n').filter(line => line.trim() !== ''),
    };
    onAddMeal({
      id: `meal-${Date.now()}`, day: mealInfo.day, mealType: mealInfo.mealType, recipe: newRecipe,
    });
    onClose();
  };

  const handleContentClick = (e) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-meal-modal" onClick={handleContentClick}>
        <button className="modal-close-button" onClick={onClose}><X size={24} /></button>
        <div className="modal-body">
          <h2 className="modal-title">Add Meal for {mealInfo.day}</h2>
          <Badge variant="secondary" className="mb-4">{mealInfo.mealType}</Badge>
          <form onSubmit={handleSubmit} className="add-meal-form">
            <div className="form-group"><label htmlFor="title">Recipe Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required /></div>
            <div className="form-grid">
              <div className="form-group"><label htmlFor="prepTime">Prep Time (min)</label><input type="number" id="prepTime" name="prepTime" value={formData.prepTime} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="difficulty">Difficulty</label><select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
            </div>
            <div className="form-group"><label htmlFor="cuisineType">Cuisine Type</label><input type="text" id="cuisineType" name="cuisineType" value={formData.cuisineType} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="image">Upload Image</label><input type="file" id="image" name="image" onChange={handleChange} accept="image/*" /></div>
            {formData.image && (<div className="image-preview-container"><img src={formData.image} alt="Preview" className="image-preview" /></div>)}
            <div className="form-group"><label htmlFor="ingredients">Ingredients (one per line)</label><textarea id="ingredients" name="ingredients" value={formData.ingredients} onChange={handleChange} rows="4"></textarea></div>
            <div className="form-group"><label htmlFor="instructions">Instructions (one per line)</label><textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleChange} rows="5"></textarea></div>
            <Button type="submit" className="w-full mt-4">Save Meal</Button>
          </form>
        </div>
      </div>
    </div>
  );
};


const ALLERGENS = ["Dairy", "Eggs", "Peanuts", "Tree Nuts", "Soy", "Wheat", "Fish", "Shellfish", "Gluten"];

// -------------------------------------------------------------
// 3. Allergy Selection Modal (No changes)
// -------------------------------------------------------------
const AllergySelectionModal = ({ isOpen, onClose, onSave, initialAllergies }) => {
  const [selected, setSelected] = useState(initialAllergies);
  const [otherInput, setOtherInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected(initialAllergies);
    }
  }, [isOpen, initialAllergies]);

  if (!isOpen) return null;

  const handleTogglePredefined = (allergy) => {
    setSelected(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleAddOther = () => {
    const trimmedInput = otherInput.trim();
    if (trimmedInput && !selected.find(s => s.toLowerCase() === trimmedInput.toLowerCase())) {
      setSelected(prev => [...prev, trimmedInput]);
    }
    setOtherInput("");
  };

  const handleRemove = (allergyToRemove) => {
    setSelected(prev => prev.filter(a => a !== allergyToRemove));
  };

  const handleSave = () => {
    onSave(selected);
  };

  const handleContentClick = (e) => e.stopPropagation();

  const customSelected = selected.filter(a => !ALLERGENS.includes(a));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content allergy-modal" onClick={handleContentClick}>
        <button className="modal-close-button" onClick={onClose}><X size={24} /></button>
        <div className="modal-body">
          <h2 className="modal-title">Select Allergies to Avoid</h2>
          <p className="modal-subtitle">Select from the list below or add your own.</p>

          <div className="allergy-section">
            <h3 className="allergy-section-title">Common Allergens</h3>
            <div className="allergy-buttons">
              {ALLERGENS.map((allergy) => (
                <Button key={allergy} variant={selected.includes(allergy) ? 'default' : 'outline'} size="sm" onClick={() => handleTogglePredefined(allergy)} className="allergy-button">
                  {allergy}
                </Button>
              ))}
            </div>
          </div>

          <div className="allergy-section">
            <h3 className="allergy-section-title">Other Allergies</h3>
            <div className="other-allergy-input-group">
              <input type="text" placeholder="e.g., Sesame" value={otherInput} onChange={(e) => setOtherInput(e.target.value)} className="other-allergy-input" />
              <Button onClick={handleAddOther} disabled={!otherInput.trim()}>Add</Button>
            </div>
            {customSelected.length > 0 && (
              <div className="custom-allergy-tags">
                {customSelected.map(allergy => (
                  <Badge key={allergy} variant="secondary" className="custom-allergy-tag">
                    {allergy}
                    <button onClick={() => handleRemove(allergy)} className="remove-tag-button">
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Apply Selections</Button>
          </div>
        </div>
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// 4. The main MealPlan component (UPDATED)
// -------------------------------------------------------------
const MealPlan = ({ weekStartDate = new Date() }) => {
  const [currentWeek] = useState(weekStartDate);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealToAdd, setMealToAdd] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [mealPlan, setMealPlan] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];
  
  const handleSaveAllergies = (newAllergies) => {
    setAllergies(newAllergies);
    setIsAllergyModalOpen(false);
  };

  const handleGenerateNewPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/mealplan/generate-plan", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergies: allergies }), 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const newPlan = await response.json();
      setMealPlan(newPlan);
    } catch (error) {
      console.error("Failed to generate new meal plan:", error);
      alert(`Error generating plan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsPdf = async () => {
    if (mealPlan.length === 0) {
      alert("Please generate a meal plan first.");
      return;
    }
    setIsSavingPdf(true);
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const addHeader = () => {
      doc.setFontSize(16).setFont(undefined, 'bold');
      doc.text(" One Week Meal Plan", pageWidth / 2, margin, { align: 'center' });
      doc.setDrawColor(200);
      doc.line(margin, margin + 5, pageWidth - margin, margin + 5);
      return margin + 10; 
    };

    try {
      let y = addHeader();
      let dayIndex = 0;
      for (const day of daysOfWeek) {
        if (dayIndex > 0) {
          doc.addPage();
          y = addHeader();
        }
        
        doc.setFontSize(20).setFont(undefined, 'bold');
        doc.text(day, pageWidth / 2, y, { align: "center" });
        y += 15;

        for (const mealType of mealTypes) {
          const meal = mealPlan.find(m => m.day === day && m.mealType === mealType);
          
          if (meal && meal.recipe) {
            const { recipe } = meal;
            const textHeightForMeal = 80 + (recipe.ingredients.length * 4) + (recipe.instructions.length * 4);
            if (y + textHeightForMeal > pageHeight - margin) {
                doc.addPage();
                y = addHeader();
                doc.setFontSize(20).setFont(undefined, 'bold');
                doc.text(`${day} (continued)`, pageWidth / 2, y, { align: 'center' });
                y += 15;
            }

            const blockStartY = y;
            const imageX = margin;
            const imageY = blockStartY;
            const imageWidth = 45;
            const imageHeight = 45;
            const imageBottomY = imageY + imageHeight;
            try {
              const imageData = await getImageDataUri(recipe.image);
              doc.addImage(imageData, 'JPEG', imageX, imageY, imageWidth, imageHeight, '', 'FAST');
            } catch (imgError) {
              doc.setFontSize(8).setTextColor(150);
              doc.text("Image not available", imageX + 10, imageY + 22);
              doc.setTextColor(0);
            }

            let textY = blockStartY;
            const textX = imageX + imageWidth + 5;
            const textWidth = pageWidth - textX - margin;
            doc.setFontSize(14).setFont(undefined, 'bold');
            doc.text(mealType, textX, textY);
            textY += 6;
            doc.setFontSize(12).setFont(undefined, 'bold');
            const titleLines = doc.splitTextToSize(recipe.title, textWidth);
            doc.text(titleLines, textX, textY);
            textY += titleLines.length * 5 + 4;
            doc.setFontSize(9).setFont(undefined, 'normal');
            const detailsText = `Prep: ${recipe.prepTime} min | Difficulty: ${recipe.difficulty} | Cuisine: ${recipe.cuisineType}`;
            doc.text(detailsText, textX, textY);
            textY += 8;
            doc.setFontSize(11).setFont(undefined, 'bold');
            doc.text("Ingredients:", textX, textY);
            textY += 5;
            doc.setFontSize(9).setFont(undefined, 'normal');
            recipe.ingredients.forEach(item => {
              const itemLines = doc.splitTextToSize(`• ${item}`, textWidth);
              if (textY + (itemLines.length * 4) > pageHeight - margin) {
                doc.addPage();
                textY = addHeader();
              }
              doc.text(itemLines, textX, textY);
              textY += itemLines.length * 4;
            });
            textY += 6;
            doc.setFontSize(11).setFont(undefined, 'bold');
            doc.text("Instructions:", textX, textY);
            textY += 5;
            doc.setFontSize(9).setFont(undefined, 'normal');
            recipe.instructions.forEach((step, index) => {
              const stepLines = doc.splitTextToSize(`${index + 1}. ${step}`, textWidth);
               if (textY + (stepLines.length * 4) > pageHeight - margin) {
                doc.addPage();
                textY = addHeader();
              }
              doc.text(stepLines, textX, textY);
              textY += stepLines.length * 4;
            });
            y = Math.max(imageBottomY, textY) + 10;
          }
        }
        dayIndex++;
      }
      doc.save("weekly-meal-plan.pdf");
    } catch (error) {
      console.error("Error creating PDF:", error);
      alert("Could not create PDF. See console for details.");
    } finally {
      setIsSavingPdf(false);
    }
  };

  const handleOpenDetailModal = (recipe) => setSelectedMeal(recipe);
  const handleCloseDetailModal = () => setSelectedMeal(null);
  const handleOpenAddModal = (day, mealType) => setMealToAdd({ day, mealType });
  const handleCloseAddModal = () => setMealToAdd(null);
  
  const handleAddNewMeal = (newMeal) => {
    setMealPlan((prevPlan) => [...prevPlan, newMeal]);
    setMealToAdd(null);
  };
  
  const handleRemoveMeal = (mealIdToRemove) => {
    setMealPlan((prevPlan) => prevPlan.filter((meal) => meal.id !== mealIdToRemove));
  };
  
  const getMealsForDay = (day) =>
    mealTypes.map((mealType) => {
      const meal = mealPlan.find(m => m.day === day && m.mealType === mealType);
      return { mealType, meal };
    });

  const formatWeekRange = (date) => {
    const start = new Date(date), end = new Date(date);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <>
      <div className="meal-plan-container">
        <div className="meal-plan-header">
          <div className="meal-plan-title">
            <Calendar className="icon" />
            <div>
              <h2>Weekly Meal Plan</h2>
              <p>{formatWeekRange(currentWeek)}</p>
            </div>
          </div>
          
          <div className="meal-plan-actions">
             {/* --- NEW: Allergy Button with Count Badge --- */}
            <Button
              variant="outline"
              onClick={() => setIsAllergyModalOpen(true)}
              disabled={isLoading || isSavingPdf}
            >
              <ListChecks className="icon-small" />
              Allergies
              {allergies.length > 0 && (
                <Badge variant="secondary" className="allergy-count-badge">
                  {allergies.length}
                </Badge>
              )}
            </Button>

            <Button variant="outline" onClick={handleSaveAsPdf} disabled={isSavingPdf || isLoading}>
              <FileDown className={`icon-small ${isSavingPdf ? 'animate-pulse' : ''}`} />
              {isSavingPdf ? 'Saving...' : 'Save as PDF'}
            </Button>

            <Button variant="default" onClick={handleGenerateNewPlan} disabled={isLoading || isSavingPdf}>
              <RotateCcw className={`icon-small ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Generating...' : 'Generate New Plan'}
            </Button>
          </div>
        </div>

        <div className="meal-grid">
          {daysOfWeek.map((day) => {
            const dayMeals = getMealsForDay(day);
            return (
              <Card key={day} className="day-card">
                <CardHeader className="pb-3"><CardTitle className="day-title">{day}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {dayMeals.map(({ mealType, meal }) => (
                    <div key={mealType} className="meal-item">
                      <div className="meal-badge"><Badge variant="secondary">{mealType}</Badge></div>
                      {meal ? (
                        <div className="meal-card" onClick={() => handleOpenDetailModal(meal.recipe)}>
                          <button
                            className="remove-meal-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMeal(meal.id);
                            }}
                          >
                            <X size={16} />
                          </button>
                          <img src={meal.recipe.image} alt={meal.recipe.title} />
                          <div>
                            <h4>{meal.recipe.title}</h4>
                            <div className="meal-info">
                              <Clock className="icon-tiny" /><span>{meal.recipe.prepTime} min</span>
                              <ChefHat className="icon-tiny" /><span>{meal.recipe.difficulty}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button variant="dashed" className="add-button" onClick={() => handleOpenAddModal(day, mealType)}><Plus className="icon-small" />Add {mealType}</Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <MealDetailModal recipe={selectedMeal} onClose={handleCloseDetailModal} />
      <AddMealModal mealInfo={mealToAdd} onClose={handleCloseAddModal} onAddMeal={handleAddNewMeal} />
      <AllergySelectionModal
        isOpen={isAllergyModalOpen}
        onClose={() => setIsAllergyModalOpen(false)}
        onSave={handleSaveAllergies}
        initialAllergies={allergies}
      />
    </>
  );
};

export default MealPlan;