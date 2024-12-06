import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * MealDetailsDialog is a dialog component for editing meal details.
 * It allows the user to modify meal properties, including name, calories, macros, and ingredients.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines whether the dialog is open.
 * @param {Function} props.onClose - Function to close the dialog.
 * @param {Object} props.meal - The meal data to edit.
 * @param {Function} props.onSave - Function to handle saving the edited meal data.
 */
const MealDetailsDialog = ({ open, onClose, meal, onSave }) => {
  const [editedMeal, setEditedMeal] = useState(meal); // Track the meal's editable state

  /**
   * Handles input field changes and updates the meal state.
   *
   * @param {string} field - The field name to update.
   * @param {string} value - The new value to set.
   */
  const handleInputChange = (field, value) => {
    setEditedMeal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handles changes to an ingredient field at a specific index.
   *
   * @param {number} index - The index of the ingredient to update.
   * @param {string} value - The new value for the ingredient.
   */
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...editedMeal.ingredients];
    updatedIngredients[index] = value;
    setEditedMeal((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }));
  };

  /**
   * Adds a new empty ingredient field.
   */
  const handleAddIngredient = () => {
    setEditedMeal((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""], // Add a new empty ingredient field
    }));
  };

  /**
   * Removes an ingredient field at a specific index.
   *
   * @param {number} index - The index of the ingredient to remove.
   */
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...editedMeal.ingredients];
    updatedIngredients.splice(index, 1); // Remove the ingredient at the specified index
    setEditedMeal((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }));
  };

  /**
   * Handles saving the edited meal and closing the dialog.
   */
  const handleSave = () => {
    onSave(editedMeal); // Pass updated meal back to parent
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Title */}
      <DialogTitle>
        Edit Meal Details
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Meal Name */}
          <TextField
            label="Meal Name"
            value={editedMeal.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            fullWidth
          />

          {/* Calories */}
          <TextField
            label="Calories"
            type="number"
            value={editedMeal.calories}
            onChange={(e) => handleInputChange("calories", e.target.value)}
            fullWidth
          />

          {/* Macros */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Macros
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Proteins (g)"
                type="number"
                value={editedMeal.proteins}
                onChange={(e) => handleInputChange("proteins", e.target.value)}
                fullWidth
              />
              <TextField
                label="Fats (g)"
                type="number"
                value={editedMeal.fats}
                onChange={(e) => handleInputChange("fats", e.target.value)}
                fullWidth
              />
              <TextField
                label="Carbs (g)"
                type="number"
                value={editedMeal.carbs}
                onChange={(e) => handleInputChange("carbs", e.target.value)}
                fullWidth
              />
            </Box>
          </Box>

          {/* Ingredients */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Ingredients
            </Typography>
            {editedMeal.ingredients.map((ingredient, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <TextField
                  label={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(e) =>
                    handleIngredientChange(index, e.target.value)
                  }
                  fullWidth
                />
                <IconButton
                  onClick={() => handleRemoveIngredient(index)}
                  color="error"
                  title="Remove Ingredient"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              onClick={handleAddIngredient}
              variant="outlined"
              startIcon={<AddIcon />}
            >
              Add Ingredient
            </Button>
          </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MealDetailsDialog;
