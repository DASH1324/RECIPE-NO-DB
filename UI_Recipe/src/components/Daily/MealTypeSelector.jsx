import React from "react";
import "./MealTypeSelector.css";

// --- CONVERTED TO JSX ---

/**
 * JSDoc for developers: Defines the props for the MealTypeSelector component.
 * @param {object} props
 * @param {string} props.selectedMealType - The currently selected meal type (e.g., "breakfast").
 * @param {(mealType: string) => void} props.onMealTypeChange - The callback function to execute when a new meal type is chosen.
 */
const MealTypeSelector = ({
  selectedMealType = "breakfast",
  onMealTypeChange = () => {},
}) => { // The ': MealTypeSelectorProps' has been removed from here.
  const mealTypes = ["breakfast", "lunch", "dinner"];

  return (
    <div className="meal-type-selector">
      <div className="meal-type-label">Select meal type:</div>
      <div className="meal-type-buttons">
        {mealTypes.map((mealType) => (
          <button
            key={mealType}
            className={`meal-type-button ${selectedMealType === mealType ? "active" : ""}`}
            onClick={() => onMealTypeChange(mealType)}
          >
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MealTypeSelector;