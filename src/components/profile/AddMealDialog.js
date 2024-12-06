import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

/**
 * AddMealDialog is a dialog component that allows users to add a new favorite meal.
 * It includes input fields for the meal's name, nutritional information (calories, carbs, fats, proteins),
 * type (e.g., breakfast, lunch), and ingredients. The user can submit or cancel the addition of the meal.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Controls whether the dialog is open or closed.
 * @param {Function} props.handleClose - Function to close the dialog.
 * @param {Object} props.newMeal - The current state of the new meal being added.
 * @param {Function} props.setNewMeal - Function to update the newMeal state.
 * @param {Function} props.handleSubmit - Function to handle the submission of the new meal.
 */
const AddMealDialog = ({
  open,
  handleClose,
  newMeal,
  setNewMeal,
  handleSubmit,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Favorite Meal</DialogTitle>
      <DialogContent>
        {/* Meal Name */}
        <TextField
          label="Name"
          name="name"
          value={newMeal.name}
          onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        
        {/* Calories */}
        <TextField
          label="Calories"
          name="calories"
          value={newMeal.calories}
          onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
          fullWidth
          margin="normal"
        />
        
        {/* Carbs (g) */}
        <TextField
          label="Carbs (g)"
          name="carbs"
          value={newMeal.carbs}
          onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
          fullWidth
          margin="normal"
        />
        
        {/* Fats (g) */}
        <TextField
          label="Fats (g)"
          name="fats"
          value={newMeal.fats}
          onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })}
          fullWidth
          margin="normal"
        />
        
        {/* Proteins (g) */}
        <TextField
          label="Proteins (g)"
          name="proteins"
          value={newMeal.proteins}
          onChange={(e) => setNewMeal({ ...newMeal, proteins: e.target.value })}
          fullWidth
          margin="normal"
        />
        
        {/* Meal Type (e.g., Breakfast, Lunch) */}
        <TextField
          label="Type"
          name="type"
          value={newMeal.type}
          onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
          fullWidth
          margin="normal"
        />
        
        {/* Ingredients (comma-separated) */}
        <TextField
          label="Ingredients (comma-separated)"
          name="ingredients"
          value={newMeal.ingredients}
          onChange={(e) =>
            setNewMeal({ ...newMeal, ingredients: e.target.value })
          }
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Add Meal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMealDialog;
