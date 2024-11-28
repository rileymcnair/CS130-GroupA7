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

const MealDetailsDialog = ({ open, onClose, meal, onSave }) => {
  const [editedMeal, setEditedMeal] = useState(meal); // Track the meal's editable state

  const handleInputChange = (field, value) => {
    setEditedMeal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          <TextField
            label="Ingredients (comma-separated)"
            value={editedMeal.ingredients.join(", ")}
            onChange={(e) =>
              handleInputChange(
                "ingredients",
                e.target.value.split(",").map((i) => i.trim()),
              )
            }
            fullWidth
          />
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
