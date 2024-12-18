import React, { useState } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * WorkoutDetailsDialog component allows editing of workout details, including general workout
 * information (name, total minutes, body part focus) and exercise-specific details (name, reps, sets, weight, etc.).
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open or not.
 * @param {function} props.onClose - Function to close the dialog.
 * @param {Object} props.workout - The workout object containing details to be edited.
 * @param {function} props.onSave - Function to handle saving the updated workout details.
 * @param {function} props.onWorkoutChange - Function to handle changes to the main workout details.
 * @param {function} props.onExerciseChange - Function to handle changes to the individual exercise details.
 */
const WorkoutDetailsDialog = ({
  open,
  onClose,
  workout,
  onSave,
  onWorkoutChange,
  onExerciseChange,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handles saving the workout details by calling the onSave function and setting saving state.
   */
  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Edit Workout Details
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Workout-Level Fields */}
          <TextField
            label="Workout Name"
            value={workout.name}
            onChange={(e) => onWorkoutChange("name", e.target.value)}
            fullWidth
          />
          <TextField
            label="Total Minutes"
            type="number"
            value={workout.total_minutes}
            onChange={(e) => onWorkoutChange("total_minutes", e.target.value)}
            fullWidth
          />
          <TextField
            label="Focus"
            value={workout.body_part_focus}
            onChange={(e) => onWorkoutChange("body_part_focus", e.target.value)}
            fullWidth
          />
          <Typography variant="h6">Exercises</Typography>

          {/* Exercise-Level Fields */}
          {workout.exercises.map((exercise, index) => (
            <Box
              key={exercise.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                label="Exercise Name"
                value={exercise.name}
                onChange={(e) =>
                  onExerciseChange(index, "name", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Reps"
                type="number"
                value={exercise.reps}
                onChange={(e) =>
                  onExerciseChange(index, "reps", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Sets"
                type="number"
                value={exercise.sets}
                onChange={(e) =>
                  onExerciseChange(index, "sets", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Weight"
                value={exercise.weight}
                onChange={(e) =>
                  onExerciseChange(index, "weight", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Avg Calories Burned"
                type="number"
                value={exercise.avg_calories_burned}
                onChange={(e) =>
                  onExerciseChange(index, "avg_calories_burned", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Body Parts"
                value={exercise.body_parts}
                onChange={(e) =>
                  onExerciseChange(index, "body_parts", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Description"
                value={exercise.description}
                onChange={(e) =>
                  onExerciseChange(index, "description", e.target.value)
                }
                fullWidth
              />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutDetailsDialog;
