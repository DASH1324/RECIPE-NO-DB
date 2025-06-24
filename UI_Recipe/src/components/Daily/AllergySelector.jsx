import React from "react";
import "./AllergySelector.css";

/**
 * JSDoc for developers: Defines the props for the AllergySelector component.
 * @param {object} props
 * @param {string[]} props.selectedAllergies - An array of the currently selected allergens.
 * @param {(allergies: string[]) => void} props.onAllergyChange - The callback function to update the list of selected allergies.
 */
const AllergySelector = ({
  selectedAllergies = [],
  onAllergyChange = () => {},
}) => {
  const commonAllergens = [
    "Gluten", "Dairy", "Eggs", "Fish", "Shellfish",
    "Tree Nuts", "Peanuts", "Soy", "Sesame",
  ];

  // Handles toggling the checkboxes for common allergens
  const handleAllergyToggle = (allergen) => {
    const updatedAllergies = selectedAllergies.includes(allergen)
      ? selectedAllergies.filter((a) => a !== allergen)
      : [...selectedAllergies, allergen];
    onAllergyChange(updatedAllergies);
  };

  // Handles changes to the "Others" text input
  const handleOtherInputChange = (event) => {
    const textValue = event.target.value;

    // 1. Get the new custom allergies by splitting the text
    const newCustomAllergies = textValue
      .split(',')
      .map(s => s.trim()) // Remove whitespace
      .filter(s => s.length > 0); // Remove any empty strings

    // 2. Get the currently selected common allergens
    const currentCommonAllergens = selectedAllergies.filter(allergy =>
      commonAllergens.includes(allergy)
    );

    // 3. Combine them to form the new complete list
    const finalAllergies = [...currentCommonAllergens, ...newCustomAllergies];

    // 4. Call the parent component's update function
    onAllergyChange(finalAllergies);
  };

  // Determine the value for the "Others" input field by filtering out common allergens
  const otherAllergiesValue = selectedAllergies
    .filter(allergy => !commonAllergens.includes(allergy))
    .join(', ');

  return (
    <div className="allergy-selector">
      <div className="allergy-header">
        <span className="warning-icon">⚠️</span>
        <h3 className="allergy-title">Do you have any food allergies?</h3>
      </div>
      <div className="allergy-content">
        {/* Checkboxes for common allergens */}
        <div className="allergen-grid">
          {commonAllergens.map((allergen) => (
            <div key={allergen} className="allergen-item">
              <input
                type="checkbox"
                id={allergen}
                checked={selectedAllergies.includes(allergen)}
                onChange={() => handleAllergyToggle(allergen)}
                className="allergen-checkbox"
              />
              <label htmlFor={allergen} className="allergen-label">
                {allergen}
              </label>
            </div>
          ))}
        </div>

        {/* --- Simplified "Others" Input --- */}
        <div className="other-allergy-section">
          <label htmlFor="other-allergies" className="other-allergy-label">
            Other (separate with commas):
          </label>
          <input
            type="text"
            id="other-allergies"
            className="other-allergy-input"
            placeholder="e.g., Mustard, Celery"
            value={otherAllergiesValue}
            onChange={handleOtherInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AllergySelector;