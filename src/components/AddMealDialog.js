import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const AddMealDialog = ({ open, handleClose, newMeal, setNewMeal, handleSubmit }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Favorite Meal</DialogTitle>
      <DialogContent>
        <TextField label="Calories" name="calories" value={newMeal.calories} onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })} fullWidth margin="normal" />
        <TextField label="Carbs (g)" name="carbs" value={newMeal.carbs} onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })} fullWidth margin="normal" />
        <TextField label="Fats (g)" name="fats" value={newMeal.fats} onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })} fullWidth margin="normal" />
        <TextField label="Proteins (g)" name="proteins" value={newMeal.proteins} onChange={(e) => setNewMeal({ ...newMeal, proteins: e.target.value })} fullWidth margin="normal" />
        <TextField label="Type" name="type" value={newMeal.type} onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })} fullWidth margin="normal" />
        <TextField label="Ingredients (comma-separated)" name="ingredients" value={newMeal.ingredients} onChange={(e) => setNewMeal({ ...newMeal, ingredients: e.target.value })} fullWidth margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Add Meal</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMealDialog;
