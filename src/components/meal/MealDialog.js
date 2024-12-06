import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import DatePicker from "react-multi-date-picker";

/**
 * MealDialog is a dialog component for generating a new meal.
 * It allows the user to input meal details such as type, diet, calories, ingredients,
 * time available, and select dates for the meal.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines whether the dialog is open.
 * @param {Function} props.handleClose - Function to close the dialog.
 * @param {Function} props.handleGenerateMeal - Function to handle the meal generation after form submission.
 */
const MealDialog = ({ open, handleClose, handleGenerateMeal }) => {
  const [selectedDates, setSelectedDates] = useState([]);

  const [newMeal, setNewMeal] = useState({
    type: "",
    diet: "",
    calories: "",
    ingredients: "",
    time: "",
  });

  /**
   * Handles input field changes and updates the meal state.
   * 
   * @param {Object} e - The event object.
   * @param {string} e.target.name - The name of the input field being changed.
   * @param {string} e.target.value - The new value of the input field.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles form submission, prepares meal data, and calls the generate meal handler.
   */
  const handleSubmit = () => {
    let dates = selectedDates.map((dateObj) => ({
      date: `${dateObj.year}-${dateObj.month.number}-${dateObj.day}`,
      day: dateObj.weekDay.name,
    }));
    handleGenerateMeal({
      type: newMeal.type,
      diet: newMeal.diet,
      calories: newMeal.calories,
      ingredients: newMeal.ingredients.split(",").map((item) => item.trim()),
      time: newMeal.time,
      dates: dates,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Generate Meal</DialogTitle>
      <DialogContent>
        <TextField
          label="Type of Meal"
          name="type"
          value={newMeal.type}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Dietary Preference"
          name="diet"
          value={newMeal.diet}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Calorie Range"
          name="calories"
          value={newMeal.calories}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Ingredients (comma-separated)"
          name="ingredients"
          value={newMeal.ingredients}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Time Available (minutes)"
          name="time"
          value={newMeal.time}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <label>Dates</label>
        <DatePicker
          style={{ width: "100%" }}
          multiple
          value={selectedDates}
          onChange={setSelectedDates}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Generate Meal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MealDialog;
