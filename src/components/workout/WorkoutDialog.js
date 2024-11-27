import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

const WorkoutDialog = ({ open, handleClose, handleGenerateWorkout }) => {
  const [workoutInput, setWorkoutInput] = useState({
    body_parts: "",
    total_minutes: "",
    avg_calories_burned: "",
    body_part_focus: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkoutInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    handleGenerateWorkout(workoutInput);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate Workout</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Body Parts to Focus On"
            name="body_parts"
            value={workoutInput.body_parts}
            onChange={handleInputChange}
            fullWidth
            helperText="Comma-separated (e.g., arms, legs, back)"
          />
          <TextField
            label="Total Minutes"
            name="total_minutes"
            value={workoutInput.total_minutes}
            onChange={handleInputChange}
            type="number"
            fullWidth
          />
          <TextField
            label="Calories to Burn"
            name="avg_calories_burned"
            value={workoutInput.avg_calories_burned}
            onChange={handleInputChange}
            type="number"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Generate Workout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutDialog;
