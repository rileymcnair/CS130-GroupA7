import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

/**
 * AddWorkoutDialog is a dialog that allows users to add a new favorite workout
 * with details such as name, focus area, total minutes, and exercises. The user
 * can also add multiple exercises with specific details like reps, sets, and calories burned.
 * The dialog provides input fields for all workout and exercise attributes and
 * allows the user to submit the new workout or cancel the action.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Controls whether the dialog is open or closed.
 * @param {Function} props.handleClose - Function to close the dialog.
 * @param {Object} props.newWorkout - The current state of the new workout being added.
 * @param {Function} props.setNewWorkout - Function to update the newWorkout state.
 * @param {Function} props.handleExerciseChange - Function to handle changes to exercise details.
 * @param {Function} props.handleAddExercise - Function to add a new exercise to the workout.
 * @param {Function} props.handleSubmit - Function to handle the submission of the new workout.
 */
const AddWorkoutDialog = ({
  open,
  handleClose,
  newWorkout,
  setNewWorkout,
  handleExerciseChange,
  handleAddExercise,
  handleSubmit,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Favorite Workout</DialogTitle>
      <DialogContent>
        {/* Workout Name */}
        <TextField
          label="Name"
          name="name"
          value={newWorkout.name}
          onChange={(e) =>
            setNewWorkout({ ...newWorkout, name: e.target.value })
          }
          fullWidth
          margin="normal"
        />
        
        {/* Body Part Focus */}
        <TextField
          label="Focus"
          name="body_part_focus"
          value={newWorkout.body_part_focus}
          onChange={(e) =>
            setNewWorkout({ ...newWorkout, body_part_focus: e.target.value })
          }
          fullWidth
          margin="normal"
        />
        
        {/* Total Minutes */}
        <TextField
          label="Total Minutes"
          name="total_minutes"
          value={newWorkout.total_minutes}
          onChange={(e) =>
            setNewWorkout({ ...newWorkout, total_minutes: e.target.value })
          }
          fullWidth
          margin="normal"
        />
        
        <Typography variant="h6" gutterBottom>
          Exercises
        </Typography>
        
        {/* Render each exercise in the workout */}
        {newWorkout.exercises.map((exercise, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            {/* Exercise Name */}
            <TextField
              label="Name"
              name="name"
              value={exercise.name}
              onChange={(e) =>
                handleExerciseChange(index, "name", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            
            {/* Exercise Description */}
            <TextField
              label="Description"
              name="description"
              value={exercise.description}
              onChange={(e) =>
                handleExerciseChange(index, "description", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            
            {/* Avg Calories Burned */}
            <TextField
              label="Avg Calories Burned"
              name="avg_calories_burned"
              value={exercise.avg_calories_burned}
              onChange={(e) =>
                handleExerciseChange(
                  index,
                  "avg_calories_burned",
                  e.target.value,
                )
              }
              fullWidth
              margin="normal"
            />
            
            {/* Body Parts Focus */}
            <TextField
              label="Body Parts (comma-separated)"
              name="body_parts"
              value={exercise.body_parts}
              onChange={(e) =>
                handleExerciseChange(index, "body_parts", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            
            {/* Reps */}
            <TextField
              label="Reps"
              name="reps"
              value={exercise.reps}
              onChange={(e) =>
                handleExerciseChange(index, "reps", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            
            {/* Sets */}
            <TextField
              label="Sets"
              name="sets"
              value={exercise.sets}
              onChange={(e) =>
                handleExerciseChange(index, "sets", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            
            {/* Weight (kg) */}
            <TextField
              label="Weight (kg)"
              name="weight"
              value={exercise.weight}
              onChange={(e) =>
                handleExerciseChange(index, "weight", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            
            {/* Divider between exercises */}
            {index < newWorkout.exercises.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
        
        {/* Button to add more exercises */}
        <Button
          onClick={handleAddExercise}
          startIcon={<AddIcon />}
          color="primary"
        >
          Add Exercise
        </Button>
      </DialogContent>
      
      {/* Dialog Actions: Cancel or Submit */}
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Add Workout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWorkoutDialog;
