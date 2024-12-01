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
        {newWorkout.exercises.map((exercise, index) => (
          <Box key={index} sx={{ mb: 2 }}>
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
            {index < newWorkout.exercises.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
        <Button
          onClick={handleAddExercise}
          startIcon={<AddIcon />}
          color="primary"
        >
          Add Exercise
        </Button>
      </DialogContent>
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
