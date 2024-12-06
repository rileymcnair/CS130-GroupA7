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
import DatePicker from "react-multi-date-picker";

/**
 * WorkoutDialog component provides a form to generate a workout by selecting dates, body parts to focus on,
 * total workout minutes, and average calories burned.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open or not.
 * @param {function} props.handleClose - Function to close the dialog.
 * @param {function} props.handleGenerateWorkout - Function to handle the workout generation with the input data.
 */
const WorkoutDialog = ({ open, handleClose, handleGenerateWorkout }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [workoutInput, setWorkoutInput] = useState({
    body_parts: "",
    total_minutes: "",
    avg_calories_burned: "",
    body_part_focus: "",
  });

  /**
   * Handles changes to the input fields and updates the workoutInput state.
   * 
   * @param {Object} e - The event object containing the input name and value.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkoutInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles form submission by processing the selected dates and workout data, 
   * then calling the handleGenerateWorkout function.
   */
  const handleSubmit = () => {
    let dates = selectedDates.map((dateObj) => ({
      date: `${dateObj.year}-${dateObj.month.number}-${dateObj.day}`,
      day: dateObj.weekDay.name,
    }));

    handleGenerateWorkout({ ...workoutInput, dates });
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
          <label>Dates</label>
          <DatePicker
            style={{ width: "100%" }}
            multiple
            value={selectedDates}
            onChange={setSelectedDates}
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
