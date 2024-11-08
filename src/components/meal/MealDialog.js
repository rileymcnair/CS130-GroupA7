import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const MealDialog = ({ open, handleClose, handleGenerateMeal }) => {
  const [newMeal, setNewMeal] = useState({
    type: '',
    diet: '',
    calories: '',
    ingredients: '',
    time: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    handleGenerateMeal({
      type: newMeal.type,
      diet: newMeal.diet,
      calories: newMeal.calories,
      ingredients: newMeal.ingredients.split(',').map((item) => item.trim()),
      time: newMeal.time,
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
